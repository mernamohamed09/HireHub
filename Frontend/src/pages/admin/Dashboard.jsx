import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { UserDetailModal } from '../../components/UserDetailModal';
import { adminService } from '../../services/adminService';
import { jobService } from '../../services/jobService';
import { RefreshCw, Loader2, Users, Building2, UserCircle2, Briefcase, Search, Trash2, Ban, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const analyticsData = [
    { name: 'Jan', users: 2, jobs: 0 },
    { name: 'Feb', users: 5, jobs: 1 },
    { name: 'Mar', users: 8, jobs: 2 },
    { name: 'Apr', users: 10, jobs: 4 },
    { name: 'May', users: 12, jobs: 5 },
    { name: 'Jun', users: totalUserCount, jobs: jobCount },
  ];

  return (
    <>
      <DashboardHeader />
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto space-y-8 py-8 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">Admin Overview</h1>
            <p className="text-on-surface-variant mt-2 font-medium">Real-time system users and jobs.</p>
          </div>
          <button 
            onClick={() => setReloadKey(k => k + 1)}
            className="hidden md:flex items-center gap-2 bg-surface-container/50 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-all shadow-lg active:scale-95 group"
          >
            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl p-4 text-center mb-8 text-sm font-bold shadow-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform relative z-10"><Users className="text-white" size={20} /></div>
          <span className="text-white text-[10px] font-bold uppercase tracking-widest relative z-10">Total Users</span>
          <span className="font-bold text-3xl text-white relative z-10">{totalUserCount}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-emerald-400/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform relative z-10"><Building2 className="text-emerald-400" size={20} /></div>
          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest relative z-10">Companies</span>
          <span className="font-bold text-3xl text-white relative z-10">{companyCount}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform relative z-10"><UserCircle2 className="text-emerald-500" size={20} /></div>
          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest relative z-10">Candidates</span>
          <span className="font-bold text-3xl text-white relative z-10">{candidateCount}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col gap-2 group shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform relative z-10"><Briefcase className="text-amber-500" size={20} /></div>
          <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest relative z-10">Active Jobs</span>
          <span className="font-bold text-3xl text-white relative z-10">{jobCount}</span>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-2xl mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3 group-hover:bg-emerald-500/10 transition-colors duration-700"></div>
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-xl text-white">System Growth</h3>
            <p className="text-sm text-slate-400 mt-1">Platform adoption over the last 6 months</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Jobs</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(3, 15, 10, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="users" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="jobs" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorJobs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl mb-8">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 bg-surface-container/30">
          <h3 className="font-bold text-xl text-white">All Users</h3>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Role Filter */}
            <select
              className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 outline-none backdrop-blur-md focus:border-emerald-400 focus:shadow-lg transition-all text-sm font-medium"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="" className="bg-background">All Roles</option>
              <option value="candidate" className="bg-background">Candidates</option>
              <option value="company" className="bg-background">Companies</option>
              <option value="admin" className="bg-background">Admins</option>
            </select>

            {/* Search Input */}
            <div className="flex items-center bg-white/5 rounded-lg px-4 py-2 border border-white/10 flex-1 md:flex-none backdrop-blur-md focus-within:border-emerald-400 focus-within:shadow-lg transition-all">
              <Search className="text-white/40 mr-2" size={16} />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/40 w-full md:w-48 outline-none"
                placeholder="Search by name or email..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-16 h-16 bg-surface-container/50 rounded-2xl border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                <Search className="text-white/20" size={32} />
              </div>
              <h3 className="font-bold text-xl text-white mb-2">No Users Found</h3>
              <p className="text-on-surface-variant font-medium text-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-surface-container/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-4 text-left" onClick={() => setSelectedUserId(user._id)}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-white group-hover:text-emerald-500 transition-colors">{user.name}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold border ${
                        user.role === 'candidate' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 
                        user.role === 'company' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' : 
                        'bg-white/10 text-white border-white/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase flex items-center gap-2 w-max font-bold ${
                        user.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-error-container/40 text-error border border-error/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-emerald-400' : 'bg-error'}`}></span>
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`p-2 rounded-lg transition-all ${user.isActive !== false ? 'text-on-surface-variant hover:text-warning hover:bg-warning/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={user.isActive !== false ? 'Suspend user' : 'Activate user'}
                        >
                          {user.isActive !== false ? <Ban size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="w-8 h-8 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10 hover:shadow-lg transition-all"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && users.length > 0 && (
          <div className="p-4 bg-surface-container/30 flex justify-between items-center text-on-surface-variant text-xs font-bold uppercase tracking-widest border-t border-white/10">
            <span>Showing {users.length} users</span>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
      </div>
    </>
  );
}
