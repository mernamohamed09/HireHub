import { useState, useEffect } from 'react';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { Button } from '../../components/ui/Button';
import { UserDetailModal } from '../../components/UserDetailModal';
import { userService } from '../../services/userService';
import { RefreshCw, Loader2, Building2, Trash2 } from 'lucide-react';

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
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto space-y-8 py-8 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">Manage Companies</h1>
            <p className="text-on-surface-variant mt-2 font-medium">View and manage all registered companies in the system.</p>
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
          <div className="bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl p-4 text-center text-sm font-bold shadow-glow-pink">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-neon-purple" size={32} />
          </div>
        ) : companies.length === 0 ? (
          <div className="glass-card rounded-3xl border border-white/5 p-12 flex flex-col items-center justify-center text-center min-h-[400px] shadow-2xl">
            <div className="w-20 h-20 bg-surface-container/50 rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-inner">
              <Building2 className="text-white/20" size={40} />
            </div>
            <h3 className="font-bold text-2xl text-white mb-2">No Companies Yet</h3>
            <p className="text-on-surface-variant font-medium max-w-md mx-auto">
              Registered companies will appear here once they create accounts.
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-surface-container/50 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companies.map(c => (
                    <tr key={c._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-4" onClick={() => setSelectedUserId(c._id)}>
                          <div className="w-10 h-10 rounded-xl bg-neon-purple/20 text-neon-purple border border-neon-purple/30 flex items-center justify-center font-bold text-sm shadow-glow-purple group-hover:scale-110 transition-transform">
                            {c.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-bold text-white group-hover:text-neon-cyan transition-colors">{c.name}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{c.email}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{c.location || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="w-8 h-8 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-neon-pink hover:border-neon-pink/30 hover:bg-neon-pink/10 hover:shadow-glow-pink transition-all ml-auto"
                          title="Delete company"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </>
  );
}
