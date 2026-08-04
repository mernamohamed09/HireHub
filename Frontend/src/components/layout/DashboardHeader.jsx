import { Link, useNavigate } from 'react-router-dom';
import { avatarUrl, avatarInitial } from '../../utils/avatar';
import { Search, Bell, Sparkles } from 'lucide-react';

export function DashboardHeader({ title = 'HireHub', user }) {
  const navigate = useNavigate();
  const resolvedAvatar = avatarUrl(user?.profileImage || user?.avatar);

  return (
    <header className="sticky top-0 z-40 w-full mb-6">
      <div className="glass-card-purple mx-auto flex justify-between items-center h-16 px-6 shadow-2xl relative overflow-hidden">
        {/* Subtle glowing orb in header */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-neon-purple/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-6 w-full max-w-xl z-10">
          <span className="md:hidden font-h3 text-xl font-bold text-white tracking-wide">{title}</span>
          
          {/* Premium Search Bar */}
          <div className="hidden md:flex items-center w-full max-w-md bg-surface-container/50 border border-white/10 rounded-full px-4 py-2 hover:border-neon-cyan/50 hover:bg-white/5 transition-all shadow-inner relative group">
            <Search size={16} className="text-on-surface-variant group-hover:text-neon-cyan transition-colors" />
            <input 
              type="text" 
              placeholder="Search candidates, jobs, or AI insights..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full px-3 placeholder:text-on-surface-variant/50"
            />
            <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/60 font-medium">
              <span className="bg-white/10 px-1.5 py-0.5 rounded">⌘</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded">K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <button className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-pink/30 text-neon-pink px-3 py-1.5 rounded-full text-xs font-bold shadow-glow-pink hover:scale-105 transition-transform">
            <Sparkles size={14} />
            AI Assistant
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-on-surface-variant hover:text-white hover:border-neon-cyan hover:shadow-glow-cyan transition-all"
          >
            <Bell size={18} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-neon-cyan/30 text-neon-cyan font-bold shadow-glow-cyan hover:scale-105 transition-transform cursor-pointer">
            {resolvedAvatar ? (
              <img src={resolvedAvatar} alt={user?.name || 'User avatar'} className="w-full h-full object-cover" />
            ) : (
              avatarInitial(user?.name)
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
