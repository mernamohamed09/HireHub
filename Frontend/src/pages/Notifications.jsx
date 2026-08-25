import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { notificationService } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import { formatPostedAt } from '../utils/dateUtils';
import { CheckCheck, BellOff, Loader2, Briefcase, UserPlus, Calendar, Clock, MessageSquare, ClipboardCheck, Info } from 'lucide-react';

const TYPE_CONFIG = {
  application_update: { borderColor: 'border-emerald-500', icon: Briefcase, iconBg: 'bg-emerald-500/20 text-emerald-500' },
  new_application: { borderColor: 'border-emerald-300', icon: UserPlus, iconBg: 'bg-emerald-300/20 text-emerald-300' },
  interview_scheduled: { borderColor: 'border-amber-500', icon: Calendar, iconBg: 'bg-amber-500/20 text-amber-500' },
  interview_reminder: { borderColor: 'border-amber-500', icon: Clock, iconBg: 'bg-amber-500/20 text-amber-500' },
  message: { borderColor: 'border-amber-400', icon: MessageSquare, iconBg: 'bg-amber-400/20 text-amber-400' },
  assessment_update: { borderColor: 'border-emerald-400', icon: ClipboardCheck, iconBg: 'bg-emerald-400/20 text-emerald-400' },
  system: { borderColor: 'border-white/10', icon: Info, iconBg: 'bg-white/10 text-white' },
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
    <div className="w-full relative">
      {/* Header Section */}
      <header className="glass-card-pro border-white/5 border-b border-white/10 sticky top-0 z-40 -mt-8 -mx-[24px] lg:-mx-[32px] px-8 py-6 flex flex-col gap-4 mb-8 bg-background/80 backdrop-blur-xl">
        <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-400/10 blur-[100px] rounded-full"></div>
        <div className="flex justify-between items-center w-full relative z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-3xl text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-amber-400/20 text-amber-400 border border-amber-400/50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-none">{unreadCount} new</span>
            )}
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-emerald-300 text-sm font-bold hover:text-white transition-all group"
          >
            <CheckCheck size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
            <span>Mark all as read</span>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap relative z-10 mt-2">
          {filters.map(f => {
            let activeClass = 'bg-emerald-400/20 text-emerald-400 border-emerald-400/50 shadow-none';
            if (f === 'Unread') activeClass = 'bg-amber-500/20 text-amber-500 border-amber-500/50 drop-shadow-[0_0_8px_rgba(255,165,0,0.3)]';
            else if (f === 'Applications') activeClass = 'bg-emerald-300/20 text-emerald-300 border-emerald-300/50 shadow-none';
            else if (f === 'Messages') activeClass = 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-none';

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  filter === f
                    ? activeClass
                    : 'bg-surface-container text-on-surface-variant border-transparent hover:text-white hover:border-white/10'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </header>

      {/* Notification List */}
      <div className="space-y-4 max-w-3xl relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={40} className="animate-spin text-emerald-400" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center">
            <BellOff size={48} className="text-white/20 mb-4" />
            <p className="text-on-surface-variant text-sm font-medium">No notifications here</p>
          </div>
        ) : (
          filteredNotifications.map(n => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon = config.icon;
            const clickable = destinationFor(n) !== null;
            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                role={clickable ? 'button' : undefined}
                className={`glass-card p-4 border-l-4 ${config.borderColor} flex gap-4 items-start hover:border-white/20 hover:bg-white/5 hover:translate-x-1 transition-all duration-200 ${(clickable || !n.isRead) ? 'cursor-pointer' : ''} ${n.isRead ? 'opacity-70' : 'shadow-lg'}`}
              >
                <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 border border-current shadow-inner`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm font-bold text-white leading-snug">{n.title}</h3>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0">{formatPostedAt(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{n.body}</p>
                  <div className="mt-2 flex gap-4 flex-wrap items-center justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n._id); }}
                      className="text-xs font-bold text-on-surface-variant hover:text-amber-400 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-none mt-1 shrink-0"></div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
