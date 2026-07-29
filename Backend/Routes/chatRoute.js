const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getMyConversations,
    getMessages,
    sendMessage,
    getOrCreateConversation
} = require('../controller/chatController');

router.use(authMiddleware);

router.get('/conversations', getMyConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);

module.exports = router;
