const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const socketModule = require('../socket');
const mongoose = require('mongoose');

// participants is an array of ObjectIds. Mongoose's document arrays do cast the
// argument on .includes(), so includes(req.user.id) happens to work today, but
// that silently stops being true the moment the array is .lean()'d or populated.
// Compare stringified ids so the check doesn't depend on that.
const isParticipant = (conversation, userId) =>
    conversation.participants.some((participant) => (participant?._id ?? participant).toString() === userId);

const getMyConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
        .populate('participants', 'name email role profileImage')
        .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const before = req.query.before ? new Date(req.query.before) : null;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        // Verify participant
        if (!isParticipant(conversation, req.user.id)) {
            return res.status(403).json({ msg: 'Unauthorized to view this conversation' });
        }

        // Mark messages from other user as read
        await Message.updateMany(
            { conversation: conversationId, sender: { $ne: req.user.id }, isRead: false },
            { isRead: true }
        );

        const messageFilter = { conversation: conversationId };
        if (before && !Number.isNaN(before.getTime())) messageFilter.createdAt = { $lt: before };
        const messages = await Message.find(messageFilter)
            .populate('sender', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(limit);
        messages.reverse();

        res.status(200).json({
            success: true,
            messages,
            hasMore: messages.length === limit,
            nextCursor: messages[0]?.createdAt || null
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId, recipientId, text, clientMessageId } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ msg: 'Message text is required' });
        }
        if (text.trim().length > 4000) {
            return res.status(400).json({ msg: 'Message cannot exceed 4000 characters' });
        }

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ msg: 'Conversation not found' });
            }
            if (!isParticipant(conversation, req.user.id)) {
                return res.status(403).json({ msg: 'Unauthorized' });
            }
        } else if (recipientId) {
            if (!mongoose.isValidObjectId(recipientId) || recipientId === req.user.id) {
                return res.status(400).json({ msg: 'Invalid recipient' });
            }
            // Find existing or create conversation
            const participantKey = [req.user.id, recipientId].sort().join(':');
            const query = { participantKey };
            conversation = await Conversation.findOne(query);
            if (!conversation) {
                conversation = await Conversation.findOne({
                    participants: { $all: [req.user.id, recipientId], $size: 2 }
                });
                if (conversation && !conversation.participantKey) {
                    conversation.participantKey = participantKey;
                    await conversation.save();
                }
            }

            if (!conversation) {
                // Ensure recipient exists
                const recipient = await User.findById(recipientId);
                if (!recipient) {
                    return res.status(404).json({ msg: 'Recipient not found' });
                }

                conversation = await Conversation.create({
                    participants: [req.user.id, recipientId],
                    participantKey
                });
            }
        } else {
            return res.status(400).json({ msg: 'Conversation ID or Recipient ID is required' });
        }

        // Create message
        const message = await Message.create({
            conversation: conversation._id,
            sender: req.user.id,
            text: text.trim(),
            clientMessageId
        });

        // Update conversation lastMessage
        conversation.lastMessage = {
            text: text.trim(),
            sender: req.user.id,
            timestamp: Date.now()
        };
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name profileImage');

        // Create notification for other participant(s)
        const recipient = conversation.participants.find(p => p.toString() !== req.user.id);
        if (recipient) {
            await createNotification({
                recipient: recipient,
                type: 'message',
                title: `New Message from ${req.user.name || 'User'}`,
                body: text.length > 50 ? `${text.trim().substring(0, 47)}...` : text.trim(),
                relatedId: conversation._id,
                relatedModel: 'Conversation'
            });
        }

        // Emit socket event to the recipient's room
        try {
            const io = socketModule.getIO();
            if (recipient) {
                io.to(recipient.toString()).emit('newMessage', populatedMessage);
            }
            // Also emit to sender so their other active sessions get it
            io.to(req.user.id).emit('newMessage', populatedMessage);
        } catch (e) {
            console.error('Socket emit error:', e.message);
        }

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getOrCreateConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ msg: 'Recipient ID is required' });
        }
        if (!mongoose.isValidObjectId(recipientId)) {
            return res.status(400).json({ msg: 'Invalid recipient ID' });
        }
        if (recipientId === req.user.id) {
            return res.status(400).json({ msg: 'You cannot create a conversation with yourself' });
        }

        const participantKey = [req.user.id, recipientId].sort().join(':');
        const query = { participantKey };
        let conversation = await Conversation.findOne(query)
            .populate('participants', 'name email role profileImage');

        if (!conversation) {
            conversation = await Conversation.findOne({
                participants: { $all: [req.user.id, recipientId], $size: 2 }
            }).populate('participants', 'name email role profileImage');
            if (conversation && !conversation.participantKey) {
                conversation.participantKey = participantKey;
                await conversation.save();
            }
        }

        if (!conversation) {
            // Ensure recipient exists
            const recipient = await User.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ msg: 'Recipient not found' });
            }

            conversation = await Conversation.create({
                participants: [req.user.id, recipientId],
                participantKey
            });

            // Populate newly created conversation
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'name email role profileImage');
        }

        res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    getMyConversations,
    getMessages,
    sendMessage,
    getOrCreateConversation
};
