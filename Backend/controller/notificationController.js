const Notification = require('../models/notification');
const socketModule = require('../socket');

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false });
        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Helper function to create notification from inside backend controllers
const createNotification = async ({ recipient, type, title, body, relatedId, relatedModel }) => {
    try {
        const notification = await Notification.create({
            recipient,
            type,
            title,
            body,
            relatedId,
            relatedModel
        });

        try {
            const io = socketModule.getIO();
            io.to(recipient.toString()).emit('newNotification', notification);
        } catch (e) {
            console.error('Socket emit error:', e.message);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        return null;
    }
};

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
};
