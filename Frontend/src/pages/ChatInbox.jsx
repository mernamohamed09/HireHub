import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { chatService } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { formatPostedAt } from '../utils/dateUtils';

export function ChatInbox() {
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(Boolean(socket?.connected));
  const [typingUser, setTypingUser] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);

  const activeConversationRef = useRef(activeConversation);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Real-time messages over the shared socket connection.
  useEffect(() => {
    if (!socket) return;

    const onMessage = (message) => {
      const activeConv = activeConversationRef.current;

      setMessages(prev => {
        // Only messages for the open conversation belong in this list.
        if (!activeConv || message.conversation !== activeConv._id) return prev;

        // Dedupe by the message's own id, not by text+time: the backend echoes
        // the sender's own message back over the socket, and two identical
        // messages sent quickly must both survive. A time-window text match
        // collapsed them and dropped the second one.
        if (prev.some(m => m._id === message._id)) return prev;

        return [...prev, message];
      });

      // Update conversations list with the new lastMessage
      setConversations(prev => prev.map(c => c._id === message.conversation
        ? { ...c, lastMessage: { text: message.text, sender: message.sender, timestamp: message.createdAt } }
        : c
      ));
    };
    socket.on('newMessage', onMessage);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onTyping = ({ conversationId, isTyping }) => {
      if (conversationId === activeConversationRef.current?._id) setTypingUser(isTyping);
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.off('newMessage', onMessage);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat:typing', onTyping);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    try {
      setIsLoading(true);
      const data = await chatService.getMyConversations();
      setConversations(data.conversations || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMessages(conversationId, silent = false) {
    try {
      if (!silent) setMessagesLoading(true);
      const data = await chatService.getMessages(conversationId);
      setMessages(data.messages || []);
    } catch {
      if (!silent) toast.error('Failed to load messages');
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
    loadMessages(conv._id);
    socket?.emit('conversation:join', { conversationId: conv._id }, (result) => {
      if (!result?.success) toast.error(result?.error || 'Could not join conversation');
    });
    socket?.emit('chat:message:read', { conversationId: conv._id });
  }

  useEffect(() => {
    void Promise.resolve().then(loadConversations);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;
    if (!socket?.connected) {
      toast.error('Chat is reconnecting. Please try again in a moment.');
      return;
    }
    const text = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Optimistic update
    const clientMessageId = crypto.randomUUID();
    const tempMsg = { _id: `temp-${clientMessageId}`, sender: { _id: user._id, name: user.name }, text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    socket.emit('chat:typing', { conversationId: activeConversation._id, isTyping: false });
    try {
      const data = await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Message acknowledgement timed out')), 10000);
        socket.emit('chat:message:send', {
          conversationId: activeConversation._id,
          text,
          clientMessageId,
        }, (result) => {
          window.clearTimeout(timeout);
          if (result?.success) resolve(result);
          else reject(new Error(result?.error || 'Failed to send message'));
        });
      });
      // Drop the optimistic temp, then add the real message only if the socket
      // echo hasn't already inserted it (avoids a duplicate on the race).
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m._id !== tempMsg._id);
        return withoutTemp.some(m => m._id === data.message._id) ? withoutTemp : [...withoutTemp, data.message];
      });
      // Update conversation's last message in the list
      setConversations(prev => prev.map(c => c._id === activeConversation._id 
        ? { ...c, lastMessage: { text, sender: user._id, timestamp: new Date() } }
        : c
      ));
    } catch (sendError) {
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
      toast.error(sendError.message || 'Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p._id !== user?._id) || { name: 'Unknown', email: '' };
  };

  return (
    <div className="flex -mt-lg -mx-[24px] lg:-mx-[32px] h-[calc(100vh-80px)]">
      {/* Inbox Panel (Left ~30%) */}
      <section className="w-[280px] lg:w-[30%] h-full bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0">
        <div className="p-md space-y-md">
          <div className="flex justify-between items-center">
            <h2 className="font-h3 text-h3 text-on-surface">Messages</h2>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar px-sm pb-lg space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-xl">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-xl px-md">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant">chat_bubble_outline</span>
              <p className="text-on-surface-variant font-body mt-md">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-md rounded-xl cursor-pointer transition-all ${isActive
                    ? 'bg-primary-container/20 border-l-4 border-tertiary'
                    : 'hover:bg-surface-container-high'}`}
                >
                  <div className="flex gap-md">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-lg">
                        {other.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-body font-bold text-on-surface truncate">{other.name}</h4>
                        <span className="font-caption text-caption text-on-surface-variant shrink-0">
                          {conv.lastMessage?.timestamp ? formatPostedAt(conv.lastMessage.timestamp) : ''}
                        </span>
                      </div>
                      <p className="font-caption text-caption text-tertiary font-medium">{other.role}</p>
                      <p className="font-body text-body truncate mt-1 text-on-surface-variant">
                        {conv.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Thread Panel (Right ~70%) */}
      <section className="flex-1 h-full flex flex-col bg-surface relative min-w-0">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant">forum</span>
              <p className="text-on-surface-variant font-body mt-md">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 h-20 px-lg flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-surface p-1 flex items-center justify-center font-bold text-xl">
                  {getOtherParticipant(activeConversation).name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-on-surface">{getOtherParticipant(activeConversation).name}</h3>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {getOtherParticipant(activeConversation).email}
                  </p>
                  <p className={`text-xs ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isConnected ? (typingUser ? 'Typing…' : 'Connected') : 'Reconnecting…'}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-lg space-y-xl">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-xl">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-xl">
                  <p className="text-on-surface-variant">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender?._id === user?._id;
                  return isMe ? (
                    <div key={msg._id} className="flex flex-row-reverse gap-md max-w-[80%] ml-auto">
                      <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-sm shrink-0 mt-1 ring-2 ring-primary/40">
                        {user?.name?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="bg-primary-container text-on-primary-container p-md shadow-md text-left" style={{ borderRadius: '12px 12px 2px 12px' }}>
                          <p className="text-body">{msg.text}</p>
                        </div>
                        <span className="text-caption text-on-surface-variant">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={msg._id} className="flex gap-md max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                        {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="space-y-1">
                        <div className="bg-surface-container-highest p-md text-on-surface shadow-md" style={{ borderRadius: '2px 12px 12px 12px' }}>
                          <p className="text-body">{msg.text}</p>
                        </div>
                        <span className="text-caption text-on-surface-variant ml-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-lg bg-surface-container-lowest/50 backdrop-blur-sm shrink-0">
              <div className="flex items-end gap-md bg-surface-container-highest rounded-xl p-3 border border-outline-variant focus-within:border-tertiary focus-within:ring-1 focus-within:ring-tertiary/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                    socket?.emit('chat:typing', { conversationId: activeConversation._id, isTyping: true });
                    window.clearTimeout(typingTimerRef.current);
                    typingTimerRef.current = window.setTimeout(() => {
                      socket?.emit('chat:typing', { conversationId: activeConversation._id, isTyping: false });
                    }, 1200);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-body text-on-surface placeholder:text-outline resize-none py-2 max-h-32 custom-scrollbar outline-none"
                  placeholder="Type your message here..."
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!isConnected}
                  className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-lg font-body font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shrink-0 disabled:opacity-50"
                >
                  <span>Send</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
