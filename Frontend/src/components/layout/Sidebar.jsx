import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useSocket } from '../../context/SocketContext';
import { avatarUrl, avatarInitial } from '../../utils/avatar';
import { notificationService } from '../../services/notificationService';

export function Sidebar({ links = [], user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);

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
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container border-r border-outline-variant flex flex-col py-lg z-50">
      <div className="px-md mb-xl">
        <span className="font-h3 text-h3 font-bold text-on-surface">HireHub</span>
      </div>
      <nav className="flex-1 space-y-xs px-sm overflow-y-auto custom-scrollbar">
        {links.map((link, index) => {
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
          
          if (link.type === 'divider') {
            return <div key={`div-${index}`} className="my-md border-t border-outline-variant/30" />;
          }
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-md px-md py-sm transition-all rounded-lg relative ${
                isActive
                  ? 'sidebar-active'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              onClick={() => {
                if (link.path.includes('notifications')) {
                  setUnreadCount(0);
                }
              }}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-body text-body">{link.label || link.name}</span>
              {link.path.includes('notifications') && unreadCount > 0 && (
                <span className="ml-auto bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="px-md mt-auto pt-lg border-t border-outline-variant/30">
          <div className="flex items-center gap-md mb-md">
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline flex items-center justify-center text-on-primary-container font-bold">
              {avatarUrl(user.avatar) ? (
                <img src={avatarUrl(user.avatar)} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
              ) : (
                avatarInitial(user.name)
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-body text-body font-bold text-on-surface">{user.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">{user.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body text-body">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
