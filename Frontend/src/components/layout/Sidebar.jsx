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
      "h-full flex flex-col py-6 transition-all duration-500 relative z-50 border-r border-white/5 overflow-hidden",
      "bg-gradient-to-b from-black/80 via-[#0a1510]/90 to-black/90 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
      isCollapsed ? "w-[80px] items-center" : "w-[280px] px-5"
    )}>
      {/* Decorative blurred spots */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-8 w-7 h-7 bg-[#0A0F1A] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-emerald-400 hover:shadow-none hover:scale-110 transition-all z-50 shadow-xl"
      >
        <Menu size={14} />
      </button>

      {/* Logo */}
      <div className={cn("flex items-center mb-10 relative z-10", isCollapsed ? "justify-center" : "")}>
        <img 
          src="/Logo.svg" 
          alt="HireHub Logo" 
          className={cn("transition-all duration-300 scale-125 -ml-2 -mr-6 md:-mr-8", isCollapsed ? "h-10 w-auto" : "h-14 w-auto")} 
        />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-h3 text-2xl font-bold tracking-tight text-white leading-none">
              Hire<span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Hub</span>
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar w-full relative z-10 pr-1">
        {links.map((link, index) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          if (link.type === 'divider') {
            return <div key={`div-${index}`} className="w-full border-t border-white/5 my-5" />;
          }
          const Icon = iconMap[link.icon] || FileText;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3.5 py-3.5 w-full transition-all duration-300 relative group overflow-hidden",
                isCollapsed ? "justify-center px-0 rounded-2xl" : "px-4 rounded-2xl",
                isActive 
                  ? "text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-emerald-500/20" 
                  : "text-slate-400 hover:text-white border border-transparent"
              )}
              onClick={() => {
                if (link.path.includes('notifications')) {
                  setUnreadCount(0);
                }
              }}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent"></div>
              )}
              
              {/* Hover Background */}
              {!isActive && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}

              {/* Active Left Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-400 rounded-r-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
              )}

              <Icon size={isCollapsed ? 24 : 20} className={cn("transition-transform relative z-10 duration-500", isActive ? "scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "group-hover:scale-110 group-hover:text-emerald-400/70")} />
              
              {!isCollapsed && (
                <span className={cn("font-medium text-[14px] whitespace-nowrap relative z-10 transition-colors", isActive ? "text-white font-bold" : "group-hover:text-white")}>{link.label || link.name}</span>
              )}

              {link.path.includes('notifications') && unreadCount > 0 && (
                <span className={cn(
                  "bg-amber-500 text-black text-[11px] font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] relative z-10 transition-transform group-hover:scale-110",
                  isCollapsed ? "absolute top-1.5 right-2 w-4 h-4" : "ml-auto px-2 py-0.5"
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
          "mt-auto pt-6 border-t border-white/10 flex items-center gap-4 relative z-10",
          isCollapsed ? "flex-col justify-center" : ""
        )}>
          <div className="w-11 h-11 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-emerald-400 font-bold bg-black/40 relative shadow-lg group-hover:border-emerald-400/50 transition-colors">
            {avatarUrl(user.avatar) ? (
              <img src={avatarUrl(user.avatar)} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              avatarInitial(user.name)
            )}
            <span className="absolute bottom-[-2px] right-[-2px] w-3 h-3 bg-emerald-400 rounded-full border-[2px] border-[#0a1510] shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-emerald-400/80 uppercase tracking-wider font-bold truncate mt-0.5">{user.role}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "text-slate-400 hover:text-red-400 transition-all p-2.5 rounded-xl hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
              isCollapsed && "mt-3"
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
