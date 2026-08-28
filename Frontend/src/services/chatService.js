import { api } from './api';

export const chatService = {
  getMyConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  getOrCreateConversation: async (recipientId) => {
    const response = await api.post('/chat/conversations', { recipientId });
    return response.data;
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },
  sendMessage: async (data) => {
    const response = await api.post('/chat/messages', data);
    return response.data;
  }
};
