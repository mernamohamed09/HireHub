import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useSocket } from '../../context/SocketContext';
import { avatarUrl, avatarInitial } from '../../utils/avatar';
import { notificationService } from '../../services/notificationService';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard, Briefcase, FileText, BarChart, User, FolderOpen,
  Calendar, MessageSquare, Bell, Settings, LogOut, KanbanSquare, Building,
  Menu, PlusCircle, Sparkles
} from 'lucide-react';

const iconMap = {
  'dashboard': LayoutDashboard,
  'work': Briefcase,
  'description': FileText,
  'assessment': BarChart,
  'person': User,
  'folder_shared': FolderOpen,
  'calendar_today': Calendar,
  'chat': MessageSquare,
  'notifications': Bell,
  'view_kanban': KanbanSquare,
  'business': Building,
};

export function Sidebar({ links = [], user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await notificationService.getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    if (user) {
      fetchCount();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const onNotification = () => setUnreadCount(prev => prev + 1);
    socket.on('newNotification', onNotification);
    return () => socket.off('newNotification', onNotification);
  }, [socket]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className={cn(
      "h-full glass-card-purple flex flex-col py-6 transition-all duration-300 relative z-50",
      isCollapsed ? "w-[80px] items-center" : "w-[260px] px-4"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-surface-container-high border border-white/10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:border-neon-cyan hover:shadow-glow-cyan transition-all z-50 shadow-lg"
      >
        <Menu size={12} />
      </button>

      {/* Logo */}
      <div className={cn("flex items-center mb-8", isCollapsed ? "justify-center" : "gap-3")}>
        <div className="w-10 h-10 rounded-xl neon-border-cyan flex-shrink-0 flex items-center justify-center bg-surface-container-high shadow-glow-cyan">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">HH</span>
        </div>
        {!isCollapsed && (
          <span className="font-h3 text-xl font-bold tracking-wide text-white">
            Hire<span className="text-neon-cyan">Hub</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar w-full">
        {links.map((link, index) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          if (link.type === 'divider') {
            return <div key={`div-${index}`} className="w-full border-t border-white/5 my-4" />;
          }
          const Icon = iconMap[link.icon] || FileText;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 py-3 w-full transition-all duration-300 relative group",
                isCollapsed ? "justify-center px-0" : "px-4",
                isActive 
                  ? "text-white bg-white/5 rounded-xl shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]" 
                  : "text-on-surface-variant hover:bg-white/5 hover:text-white rounded-xl"
              )}
              onClick={() => {
                if (link.path.includes('notifications')) {
                  setUnreadCount(0);
                }
              }}
            >
              {isActive && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-5 h-10 border-r-[3px] border-neon-mint rounded-r-[100%] shadow-[4px_0_12px_rgba(85,245,198,0.5)] bg-gradient-to-r from-transparent to-neon-mint/10"></div>
              )}
              <Icon size={isCollapsed ? 22 : 20} className={cn("transition-transform relative z-10", isActive ? "scale-110 text-neon-mint drop-shadow-[0_0_8px_rgba(85,245,198,0.8)]" : "group-hover:scale-110")} />
              
              {!isCollapsed && (
                <span className="font-medium text-[13px] whitespace-nowrap">{link.label || link.name}</span>
              )}

              {link.path.includes('notifications') && unreadCount > 0 && (
                <span className={cn(
                  "bg-neon-pink text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-glow-pink",
                  isCollapsed ? "absolute top-1 right-3 w-4 h-4" : "ml-auto px-2 py-0.5"
                )}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      {/* User Profile & Settings */}
      {user && (
        <div className={cn(
          "mt-auto pt-6 border-t border-white/10 flex items-center gap-3",
          isCollapsed ? "flex-col justify-center" : ""
        )}>
          <div className="w-10 h-10 rounded-full neon-border-cyan overflow-hidden flex-shrink-0 flex items-center justify-center text-neon-cyan font-bold bg-surface-container relative">
            {avatarUrl(user.avatar) ? (
              <img src={avatarUrl(user.avatar)} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              avatarInitial(user.name)
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-mint rounded-full border-2 border-background shadow-glow-mint"></span>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{user.role}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "text-on-surface-variant hover:text-neon-pink transition-colors p-2 rounded-xl hover:bg-white/10 hover:shadow-glow-pink",
              isCollapsed && "mt-2"
            )}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}

