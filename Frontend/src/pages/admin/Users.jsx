import { useState, useEffect } from 'react';
import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { UserDetailModal } from '../../components/UserDetailModal';
import { adminService } from '../../services/adminService';
import { RefreshCw, Loader2, UserSearch, Trash2, Search, Ban, CheckCircle } from 'lucide-react';

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

        if (search.trim()) {
          params.search = search.trim();
        }

        const data = await adminService.getAllUsers(params);

        setCandidates(data.users || []);
      } catch (err) {
        setError(
          err?.response?.data?.msg || 'Failed to load candidates.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadCandidates, 300);

    return () => clearTimeout(timer);
  }, [search, reloadKey]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this candidate?'
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(id);

      setCandidates((prev) =>
        prev.filter((candidate) => candidate._id !== id)
      );
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          'Failed to delete candidate.'
      );
    }
  };

  const handleToggleStatus = async (id, currentIsActive) => {
    try {
      const nextIsActive = currentIsActive === false;

      await adminService.updateUserStatus(id, nextIsActive);

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate._id === id
            ? {
                ...candidate,
                isActive: nextIsActive,
              }
            : candidate
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          'Failed to update candidate status.'
      );
    }
  };

  return (
    <>
      <DashboardHeader />

      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto space-y-8 py-8 relative">

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/3 -translate-y-1/3" />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">

          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">
              Manage Candidates
            </h1>

            <p className="text-on-surface-variant mt-2 font-medium">
              View and manage all registered candidates in the system.
            </p>
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-3 w-full md:w-auto">

            <div className="flex items-center bg-white/5 rounded-lg px-4 py-2 border border-white/10 flex-1 md:flex-none backdrop-blur-md focus-within:border-emerald-400 focus-within:shadow-lg transition-all">
              <Search className="text-white/40 mr-2" size={16} />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-white/40 w-full md:w-48 outline-none"
                placeholder="Search candidate..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => setReloadKey((key) => key + 1)}
              className="hidden md:flex items-center gap-2 bg-surface-container/50 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-all shadow-lg active:scale-95 group"
            >
              <RefreshCw
                size={14}
                className="group-hover:rotate-180 transition-transform duration-500"
              />

              Refresh
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl p-4 text-center text-sm font-bold shadow-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              className="animate-spin text-emerald-500"
              size={32}
            />
          </div>
        ) : candidates.length === 0 ? (

          /* Empty state */
          <div className="glass-card rounded-3xl border border-white/5 p-12 flex flex-col items-center justify-center text-center min-h-[400px] shadow-2xl">

            <div className="w-20 h-20 bg-surface-container/50 rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-inner">

              <UserSearch
                className="text-white/20"
                size={40}
              />

            </div>

            <h3 className="font-bold text-2xl text-white mb-2">
              No Candidates Yet
            </h3>

            <p className="text-on-surface-variant font-medium max-w-md mx-auto">
              No registered candidates match your search filter.
            </p>

          </div>

        ) : (

          /* Candidates table */
          <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">

            <div className="overflow-x-auto custom-scrollbar">

              <table className="w-full text-left min-w-[700px]">

                <thead className="bg-surface-container/50 border-b border-white/10">

                  <tr>

                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Name
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Email
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Location
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Status
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-white/5">

                  {candidates.map((candidate) => (

                    <tr
                      key={candidate._id}
                      className="hover:bg-white/5 transition-colors group"
                    >

                      {/* Name */}
                      <td className="px-6 py-4">

                        <button
                          className="flex items-center gap-4 text-left"
                          onClick={() =>
                            setSelectedUserId(candidate._id)
                          }
                        >

                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                            {candidate.name?.[0]?.toUpperCase() || '?'}
                          </div>

                          <span className="font-bold text-white group-hover:text-emerald-500 transition-colors">
                            {candidate.name}
                          </span>

                        </button>

                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        {candidate.email}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        {candidate.location || '-'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] uppercase flex items-center gap-2 w-max font-bold ${
                            candidate.isActive !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-error-container/40 text-error border border-error/40'
                          }`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              candidate.isActive !== false
                                ? 'bg-emerald-400'
                                : 'bg-error'
                            }`}
                          />

                          {candidate.isActive !== false
                            ? 'Active'
                            : 'Suspended'}

                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">

                        <div className="flex items-center justify-end gap-2">

                          {/* Suspend / Activate */}
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                candidate._id,
                                candidate.isActive
                              )
                            }
                            className={`p-2 rounded-lg transition-all ${
                              candidate.isActive !== false
                                ? 'text-on-surface-variant hover:text-warning hover:bg-warning/10'
                                : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={
                              candidate.isActive !== false
                                ? 'Suspend candidate'
                                : 'Activate candidate'
                            }
                          >

                            {candidate.isActive !== false ? <Ban size={18} /> : <CheckCircle size={18} />}

                          </button>

                          {/* Delete */}
                          <button
                            onClick={() =>
                              handleDelete(candidate._id)
                            }
                            className="w-8 h-8 rounded-lg bg-surface-container border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10 hover:shadow-lg transition-all"
                            title="Delete candidate"
                          >

                            <Trash2 size={14} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* User details modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

    </>
  );
}