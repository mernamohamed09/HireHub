import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { chatService } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { formatPostedAt } from '../utils/dateUtils';
import { MessageSquare, Send, Loader2, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export function ChatInbox() {
  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
    <div className="flex -mt-lg -mx-[24px] lg:-mx-[32px] h-[calc(100vh-80px)] bg-background relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-300/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      {/* Inbox Panel (Left ~30%) */}
      <section className="w-[280px] lg:w-[30%] h-full glass-card-pro border-white/5 border-r border-white/10 flex flex-col shrink-0 relative z-10">
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-xl text-white">Messages</h2>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-emerald-300" size={32} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-6">
              <MessageSquare className="mx-auto text-white/20 mb-4" size={48} />
              <p className="text-on-surface-variant font-medium">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${isActive
                    ? 'bg-emerald-400/20 border-emerald-400/50 shadow-none'
                    : 'bg-surface-container/30 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                >
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${isActive ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-white shadow-none' : 'bg-surface-container border border-white/10 text-white'}`}>
                        {other.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white truncate">{other.name}</h4>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0">
                          {conv.lastMessage?.timestamp ? formatPostedAt(conv.lastMessage.timestamp) : ''}
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-300' : 'text-emerald-400'}`}>{other.role}</p>
                      <p className="text-xs truncate mt-1 text-on-surface-variant font-medium">
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
      <section className="flex-1 h-full flex flex-col relative z-10 min-w-0">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center glass-card p-12 rounded-3xl border border-white/10">
              <MessageSquare className="mx-auto text-white/20 mb-6" size={64} />
              <p className="text-on-surface-variant font-medium text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <header className="glass-card-pro border-white/5 border-b border-white/10 h-20 px-8 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-white shadow-none flex items-center justify-center font-bold text-xl border border-white/20">
                  {getOtherParticipant(activeConversation).name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{getOtherParticipant(activeConversation).name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {getOtherParticipant(activeConversation).email}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isConnected ? 'text-emerald-500 drop-shadow-[0_0_5px_rgba(0,255,170,0.8)]' : 'text-amber-400 drop-shadow-[0_0_5px_rgba(255,0,128,0.8)]'}`}>
                    {isConnected ? (typingUser ? 'Typing…' : 'Connected') : 'Reconnecting…'}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-6">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-emerald-400" size={32} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl border border-white/5 mx-auto max-w-sm">
                  <p className="text-on-surface-variant font-medium">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender?._id === user?._id;
                  
                  // Telegram-style emoji sizing logic
                  const strippedText = (msg.text || "").replace(/\s/g, '');
                  const isOnlyEmoji = strippedText.length > 0 && 
                                      !/[a-zA-Z0-9.,!?;"'()\[\]{}_\-+=/\\|<>@#$%^&*`~]/.test(strippedText) && 
                                      /[\p{Extended_Pictographic}\p{Emoji_Component}]/u.test(strippedText);
                  
                  let emojiCount = 0;
                  if (isOnlyEmoji) {
                    try {
                      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
                      emojiCount = Array.from(segmenter.segment(strippedText)).length;
                    } catch (e) {
                      emojiCount = Array.from(strippedText).length; // fallback
                    }
                  }
                  
                  let bubbleStyle = isMe ? { borderRadius: '16px 16px 4px 16px' } : { borderRadius: '4px 16px 16px 16px' };
                  let bubbleClasses = "";
                  let textClasses = "";
                  
                  if (isOnlyEmoji) {
                    bubbleClasses = "bg-transparent border-none shadow-none p-0 text-left";
                    textClasses = emojiCount === 1 ? "text-[48px] leading-none drop-shadow-md" : "text-[32px] leading-none drop-shadow-md";
                    bubbleStyle = {}; // No border radius needed for pure emoji
                  } else {
                    bubbleClasses = isMe 
                      ? "bg-emerald-400/20 border border-emerald-400/30 text-white p-4 shadow-lg text-left backdrop-blur-md" 
                      : "bg-surface-container/50 border border-white/10 p-4 text-white shadow-lg backdrop-blur-md";
                    textClasses = "text-lg md:text-xl leading-relaxed";
                  }

                  return isMe ? (
                    <div key={msg._id} className="flex flex-row-reverse gap-4 max-w-[80%] ml-auto group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-white shadow-none border border-white/20 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                        {user?.name?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <div className="space-y-1 text-right">
                        <div className={bubbleClasses} style={bubbleStyle}>
                          <p className={textClasses}>{msg.text}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={msg._id} className="flex gap-4 max-w-[80%] group">
                      <div className="w-10 h-10 rounded-xl bg-surface-container border border-white/10 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1 shadow-inner">
                        {msg.sender?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="space-y-1">
                        <div className={bubbleClasses} style={bubbleStyle}>
                          <p className={textClasses}>{msg.text}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <footer className="p-6 glass-card-pro border-white/5 border-t border-white/10 shrink-0 relative !overflow-visible z-20">
              {showEmojiPicker && (
                <div className="absolute bottom-[90px] left-6 z-50 shadow-2xl">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setInput(prev => prev + emojiObject.emoji);
                      textareaRef.current?.focus();
                    }}
                    theme="dark"
                  />
                </div>
              )}
              <div className="flex items-end gap-2 bg-surface-container/50 rounded-2xl p-2 pl-2 border border-white/10 focus-within:border-emerald-300 focus-within:shadow-none transition-all">
                <button
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className="p-2 text-white/40 hover:text-emerald-300 transition-colors rounded-full hover:bg-white/5 self-end mb-1"
                >
                  <Smile size={24} />
                </button>
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
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20 resize-none py-3 max-h-32 custom-scrollbar outline-none"
                  placeholder="Type your message here..."
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!isConnected}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shrink-0 disabled:opacity-50 border border-white/10 shadow-none mb-1"
                >
                  <span>Send</span>
                  <Send size={16} />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
