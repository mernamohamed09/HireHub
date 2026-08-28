const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Conversation = require("./models/conversation");
const Message = require("./models/message");
const Notification = require("./models/notification");
const User = require("./models/User");
const redis = require("./utils/redisClient");
let io;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"]
      },
      transports: ["websocket", "polling"]
    });

    // Authenticate every connection from its JWT and verify active user status via Redis/DB
    io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        let userState = null;

        if (redis.status === 'ready') {
          try {
            const cached = await redis.get(`user:status:${payload.id}`);
            if (cached) userState = JSON.parse(cached);
          } catch {}
        }

        if (!userState) {
          const user = await User.findById(payload.id).select('role isActive');
          if (user) {
            userState = { role: user.role, isActive: user.isActive };
            if (redis.status === 'ready') {
              try {
                await redis.set(`user:status:${payload.id}`, JSON.stringify(userState), 'EX', 900);
              } catch {}
            }
          }
        }

        if (!userState || userState.isActive === false) {
          return next(new Error("Account suspended or inactive"));
        }

        socket.userId = payload.id;
        socket.userRole = userState.role;
        next();
      } catch {
        next(new Error("Invalid or expired token"));
      }
    });

    io.on("connection", (socket) => {
      // Room membership comes from the verified token, never from client input.
      socket.join(socket.userId);
      const joinedConversations = new Set();

      const loadConversation = async (conversationId) => {
        if (!mongoose.isValidObjectId(conversationId)) return null;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return null;
        const isParticipant = conversation.participants.some(
          (participant) => participant.toString() === socket.userId
        );
        return isParticipant ? conversation : null;
      };

      socket.on("conversation:join", async ({ conversationId } = {}, ack = () => {}) => {
        try {
          const conversation = await loadConversation(conversationId);
          if (!conversation) return ack({ success: false, error: "Conversation not found or unauthorized" });
          socket.join(`conversation:${conversationId}`);
          joinedConversations.add(conversationId);
          return ack({ success: true });
        } catch {
          return ack({ success: false, error: "Could not join conversation" });
        }
      });

      socket.on("chat:message:send", async (payload = {}, ack = () => {}) => {
        try {
          const conversationId = payload.conversationId;
          const text = String(payload.text || "").trim();
          const clientMessageId = String(payload.clientMessageId || "").trim();
          if (!text || text.length > 4000 || !clientMessageId || clientMessageId.length > 100) {
            return ack({ success: false, error: "Invalid message" });
          }

          const conversation = await loadConversation(conversationId);
          if (!conversation) return ack({ success: false, error: "Conversation not found or unauthorized" });

          let message = await Message.findOne({ sender: socket.userId, clientMessageId })
            .populate("sender", "name profileImage");
          if (!message) {
            message = await Message.create({
              conversation: conversation._id,
              sender: socket.userId,
              text,
              clientMessageId
            });
            conversation.lastMessage = { text, sender: socket.userId, timestamp: new Date() };
            await conversation.save();
            message = await Message.findById(message._id).populate("sender", "name profileImage");

            const recipients = conversation.participants.filter(
              (participant) => participant.toString() !== socket.userId
            );
            for (const recipient of recipients) {
              const notification = await Notification.create({
                recipient,
                type: "message",
                title: "New message",
                body: text.length > 50 ? `${text.slice(0, 47)}...` : text,
                relatedId: conversation._id,
                relatedModel: "Conversation"
              });
              io.to(recipient.toString()).emit("newNotification", notification);
            }

            for (const participant of conversation.participants) {
              io.to(participant.toString()).emit("newMessage", message);
            }
          }
          return ack({ success: true, message });
        } catch (error) {
          if (error?.code === 11000) {
            const existing = await Message.findOne({
              sender: socket.userId,
              clientMessageId: payload.clientMessageId
            }).populate("sender", "name profileImage");
            return ack({ success: true, message: existing });
          }
          console.error("Socket message error:", error.message);
          return ack({ success: false, error: "Could not send message" });
        }
      });

      socket.on("chat:typing", ({ conversationId, isTyping } = {}) => {
        if (!joinedConversations.has(conversationId)) return;
        socket.to(`conversation:${conversationId}`).emit("chat:typing", {
          conversationId,
          userId: socket.userId,
          isTyping: Boolean(isTyping)
        });
      });

      socket.on("chat:message:read", async ({ conversationId } = {}) => {
        if (!joinedConversations.has(conversationId)) return;
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: socket.userId }, isRead: false },
          { isRead: true }
        );
        socket.to(`conversation:${conversationId}`).emit("chat:message:read", {
          conversationId,
          userId: socket.userId
        });
      });
      console.log(`Socket ${socket.id} authenticated as user ${socket.userId}`);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
