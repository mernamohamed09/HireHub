import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { notificationService } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import { formatPostedAt } from '../utils/dateUtils';

const TYPE_CONFIG = {
  application_update: { borderColor: 'border-green-500', icon: 'work', iconBg: 'bg-primary-container/20 text-primary' },
  new_application: { borderColor: 'border-blue-500', icon: 'person_add', iconBg: 'bg-secondary-container/20 text-secondary' },
  interview_scheduled: { borderColor: 'border-yellow-400', icon: 'event', iconBg: 'bg-surface-container-high text-tertiary' },
  interview_reminder: { borderColor: 'border-yellow-400', icon: 'alarm', iconBg: 'bg-surface-container-high text-tertiary' },
  message: { borderColor: 'border-tertiary', icon: 'chat', iconBg: 'bg-secondary-container/20 text-secondary' },
  assessment_update: { borderColor: 'border-purple-500', icon: 'assignment_turned_in', iconBg: 'bg-primary-container/20 text-primary' },
  system: { borderColor: 'border-outline', icon: 'info', iconBg: 'bg-surface-container-high' },
};

export function Notifications() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = ['All', 'Unread', 'Applications', 'Messages'];

  // Where a notification takes you when clicked.
  const destinationFor = (n) => {
    if (n.title === 'New Assessment Invitation') return 'gmail';
    switch (n.type) {
      case 'message':
        return '/chat';
      case 'interview_scheduled':
      case 'interview_reminder':
        return '/schedule';
      case 'new_application':
        return '/company/ats';
      case 'application_update':
        return '/candidate/applications';
      case 'assessment_update':
        return '/company/results';
      default:
        return null;
    }
  };

  // Real-time notifications over the shared socket connection.
  useEffect(() => {
    if (!socket) return;

    const onNotification = (notification) => {
      setNotifications(prev => {
        if (prev.some(n => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
      toast.info(`New Notification: ${notification.title}`);
    };
    socket.on('newNotification', onNotification);

    return () => socket.off('newNotification', onNotification);
  }, [socket]);

  async function loadNotifications() {
    try {
      setIsLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadNotifications);
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const dismiss = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch {
      toast.error('Failed to dismiss notification');
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markRead(n._id);
    
    if (n.title === 'New Assessment Invitation') {
      window.open('https://mail.google.com/', '_blank', 'noopener,noreferrer');
      return;
    }

    const destination = destinationFor(n);
    if (destination && destination !== 'gmail') {
      navigate(destination);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'Applications') return n.type === 'application_update' || n.type === 'new_application' || n.type === 'interview_scheduled';
    if (filter === 'Messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        {isLoading ? (
          <div className="flex items-center justify-center py-3xl">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">notifications_off</span>
            <p className="text-on-surface-variant font-body mt-md">No notifications here</p>
          </div>
        ) : (
          filteredNotifications.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const clickable = destinationFor(n) !== null;
            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                role={clickable ? 'button' : undefined}
                className={`bg-surface-container rounded-xl p-md border-l-4 ${config.borderColor} flex gap-md items-start shadow-sm hover:translate-x-1 transition-transform duration-200 ${(clickable || !n.isRead) ? 'cursor-pointer' : ''} ${n.isRead ? 'opacity-80' : ''}`}
              >
                <div className={`w-12 h-12 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0 text-on-surface border border-outline-variant`}>
                  <span className="material-symbols-outlined">{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-md">
                    <h3 className="font-body text-body font-bold text-on-surface">{n.title}</h3>
                    <span className="font-caption text-caption text-on-surface-variant shrink-0">{formatPostedAt(n.createdAt)}</span>
                  </div>
                  <p className="font-body text-body text-on-surface-variant mt-xs">{n.body}</p>
                  <div className="mt-md flex gap-md flex-wrap items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n._id); }}
                      className="text-on-surface-variant font-body text-body hover:text-on-surface ml-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-tertiary mt-2 shrink-0"></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
