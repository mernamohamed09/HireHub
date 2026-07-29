import { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { UserDetailModal } from '../../components/UserDetailModal';
import { userService } from '../../services/userService';
import { jobService } from '../../services/jobService';

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
      <div className="w-full flex items-center justify-center py-3xl">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Floating Glassmorphic Header */}
      <header className="sticky top-0 z-40 mb-xl flex justify-between items-center bg-surface/80 backdrop-blur-md py-md border-b border-outline-variant/30 -mt-lg mx-[-24px] lg:mx-[-32px] px-md lg:px-xl w-[calc(100%+48px)] lg:w-[calc(100%+64px)]">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Admin Overview</h2>
          <p className="text-on-surface-variant font-caption text-caption">Real-time system users and jobs.</p>
        </div>
        <Button variant="primary" className="shadow-lg active:scale-95" onClick={() => setReloadKey(k => k + 1)}>
          Refresh
        </Button>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center mb-xl">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-tertiary transition-colors">
          <span className="material-symbols-outlined text-tertiary">group</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Total Users</span>
          <span className="font-h2 text-h2 text-on-surface">{users.length}</span>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-primary transition-colors">
          <span className="material-symbols-outlined text-primary">domain</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Companies</span>
          <span className="font-h2 text-h2 text-on-surface">{companyCount}</span>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-secondary transition-colors">
          <span className="material-symbols-outlined text-secondary">person</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Candidates</span>
          <span className="font-h2 text-h2 text-on-surface">{candidateCount}</span>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-on-surface transition-colors">
          <span className="material-symbols-outlined text-on-surface">work_outline</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Active Jobs</span>
          <span className="font-h2 text-h2 text-on-surface">{jobCount}</span>
        </div>
      </div>

      {/* Users Table */}
      <section className="glass-panel rounded-xl overflow-hidden mb-xl hover:scale-[1.01] transition-transform duration-300">
        <div className="p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant/30">
          <h3 className="font-h3 text-h3 text-on-surface">All Users</h3>
          <div className="flex items-center bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50 flex-1 md:flex-none">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-body text-on-surface placeholder-on-surface-variant w-full md:w-48 outline-none"
              placeholder="Search users..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/50 text-on-surface-variant font-label-tag text-label-tag uppercase">
              <tr>
                <th className="px-lg py-md">User</th>
                <th className="px-lg py-md">Email</th>
                <th className="px-lg py-md">Role</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-surface-container-highest transition-colors group">
                  <td className="px-lg py-md">
                    <button className="flex items-center gap-md" onClick={() => setSelectedUserId(user._id)}>
                      <div className="w-8 h-8 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-sm">
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
                  <td className="px-lg py-md text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-on-surface-variant hover:text-error transition-all"
                      title="Delete user"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-lg py-lg text-center text-on-surface-variant">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-lg bg-surface-container-low flex justify-between items-center text-on-surface-variant font-caption text-caption border-t border-outline-variant/30">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
        </div>
      </section>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
