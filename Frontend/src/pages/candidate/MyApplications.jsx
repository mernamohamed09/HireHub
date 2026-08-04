import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationService } from '../../services/applicationService';
import { formatPostedAt } from '../../utils/dateUtils';
import { Briefcase, Search, ExternalLink, XCircle, Info, MapPin, DollarSign, Loader2 } from 'lucide-react';

const STATUS_STYLES = {
  pending: 'bg-neon-orange/10 text-neon-orange border-neon-orange/30 shadow-glow-orange',
  reviewed: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 shadow-glow-cyan',
  accepted: 'bg-neon-mint/10 text-neon-mint border-neon-mint/30 shadow-glow-mint',
  rejected: 'bg-neon-pink/10 text-neon-pink border-neon-pink/30 shadow-glow-pink',
};

export function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await applicationService.getMyApplications();
        const apps = data.applications || [];
        setApplications(apps);
        setActiveId(apps[0]?._id || null);
      } catch {
        setError('Failed to load applications. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const activeApp = applications.find(app => app._id === activeId);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async (application) => {
    const jobTitle = application.job?.title || 'this job';
    if (!window.confirm(`Withdraw your application for ${jobTitle}? This cannot be undone.`)) return;

    try {
      setIsWithdrawing(true);
      await applicationService.withdrawApplication(application._id);
      const remaining = applications.filter(app => app._id !== application._id);
      setApplications(remaining);
      setActiveId(remaining[0]?._id || null);
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to withdraw application');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 w-full">
        <Loader2 size={40} className="animate-spin text-neon-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neon-pink/10 border border-neon-pink/30 text-neon-pink shadow-glow-pink rounded-xl p-6 text-center w-full font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-full overflow-hidden flex flex-col md:flex-row gap-6 h-full p-4">
      {/* Application List Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="mb-8 shrink-0 glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/20 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h1 className="font-bold text-3xl md:text-4xl text-white">My Applications</h1>
            <p className="text-on-surface-variant font-medium mt-2">Track your professional journey across {applications.length} application{applications.length !== 1 ? 's' : ''}.</p>
          </div>
        </header>

        {applications.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6 border border-neon-cyan/20 shadow-glow-cyan">
              <Briefcase size={32} className="text-neon-cyan" />
            </div>
            <h3 className="font-bold text-xl text-white mb-2">No applications yet</h3>
            <p className="text-on-surface-variant mb-8 max-w-sm text-sm">
              Once you apply to a role, you can track its progress here — from pending all the way to accepted.
            </p>
            <Link
              to="/jobs"
              className="px-6 py-3 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg font-bold hover:bg-neon-purple hover:text-white transition-all flex items-center gap-2 shadow-glow-purple"
            >
              <Search size={18} />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <>
          {/* Mobile: stacked cards — the table overflows below md */}
          <div className="md:hidden space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {applications.map(app => (
              <button
                key={app._id}
                onClick={() => setActiveId(app._id)}
                className={`w-full text-left glass-card p-4 transition-all group ${
                  activeId === app._id ? 'border-neon-purple shadow-glow-purple bg-neon-purple/5' : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container border border-white/10 flex items-center justify-center font-bold text-xl shrink-0 text-white">
                    {app.job?.company?.[0] || '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-white text-sm truncate">{app.job?.title || 'Job removed'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{app.job?.company || 'Unknown company'}</p>
                  </div>
                  <span className={`border font-bold text-[9px] px-2 py-1 rounded-full uppercase shrink-0 ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  Applied {formatPostedAt(app.appliedAt || app.createdAt)}
                </p>
              </button>
            ))}
          </div>

          <div className="hidden md:block glass-panel rounded-2xl overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur-md border-b border-white/5 z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map(app => {
                  const isActive = activeId === app._id;
                  return (
                    <tr
                      key={app._id}
                      onClick={() => setActiveId(app._id)}
                      className={`hover:bg-white/5 transition-colors cursor-pointer group ${isActive ? 'bg-neon-purple/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border transition-colors ${isActive ? 'bg-neon-purple text-black border-neon-purple shadow-glow-purple' : 'bg-surface-container text-white border-white/10 group-hover:border-white/20'}`}>
                            {app.job?.company?.[0] || '?'}
                          </div>
                          <span className="font-bold text-white text-sm">{app.job?.company || 'Unknown company'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {app.job?._id ? (
                          <Link
                            to={`/jobs/${app.job._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-neon-cyan hover:underline transition-colors line-clamp-1"
                          >
                            {app.job.title}
                          </Link>
                        ) : (
                          <span className="text-on-surface-variant">Job removed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">{formatPostedAt(app.appliedAt || app.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`border font-bold text-[9px] px-3 py-1 rounded-full uppercase ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>{app.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Detail Drawer (Right Side) */}
      {activeApp && (
        <aside className="w-full md:w-[35%] shrink-0 glass-panel rounded-2xl p-6 relative overflow-y-auto custom-scrollbar flex flex-col transition-opacity duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-purple/10 blur-3xl rounded-full"></div>
          
          <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 pb-4 mb-6 border-b border-white/10 flex items-center justify-between mx-[-24px] px-6 pt-[-24px]">
            <h3 className="font-bold text-white">Application Detail</h3>
          </div>

          <div className="mb-8 flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-white/10 shadow-inner flex items-center justify-center font-bold text-3xl text-neon-purple">
              {activeApp.job?.company?.[0] || '?'}
            </div>
            <div>
              <h4 className="font-bold text-xl text-white leading-tight mb-1">{activeApp.job?.title || 'Job removed'}</h4>
              <p className="text-neon-cyan font-bold text-sm">{activeApp.job?.company}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
            <div className="bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign size={12} /> Salary</p>
              <p className="font-bold text-white text-sm">{activeApp.job?.salary ? `EGP ${activeApp.job.salary.toLocaleString()}` : 'Not disclosed'}</p>
            </div>
            <div className="bg-surface-container-high/50 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={12} /> Location</p>
              <p className="font-bold text-white text-sm">{activeApp.job?.location || '-'}</p>
            </div>
          </div>

          <div className="mb-8 relative z-10">
            <h5 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Info size={16} className="text-neon-purple" />
              Current Status
            </h5>
            <span className={`inline-block border font-bold text-[10px] px-4 py-1.5 rounded-full uppercase ${STATUS_STYLES[activeApp.status] || STATUS_STYLES.pending}`}>
              {activeApp.status}
            </span>
            <p className="text-[10px] text-on-surface-variant mt-3">
              Applied {formatPostedAt(activeApp.appliedAt || activeApp.createdAt)}
            </p>
          </div>

          {activeApp.notes && (
            <div className="mb-8 relative z-10">
              <h5 className="font-bold text-white text-sm mb-2">Your Notes</h5>
              <p className="text-on-surface-variant text-sm bg-surface-container-high/30 p-4 rounded-xl border border-white/5">
                {activeApp.notes}
              </p>
            </div>
          )}

          <div className="mt-auto pt-6 space-y-3 border-t border-white/10 relative z-10">
            {activeApp.job?._id && (
              <Link
                to={`/jobs/${activeApp.job._id}`}
                className="w-full border border-white/10 py-3 bg-surface-container-high rounded-xl font-bold hover:border-white/30 text-white transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink size={16} />
                View Job
              </Link>
            )}
            {activeApp.status === 'pending' && (
              <button
                onClick={() => handleWithdraw(activeApp)}
                disabled={isWithdrawing}
                className="w-full border border-neon-pink/50 text-neon-pink bg-neon-pink/10 py-3 rounded-xl font-bold hover:bg-neon-pink hover:text-black transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <XCircle size={16} />
                {isWithdrawing ? 'Withdrawing…' : 'Withdraw Application'}
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
