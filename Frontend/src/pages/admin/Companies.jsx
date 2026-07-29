import { useState, useEffect } from 'react';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { Button } from '../../components/ui/Button';
import { UserDetailModal } from '../../components/UserDetailModal';
import { userService } from '../../services/userService';

export function Companies() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await userService.getAllUsers();
        setCompanies((data.users || []).filter(u => u.role === 'company'));
      } catch {
        setError('Failed to load companies.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, [reloadKey]);

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      setCompanies(prev => prev.filter(c => c._id !== id));
    } catch {
      setError('Failed to delete company.');
    }
  };

  return (
    <>
      <DashboardHeader />
      <div className="w-full px-md md:px-lg max-w-6xl mx-auto space-y-lg py-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-h2 text-h2 text-on-surface">Manage Companies</h1>
            <p className="text-on-surface-variant mt-sm">View and manage all registered companies in the system.</p>
          </div>
          <Button variant="outline" className="hidden md:flex" onClick={() => setReloadKey(k => k + 1)}>Refresh</Button>
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
        ) : companies.length === 0 ? (
          <div className="bg-surface-container rounded-xl border border-outline-variant p-xl flex flex-col items-center justify-center text-center min-h-[400px]">
            <span className="material-symbols-outlined text-[64px] text-outline mb-md">domain</span>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">No Companies Yet</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Registered companies will appear here once they create accounts.
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
                  <th className="px-lg py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {companies.map(c => (
                  <tr key={c._id} className="hover:bg-surface-container-highest transition-colors">
                    <td className="px-lg py-md">
                      <button className="flex items-center gap-md" onClick={() => setSelectedUserId(c._id)}>
                        <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-body font-bold text-on-surface hover:underline">{c.name}</span>
                      </button>
                    </td>
                    <td className="px-lg py-md text-on-surface-variant">{c.email}</td>
                    <td className="px-lg py-md text-on-surface-variant">{c.location || '-'}</td>
                    <td className="px-lg py-md text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-on-surface-variant hover:text-error transition-all"
                        title="Delete company"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
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
