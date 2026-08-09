import { useState, useEffect } from 'react';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { Button } from '../../components/ui/Button';
import { UserDetailModal } from '../../components/UserDetailModal';
import { adminService } from '../../services/adminService';

export function Users() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = { role: 'candidate' };
        if (search.trim()) params.search = search.trim();
        const data = await adminService.getAllUsers(params);
        setCandidates(data.users || []);
      } catch {
        setError('Failed to load candidates.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadCandidates, 300);
    return () => clearTimeout(timer);
  }, [search, reloadKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await adminService.deleteUser(id);
      setCandidates(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to delete candidate.');
    }
  };

  const handleToggleStatus = async (id, currentIsActive) => {
    try {
      const nextIsActive = currentIsActive === false ? true : false;
      await adminService.updateUserStatus(id, nextIsActive);
      setCandidates(prev => prev.map(c => c._id === id ? { ...c, isActive: nextIsActive } : c));
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to update candidate status.');
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="w-full px-md md:px-lg max-w-6xl mx-auto space-y-lg py-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div>
            <h1 className="font-h2 text-h2 text-on-surface">Manage Candidates</h1>
            <p className="text-on-surface-variant mt-sm">View and manage all registered candidates in the system.</p>
          </div>
          <div className="flex items-center gap-md w-full md:w-auto">
            <div className="flex items-center bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50 flex-1 md:flex-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body text-on-surface placeholder-on-surface-variant w-full md:w-48 outline-none"
                placeholder="Search candidate..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="hidden md:flex" onClick={() => setReloadKey(k => k + 1)}>Refresh</Button>
          </div>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-3xl">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-surface-container rounded-xl border border-outline-variant p-xl flex flex-col items-center justify-center text-center min-h-[400px]">
            <span className="material-symbols-outlined text-[64px] text-outline mb-md">person_search</span>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">No Candidates Found</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">
              No registered candidates match your search filter.
            </p>
          </div>
        ) : (
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high/50 text-on-surface-variant font-label-tag text-label-tag uppercase">
                <tr>
                  <th className="px-lg py-md">Name</th>
                  <th className="px-lg py-md">Email</th>
                  <th className="px-lg py-md">Location</th>
                  <th className="px-lg py-md">Status</th>
                  <th className="px-lg py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {candidates.map(c => (
                  <tr key={c._id} className="hover:bg-surface-container-highest transition-colors">
                    <td className="px-lg py-md">
                      <button className="flex items-center gap-md text-left" onClick={() => setSelectedUserId(c._id)}>
                        <div className="w-8 h-8 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center font-bold text-sm shrink-0">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-body font-bold text-on-surface hover:underline">{c.name}</span>
                      </button>
                    </td>
                    <td className="px-lg py-md text-on-surface-variant">{c.email}</td>
                    <td className="px-lg py-md text-on-surface-variant">{c.location || '-'}</td>
                    <td className="px-lg py-md">
                      <span className={`px-sm py-xs rounded-full font-label-tag text-[10px] uppercase flex items-center gap-1 w-max ${c.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-error-container/40 text-error border border-error/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.isActive !== false ? 'bg-emerald-400' : 'bg-error'}`}></span>
                        {c.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right">
                      <div className="flex items-center justify-end gap-sm">
                        <button
                          onClick={() => handleToggleStatus(c._id, c.isActive)}
                          className={`p-1 rounded-lg transition-all ${c.isActive !== false ? 'text-on-surface-variant hover:text-warning hover:bg-warning/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={c.isActive !== false ? 'Suspend candidate' : 'Activate candidate'}
                        >
                          <span className="material-symbols-outlined">
                            {c.isActive !== false ? 'block' : 'check_circle'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                          title="Delete candidate"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </>
  );
}
