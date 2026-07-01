import { useState, useRef, useEffect } from 'react';

const inboxItems = [
  { id: 1, name: 'Ahmed Ali', company: 'Vodafone Egypt', time: '10:45 AM', lastMsg: "Hello Ahmed, I'm available tomorrow afternoon.", unread: false, online: true, initial: 'A' },
  { id: 2, name: 'Mona Zaki', company: 'Google', time: 'Yesterday', lastMsg: 'Check the updated job description...', unread: true, online: false, initial: 'M' },
  { id: 3, name: 'Khaled Omar', company: 'Microsoft', time: 'Monday', lastMsg: 'The team loved your portfolio!', unread: false, online: false, initial: 'K' },
  { id: 4, name: 'Sara Younis', company: 'Instabug', time: 'Dec 20', lastMsg: 'Welcome to the talent pool, Sarah.', unread: false, online: false, initial: 'S' },
];

const initialMessages = [
  { id: 1, from: 'recruiter', text: "Hi Sarah, hope you're having a great week!", time: '10:30 AM' },
  { id: 2, from: 'recruiter', text: "The technical team has reviewed your Github profile and were quite impressed with your React-based dashboard project. We'd like to schedule a first-round interview to discuss the Senior Frontend role at Vodafone Egypt.", time: '10:31 AM' },
  { id: 3, from: 'me', text: 'Hi Ahmed! Thank you so much for the feedback. I\'m very excited about this opportunity.', time: '10:40 AM' },
  { id: 4, from: 'me', text: "Hello Ahmed, I'm available tomorrow afternoon between 2:00 PM and 5:00 PM Cairo time. Would that work for the team?", time: '10:42 AM', seen: true },
  { id: 5, from: 'recruiter', text: "That's perfect. I'll send over a calendar invite for 3:00 PM tomorrow. We'll be using Microsoft Teams for the call.", time: '10:44 AM' },
  { id: 6, from: 'me', text: "Sounds great, I'll keep an eye out for the invite. Looking forward to it!", time: '10:45 AM', seen: true },
];

export function ChatInbox() {
  const [activeId, setActiveId] = useState(1);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false,
    }]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeContact = inboxItems.find(i => i.id === activeId);

  return (
    <div className="flex -mt-lg -mx-[24px] lg:-mx-[32px] h-[calc(100vh-80px)]">
      {/* Inbox Panel (Left ~30%) */}
      <section className="w-[280px] lg:w-[30%] h-full bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0">
        {/* Search & Header */}
        <div className="p-md space-y-md">
          <div className="flex justify-between items-center">
            <h2 className="font-h3 text-h3 text-on-surface">Messages</h2>
            <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-colors rounded-full hover:bg-surface-container-high">
              <span className="material-symbols-outlined">edit_square</span>
            </button>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-tertiary transition-colors text-[20px]">search</span>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body focus:ring-1 focus:ring-tertiary focus:border-tertiary outline-none transition-all"
              placeholder="Search conversations"
              type="text"
            />
          </div>
        </div>

        {/* Inbox List */}
        <div className="flex-grow overflow-y-auto custom-scrollbar px-sm pb-lg space-y-1">
          {inboxItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`p-md rounded-xl cursor-pointer transition-all ${activeId === item.id
                ? 'bg-primary-container/20 border-l-4 border-tertiary'
                : 'hover:bg-surface-container-high'}`}
            >
              <div className="flex gap-md">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-lg">
                    {item.initial}
                  </div>
                  {item.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-low rounded-full"></div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-body font-bold text-on-surface truncate">{item.name}</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-caption text-caption text-on-surface-variant">{item.time}</span>
                      {item.unread && <div className="w-2 h-2 bg-tertiary rounded-full"></div>}
                    </div>
                  </div>
                  <p className="font-caption text-caption text-tertiary font-medium">{item.company}</p>
                  <p className={`font-body text-body truncate mt-1 ${item.unread ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                    {item.lastMsg}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Thread Panel (Right ~70%) */}
      <section className="flex-1 h-full flex flex-col bg-surface relative min-w-0">
        {/* Thread Header */}
        <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 h-20 px-lg flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-surface p-1 flex items-center justify-center font-bold text-xl">
              {activeContact?.initial}
            </div>
            <div>
              <div className="flex items-center gap-sm flex-wrap">
                <h3 className="font-h3 text-h3 text-on-surface">{activeContact?.name}</h3>
                <span className="bg-tertiary-container/30 text-tertiary font-label-tag text-label-tag px-2 py-0.5 rounded-full uppercase tracking-wider">Senior Frontend Developer</span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant">
                Recruiter at {activeContact?.company} • {activeContact?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all">
              <span className="material-symbols-outlined">call</span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all">
              <span className="material-symbols-outlined">videocam</span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-lg space-y-xl">
          <div className="text-center">
            <span className="px-3 py-1 bg-surface-container-highest rounded-full text-caption font-label-tag uppercase tracking-widest text-on-surface-variant">Today</span>
          </div>

          {messages.map(msg => (
            msg.from === 'recruiter' ? (
              <div key={msg.id} className="flex gap-md max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-sm shrink-0 mt-1">A</div>
                <div className="space-y-1">
                  <div className="bg-surface-container-highest p-md text-on-surface shadow-md" style={{ borderRadius: '2px 12px 12px 12px' }}>
                    <p className="text-body">{msg.text}</p>
                  </div>
                  <span className="text-caption text-on-surface-variant ml-1">{msg.time}</span>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-row-reverse gap-md max-w-[80%] ml-auto">
                <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-sm shrink-0 mt-1 ring-2 ring-primary/40">S</div>
                <div className="space-y-1 text-right">
                  <div className="bg-primary-container text-on-primary-container p-md shadow-md text-left" style={{ borderRadius: '12px 12px 2px 12px' }}>
                    <p className="text-body">{msg.text}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-caption text-on-surface-variant">{msg.time}</span>
                    {msg.seen && (
                      <span className="material-symbols-outlined text-[14px] text-tertiary" style={{ fontVariationSettings: "'wght' 700" }}>done_all</span>
                    )}
                  </div>
                </div>
              </div>
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-lg bg-surface-container-lowest/50 backdrop-blur-sm shrink-0">
          <div className="flex items-end gap-md bg-surface-container-highest rounded-xl p-3 border border-outline-variant focus-within:border-tertiary focus-within:ring-1 focus-within:ring-tertiary/20 transition-all">
            <div className="flex gap-sm pb-1">
              <button className="w-8 h-8 rounded-full hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-all">
                <span className="material-symbols-outlined">attachment</span>
              </button>
              <button className="w-8 h-8 rounded-full hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-all">
                <span className="material-symbols-outlined">mood</span>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent border-none focus:ring-0 text-body text-on-surface placeholder:text-outline resize-none py-2 max-h-32 custom-scrollbar outline-none"
              placeholder="Type your message here..."
              rows={1}
            />
            <button
              onClick={handleSend}
              className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-lg font-body font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shrink-0"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
