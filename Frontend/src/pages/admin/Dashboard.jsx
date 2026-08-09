import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { UserDetailModal } from '../../components/UserDetailModal';
import { adminService } from '../../services/adminService';
import { jobService } from '../../services/jobService';
import { RefreshCw, Loader2, Users, Building2, UserCircle2, Briefcase, Search, Trash2 } from 'lucide-react';

export function Dashboard() {
  const [users, setUsers] = useState([]);
  const [jobCount, setJobCount] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (roleFilter) params.role = roleFilter;

        const [usersRes, statsRes, jobsRes] = await Promise.allSettled([
          adminService.getAllUsers(params),
          adminService.getStats(),
          jobService.getAllJobs(),
        ]);
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users || []);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
        if (jobsRes.status === 'fulfilled') setJobCount((jobsRes.value.jobs || []).length);
      } catch {
        setError('Failed to load admin data.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, reloadKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (id, currentIsActive) => {
    try {
      const nextIsActive = currentIsActive === false ? true : false;
      await adminService.updateUserStatus(id, nextIsActive);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: nextIsActive } : u));
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to update user status.');
    }
  };

  const candidateCount = stats?.totalCandidates ?? users.filter(u => u.role === 'candidate').length;
  const companyCount = stats?.totalCompanies ?? users.filter(u => u.role === 'company').length;
  const totalUserCount = stats?.totalUsers ?? users.length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-tertiary transition-colors">
          <span className="material-symbols-outlined text-tertiary">group</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Total Users</span>
          <span className="font-h2 text-h2 text-on-surface">{totalUserCount}</span>
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
      <section className="glass-panel rounded-xl overflow-hidden mb-xl">
        <div className="p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant/30">
          <h3 className="font-h3 text-h3 text-on-surface">All Users</h3>
          <div className="flex flex-wrap items-center gap-md w-full md:w-auto">
            {/* Role Filter */}
            <select
              className="bg-surface-container border border-outline-variant/50 text-on-surface text-body rounded-lg px-md py-xs outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="company">Companies</option>
              <option value="admin">Admins</option>
            </select>

            {/* Search Input */}
            <div className="flex items-center bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50 flex-1 md:flex-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body text-on-surface placeholder-on-surface-variant w-full md:w-48 outline-none"
                placeholder="Search by name or email..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-3xl">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/50 text-on-surface-variant font-label-tag text-label-tag uppercase">
                <tr>
                  <th className="px-lg py-md">User</th>
                  <th className="px-lg py-md">Email</th>
                  <th className="px-lg py-md">Role</th>
                  <th className="px-lg py-md">Status</th>
                  <th className="px-lg py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-surface-container-highest transition-colors group">
                    <td className="px-lg py-md">
                      <button className="flex items-center gap-md text-left" onClick={() => setSelectedUserId(user._id)}>
                        <div className="w-8 h-8 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-body text-body font-bold text-on-surface whitespace-nowrap hover:underline">{user.name}</span>
                      </button>
                    </td>
                    <td className="px-lg py-md font-body text-body text-on-surface-variant whitespace-nowrap">{user.email}</td>
                    <td className="px-lg py-md">
                      <span className={`px-sm py-xs rounded-full font-label-tag text-[10px] uppercase ${user.role === 'candidate' ? 'bg-tertiary-container/30 text-tertiary' : user.role === 'company' ? 'bg-primary-container/30 text-primary' : 'bg-secondary-container/30 text-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-lg py-md">
                      <span className={`px-sm py-xs rounded-full font-label-tag text-[10px] uppercase flex items-center gap-1 w-max ${user.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-error-container/40 text-error border border-error/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-400' : 'bg-error'}`}></span>
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right">
                      <div className="flex items-center justify-end gap-sm">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`p-1 rounded-lg transition-all ${user.isActive !== false ? 'text-on-surface-variant hover:text-warning hover:bg-warning/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={user.isActive !== false ? 'Suspend user' : 'Activate user'}
                        >
                          <span className="material-symbols-outlined">
                            {user.isActive !== false ? 'block' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                          title="Delete user"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-lg py-lg text-center text-on-surface-variant">No users found matching your query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-lg bg-surface-container-low flex justify-between items-center text-on-surface-variant font-caption text-caption border-t border-outline-variant/30">
          <span>Showing {users.length} users</span>
        </div>
      </section>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
