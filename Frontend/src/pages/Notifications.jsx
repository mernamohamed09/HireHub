import { useState } from 'react';

const allNotifications = [
  {
    id: 1,
    type: 'application',
    title: 'Application Update: Vodafone',
    body: 'Your application for <strong>Senior Product Designer</strong> has been moved to the "Technical Review" stage. Good luck!',
    time: '2m ago',
    unread: true,
    borderColor: 'border-green-500',
    icon: 'V',
    iconBg: 'bg-primary-container',
    actions: [{ label: 'View Application', primary: true }],
  },
  {
    id: 2,
    type: 'message',
    title: 'New Message: Ahmed Ali',
    body: '"Hi Sarah, I\'ve just reviewed the candidates you sent over. Can we discuss the shortlist later today?"',
    time: '45m ago',
    unread: true,
    borderColor: 'border-tertiary',
    icon: 'A',
    iconBg: 'bg-secondary-container',
    actions: [{ label: 'Reply Now', primary: true }],
  },
  {
    id: 3,
    type: 'interview',
    title: 'Interview Scheduled: Paymob',
    body: 'Your interview for <strong>Full Stack Developer</strong> is confirmed for Tomorrow at 2:00 PM via Google Meet.',
    time: '1h ago',
    unread: true,
    borderColor: 'border-yellow-400',
    icon: 'P',
    iconBg: 'bg-surface-container-high',
    actions: [{ label: 'Add to Calendar', primary: true }, { label: 'View Details', primary: false }],
  },
  {
    id: 4,
    type: 'application',
    title: 'Application Received: Google',
    body: 'We have received your application for the role of <strong>UX Researcher</strong>. We will review it shortly.',
    time: '3h ago',
    unread: false,
    borderColor: 'border-outline',
    icon: 'G',
    iconBg: 'bg-surface-container-high',
    actions: [{ label: 'View Submission', primary: false }],
  },
  {
    id: 5,
    type: 'message',
    title: 'New Message: Mariam K.',
    body: '"Thank you for the updated portfolio. The team is really impressed with the latest case studies."',
    time: '5h ago',
    unread: false,
    borderColor: 'border-outline',
    icon: 'M',
    iconBg: 'bg-secondary-container',
    actions: [{ label: 'Go to Chat', primary: false }],
  },
  {
    id: 6,
    type: 'application',
    title: 'Status Changed: Microsoft',
    body: 'Your application for <strong>Cloud Solutions Architect</strong> has been moved to the "Shortlisted" stage.',
    time: 'Yesterday',
    unread: false,
    borderColor: 'border-outline',
    icon: 'MS',
    iconBg: 'bg-surface-container-high',
    actions: [{ label: 'View Application', primary: false }],
  },
];

export function Notifications() {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState(allNotifications);

  const filters = ['All', 'Unread', 'Applications', 'Messages'];

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const dismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return n.unread;
    if (filter === 'Applications') return n.type === 'application' || n.type === 'interview';
    if (filter === 'Messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="w-full">
      {/* Header Section */}
      <header className="bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-40 -mt-lg -mx-[24px] lg:-mx-[32px] px-xl py-lg flex flex-col gap-md mb-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-md">
            <h1 className="font-h2 text-h2 text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-tertiary text-on-tertiary text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-xs text-primary font-body text-body hover:underline transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Mark all as read</span>
          </button>
        </div>
        <div className="flex gap-sm flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-md py-xs rounded-full font-label-tag text-label-tag uppercase border transition-all ${
                filter === f
                  ? 'bg-tertiary-container text-tertiary border-tertiary/30'
                  : 'bg-surface-container-high text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Notification List */}
      <div className="space-y-md max-w-3xl">
        {filteredNotifications.length === 0 && (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">notifications_off</span>
            <p className="text-on-surface-variant font-body mt-md">No notifications here</p>
          </div>
        )}

        {filteredNotifications.map(n => (
          <div
            key={n.id}
            className={`bg-surface-container rounded-xl p-md border-l-4 ${n.borderColor} flex gap-md items-start shadow-sm hover:translate-x-1 transition-transform duration-200 ${!n.unread ? 'opacity-80' : ''}`}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg ${n.iconBg} flex items-center justify-center shrink-0 text-on-surface font-bold text-base border border-outline-variant`}>
              {n.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-md">
                <h3 className="font-body text-body font-bold text-on-surface">{n.title}</h3>
                <span className="font-caption text-caption text-on-surface-variant shrink-0">{n.time}</span>
              </div>
              <p
                className="font-body text-body text-on-surface-variant mt-xs"
                dangerouslySetInnerHTML={{ __html: n.body.replace(/<strong>/g, '<span class="text-on-surface font-semibold">').replace(/<\/strong>/g, '</span>') }}
              />
              <div className="mt-md flex gap-md flex-wrap items-center">
                {n.actions.map(action => (
                  action.primary ? (
                    <button
                      key={action.label}
                      className="bg-primary-container text-on-primary-container px-md py-sm rounded-lg font-body text-body font-semibold hover:brightness-110 transition-all active:scale-95"
                    >
                      {action.label}
                    </button>
                  ) : (
                    <button
                      key={action.label}
                      className="text-tertiary font-body text-body font-semibold hover:underline"
                    >
                      {action.label}
                    </button>
                  )
                ))}
                <button
                  onClick={() => dismiss(n.id)}
                  className="text-on-surface-variant font-body text-body hover:text-on-surface ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Unread dot */}
            {n.unread && <div className="w-2 h-2 rounded-full bg-tertiary mt-2 shrink-0"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
