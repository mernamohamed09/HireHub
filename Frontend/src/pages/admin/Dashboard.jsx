import { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { UserDetailModal } from '../../components/UserDetailModal';
import { userService } from '../../services/userService';
import { jobService } from '../../services/jobService';
import { RefreshCw, Loader2, Users, Building2, UserCircle2, Briefcase, Search, Trash2 } from 'lucide-react';

export function Dashboard() {
  const [users, setUsers] = useState([]);
  const [jobCount, setJobCount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [usersRes, jobsRes] = await Promise.allSettled([
          userService.getAllUsers(),
          jobService.getAllJobs(),
        ]);
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users || []);
        if (jobsRes.status === 'fulfilled') setJobCount((jobsRes.value.jobs || []).length);
      } catch {
        setError('Failed to load admin data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [reloadKey]);

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch {
      setError('Failed to delete user.');
    }
  };

  const candidateCount = users.filter(u => u.role === 'candidate').length;
  const companyCount = users.filter(u => u.role === 'company').length;

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-neon-cyan" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
      
      {/* Floating Glassmorphic Header */}
      <header className="sticky top-0 z-40 mb-8 flex justify-between items-center glass-panel backdrop-blur-xl py-4 px-6 lg:px-8 border-b border-white/10 -mt-6 mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)] shadow-lg">
        <div>
          <h2 className="font-bold text-2xl text-white">Admin Overview</h2>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mt-1">Real-time system users and jobs.</p>
        </div>
        <button 
          onClick={() => setReloadKey(k => k + 1)}
          className="flex items-center gap-2 bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neon-cyan/30 transition-all shadow-glow-cyan active:scale-95 group"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          Refresh
        </button>
      </header>

      {error && (
        <div className="bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl p-4 text-center mb-8 text-sm font-bold shadow-glow-pink">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-surface-container border border-white/10 flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform relative z-10"><Users className="text-white/40" size={20} /></div>
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest relative z-10">Total Users</span>
          <span className="font-bold text-3xl text-white relative z-10">{users.length}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-neon-cyan/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center mb-2 shadow-glow-cyan group-hover:scale-110 transition-transform relative z-10"><Building2 className="text-neon-cyan" size={20} /></div>
          <span className="text-neon-cyan text-[10px] font-bold uppercase tracking-widest relative z-10">Companies</span>
          <span className="font-bold text-3xl text-white relative z-10">{companyCount}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-neon-purple/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center mb-2 shadow-glow-purple group-hover:scale-110 transition-transform relative z-10"><UserCircle2 className="text-neon-purple" size={20} /></div>
          <span className="text-neon-purple text-[10px] font-bold uppercase tracking-widest relative z-10">Candidates</span>
          <span className="font-bold text-3xl text-white relative z-10">{candidateCount}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-neon-pink/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-neon-pink/20 border border-neon-pink/30 flex items-center justify-center mb-2 shadow-glow-pink group-hover:scale-110 transition-transform relative z-10"><Briefcase className="text-neon-pink" size={20} /></div>
          <span className="text-neon-pink text-[10px] font-bold uppercase tracking-widest relative z-10">Active Jobs</span>
          <span className="font-bold text-3xl text-white relative z-10">{jobCount}</span>
        </div>
      </div>

      {/* Users Table */}
      <section className="glass-card rounded-3xl border border-white/5 overflow-hidden mb-8 shadow-2xl transition-all duration-300">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 bg-surface-container/30">
          <h3 className="font-bold text-xl text-white">All Users</h3>
          <div className="flex items-center bg-surface-container/50 rounded-xl px-4 py-2 border border-white/10 flex-1 md:flex-none focus-within:border-neon-cyan focus-within:shadow-glow-cyan transition-all">
            <Search className="text-white/40 mr-3" size={16} />
            <input
              className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/20 w-full md:w-64 outline-none"
              placeholder="Search users..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-surface-container/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-4" onClick={() => setSelectedUserId(user._id)}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-110 transition-transform ${
                        user.role === 'candidate' ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30 shadow-glow-purple' :
                        user.role === 'company' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-glow-cyan' :
                        'bg-neon-pink/20 text-neon-pink border border-neon-pink/30 shadow-glow-pink'
                      }`}>
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className={`font-bold transition-colors ${
                        user.role === 'candidate' ? 'text-white group-hover:text-neon-purple' :
                        user.role === 'company' ? 'text-white group-hover:text-neon-cyan' :
                        'text-white group-hover:text-neon-pink'
                      }`}>{user.name}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === 'candidate' ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/30 shadow-glow-purple' :
                      user.role === 'company' ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 shadow-glow-cyan' :
                      'bg-neon-pink/10 text-neon-pink border-neon-pink/30 shadow-glow-pink'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="w-8 h-8 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-neon-pink hover:border-neon-pink/30 hover:bg-neon-pink/10 hover:shadow-glow-pink transition-all ml-auto"
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant font-medium bg-surface-container/30">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-surface-container/30 flex justify-between items-center border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Showing {filteredUsers.length} of {users.length} users</span>
        </div>
      </section>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
