import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationService } from '../../services/applicationService';
import { formatPostedAt } from '../../utils/dateUtils';

const STATUS_STYLES = {
  pending: 'bg-secondary-container/30 text-secondary border-secondary/20',
  reviewed: 'bg-tertiary-container/30 text-tertiary border-tertiary/20',
  accepted: 'bg-tertiary-container/30 text-tertiary border-tertiary/20',
  rejected: 'bg-error-container/30 text-error border-error/20',
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
      <div className="flex items-center justify-center py-3xl w-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center w-full">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-full overflow-hidden flex flex-col md:flex-row gap-lg h-full">
      {/* Application List Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="mb-xl shrink-0">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface">My Applications</h2>
              <p className="text-on-surface-variant font-body mt-2">Track your professional journey across {applications.length} application{applications.length !== 1 ? 's' : ''}.</p>
            </div>
          </div>
        </header>

        {applications.length === 0 ? (
          <div className="bg-surface-container border border-outline-variant rounded-xl p-3xl flex flex-col items-center justify-center text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-tertiary text-4xl">work_history</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-xs">No applications yet</h3>
            <p className="text-on-surface-variant mb-lg max-w-sm">
              Once you apply to a role, you can track its progress here — from pending all the way to accepted.
            </p>
            <Link
              to="/jobs"
              className="px-lg py-md bg-primary-container text-on-primary-container rounded-lg font-bold hover:bg-primary transition-all flex items-center gap-sm shadow-lg shadow-primary-container/20"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              Browse Jobs
            </Link>
          </div>
        ) : (
          <>
          {/* Mobile: stacked cards — the table overflows below md */}
          <div className="md:hidden space-y-md overflow-y-auto custom-scrollbar flex-1">
            {applications.map(app => (
              <button
                key={app._id}
                onClick={() => setActiveId(app._id)}
                className={`w-full text-left bg-surface-container border rounded-xl p-md transition-colors ${
                  activeId === app._id ? 'border-tertiary' : 'border-outline-variant'
                }`}
              >
                <div className="flex items-center gap-md mb-sm">
                  <div className="w-10 h-10 rounded bg-white text-surface flex items-center justify-center font-bold text-lg shrink-0">
                    {app.job?.company?.[0] || '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-body font-semibold text-on-surface truncate">{app.job?.title || 'Job removed'}</p>
                    <p className="text-caption text-on-surface-variant truncate">{app.job?.company || 'Unknown company'}</p>
                  </div>
                  <span className={`border font-label-tag text-label-tag px-sm py-1 rounded-full uppercase shrink-0 ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-caption text-on-surface-variant">
                  Applied {formatPostedAt(app.appliedAt || app.createdAt)}
                </p>
              </button>
            ))}
          </div>

          <div className="hidden md:block bg-surface-container rounded-xl border border-outline-variant overflow-y-auto custom-scrollbar shadow-2xl flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur border-b border-outline-variant z-10">
                <tr>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Company</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Applied</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {applications.map(app => {
                  const isActive = activeId === app._id;
                  return (
                    <tr
                      key={app._id}
                      onClick={() => setActiveId(app._id)}
                      className={`hover:bg-primary-container/10 transition-colors cursor-pointer ${isActive ? 'bg-tertiary-container/10' : ''}`}
                    >
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 rounded bg-white text-surface flex items-center justify-center p-1 font-bold text-lg">
                            {app.job?.company?.[0] || '?'}
                          </div>
                          <span className="font-body font-semibold">{app.job?.company || 'Unknown company'}</span>
                        </div>
                      </td>
                      <td className="px-lg py-lg text-on-surface font-body">
                        {app.job?._id ? (
                          <Link
                            to={`/jobs/${app.job._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-tertiary hover:underline transition-colors"
                          >
                            {app.job.title}
                          </Link>
                        ) : (
                          'Job removed'
                        )}
                      </td>
                      <td className="px-lg py-lg text-on-surface-variant font-body">{formatPostedAt(app.appliedAt || app.createdAt)}</td>
                      <td className="px-lg py-lg">
                        <span className={`border font-label-tag text-label-tag px-sm py-1 rounded-full uppercase ${STATUS_STYLES[app.status] || STATUS_STYLES.pending}`}>{app.status}</span>
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
        <aside className="w-full md:w-[35%] shrink-0 bg-surface-container border border-outline-variant rounded-xl p-lg shadow-2xl relative overflow-y-auto custom-scrollbar flex flex-col transition-opacity duration-300">
          <div className="sticky top-0 bg-surface-container z-10 pb-md mb-lg border-b border-outline-variant/30 flex items-center justify-between">
            <h3 className="font-h3 text-h3 text-on-surface">Application Detail</h3>
          </div>

          <div className="mb-xl flex items-center gap-md">
            <div className="w-16 h-16 rounded-xl bg-white text-surface p-2 border border-outline-variant shadow-lg flex items-center justify-center font-bold text-3xl">
              {activeApp.job?.company?.[0] || '?'}
            </div>
            <div>
              <h4 className="font-h2 text-[22px] text-on-surface leading-tight">{activeApp.job?.title || 'Job removed'}</h4>
              <p className="text-tertiary font-body font-medium">{activeApp.job?.company}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md mb-xl">
            <div className="bg-surface-container-high/50 p-md rounded-lg border border-outline-variant/20">
              <p className="font-label-tag text-label-tag text-on-surface-variant uppercase mb-1">Salary</p>
              <p className="font-body font-bold text-on-surface">{activeApp.job?.salary ? `EGP ${activeApp.job.salary.toLocaleString()}` : 'Not disclosed'}</p>
            </div>
            <div className="bg-surface-container-high/50 p-md rounded-lg border border-outline-variant/20">
              <p className="font-label-tag text-label-tag text-on-surface-variant uppercase mb-1">Location</p>
              <p className="font-body font-bold text-on-surface">{activeApp.job?.location || '-'}</p>
            </div>
          </div>

          <div className="mb-xl">
            <h5 className="font-h3 text-body font-bold text-on-surface mb-sm flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">info</span>
              Current Status
            </h5>
            <span className={`inline-block border font-label-tag text-label-tag px-md py-1 rounded-full uppercase ${STATUS_STYLES[activeApp.status] || STATUS_STYLES.pending}`}>
              {activeApp.status}
            </span>
            <p className="font-caption text-caption text-on-surface-variant mt-sm">
              Applied {formatPostedAt(activeApp.appliedAt || activeApp.createdAt)}
            </p>
          </div>

          {activeApp.notes && (
            <div className="mb-xl">
              <h5 className="font-h3 text-body font-bold text-on-surface mb-sm">Your Notes</h5>
              <p className="text-on-surface-variant font-body bg-surface-container-lowest/50 p-sm rounded border border-outline-variant/10">
                {activeApp.notes}
              </p>
            </div>
          )}

          <div className="mt-auto pt-lg space-y-sm border-t border-outline-variant/30">
            {activeApp.job?._id && (
              <Link
                to={`/jobs/${activeApp.job._id}`}
                className="w-full border border-outline-variant py-md rounded-lg font-bold hover:bg-surface-container-high transition-all flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                View Job
              </Link>
            )}
            {/* Withdrawing is only offered while the company hasn't acted yet;
                the server enforces the same rule. */}
            {activeApp.status === 'pending' && (
              <button
                onClick={() => handleWithdraw(activeApp)}
                disabled={isWithdrawing}
                className="w-full border border-error text-error py-md rounded-lg font-bold hover:bg-error/10 transition-all flex items-center justify-center gap-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                {isWithdrawing ? 'Withdrawing…' : 'Withdraw Application'}
              </button>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
