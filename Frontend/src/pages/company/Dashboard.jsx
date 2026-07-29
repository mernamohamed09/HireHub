import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { companyService } from '../../services/companyService';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { formatPostedAt } from '../../utils/dateUtils';

const STATUS_BADGE = {
  pending: { label: 'New', className: 'bg-secondary-container/30 text-secondary border-secondary/20' },
  reviewed: { label: 'Reviewing', className: 'bg-tertiary-container/30 text-tertiary border-tertiary/20' },
  accepted: { label: 'Accepted', className: 'bg-tertiary-container/30 text-tertiary border-tertiary/20' },
  rejected: { label: 'Rejected', className: 'bg-error-container/30 text-error border-error/20' },
};

export function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  const [companyName, setCompanyName] = useState('');
  const [myJobs, setMyJobs] = useState([]);
  const [applicantsByJob, setApplicantsByJob] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, jobsRes] = await Promise.allSettled([
        companyService.getMyProfile(),
        jobService.getAllJobs(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setCompanyName(profileRes.value.profile?.companyName || user?.name || 'your company');
      } else {
        setCompanyName(user?.name || 'your company');
      }

      const allJobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.jobs || []) : [];
      const ownJobs = allJobs.filter(job => job.postedBy?._id === user?._id);
      setMyJobs(ownJobs);

      const applicantResults = await Promise.allSettled(
        ownJobs.map(job => applicationService.getApplicantsForJob(job._id))
      );
      const byJob = {};
      applicantResults.forEach((res, i) => {
        byJob[ownJobs[i]._id] = res.status === 'fulfilled' ? (res.value.applicants || []) : [];
      });
      setApplicantsByJob(byJob);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalApplicants = Object.values(applicantsByJob).reduce((sum, list) => sum + list.length, 0);

  const recentApplicants = Object.entries(applicantsByJob)
    .flatMap(([jobId, applicants]) => applicants.map(a => ({ ...a, jobId, jobTitle: myJobs.find(j => j._id === jobId)?.title })))
    .sort((a, b) => new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt))
    .slice(0, 4);

  return (
    <div className="w-full">
      <div className="space-y-xl">
        {/* Hero Welcome */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
          <div>
            <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-surface">Welcome back, {companyName} 👋</h1>
            <p className="font-body text-body text-on-surface-variant mt-xs">Here is what's happening with your recruitment pipeline today.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-md w-full md:w-auto">
            <button
              onClick={() => setShowCreateJob(true)}
              className="flex items-center justify-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg font-body font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md shadow-primary/10"
            >
              <span className="material-symbols-outlined">add</span>
              Post New Job
            </button>
            <Link to="/company/ats">
              <button className="w-full flex items-center justify-center gap-sm bg-surface-container-high text-on-surface border border-outline-variant px-lg py-md rounded-lg font-body font-bold hover:bg-surface-variant transition-all active:scale-95">
                <span className="material-symbols-outlined">leaderboard</span>
                View ATS Board
              </button>
            </Link>
          </div>
        </section>

        {showCreateJob && (
          <CreateJobForm
            onClose={() => setShowCreateJob(false)}
            onCreated={() => {
              setShowCreateJob(false);
              loadData();
            }}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-3xl">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
              <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-tertiary transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant font-body font-medium">Active Job Posts</span>
                  <span className="material-symbols-outlined text-tertiary">work</span>
                </div>
                <div className="mt-lg">
                  <p className="text-h1 font-h1 text-tertiary">{myJobs.length}</p>
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-tertiary transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="text-on-surface-variant font-body font-medium">Total Applicants</span>
                  <span className="material-symbols-outlined text-tertiary">group</span>
                </div>
                <div className="mt-lg">
                  <p className="text-h1 font-h1 text-tertiary">{totalApplicants}</p>
                </div>
              </div>
            </section>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              {/* Left: Active Job Posts Table */}
              <section className="lg:col-span-2 bg-surface-container p-lg rounded-xl border border-outline-variant space-y-md hover:scale-[1.01] transition-transform duration-300">
                <div className="flex justify-between items-center mb-md">
                  <h3 className="font-h3 text-h3 text-on-surface">Active Job Posts</h3>
                </div>
                {myJobs.length === 0 ? (
                  <p className="text-on-surface-variant">You haven't posted any jobs yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-outline-variant">
                        <tr>
                          <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Role Name</th>
                          <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Applicants</th>
                          <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Posted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {myJobs.map(job => (
                          <tr key={job._id} className="group hover:bg-surface-container-high transition-colors">
                            <td className="py-md">
                              <p className="font-body text-body font-bold text-on-surface">{job.title}</p>
                              <p className="font-caption text-caption text-on-surface-variant">{job.location}</p>
                            </td>
                            <td className="py-md font-body text-body text-on-surface">{applicantsByJob[job._id]?.length || 0}</td>
                            <td className="py-md font-body text-body text-on-surface-variant">{formatPostedAt(job.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Right: Recent Applicants */}
              <section className="bg-surface-container p-lg rounded-xl border border-outline-variant space-y-lg hover:scale-[1.01] transition-transform duration-300">
                <h3 className="font-h3 text-h3 text-on-surface">Recent Applicants</h3>
                {recentApplicants.length === 0 ? (
                  <p className="text-on-surface-variant">No applicants yet.</p>
                ) : (
                  <div className="space-y-md">
                    {recentApplicants.map(applicant => {
                      const badge = STATUS_BADGE[applicant.status] || STATUS_BADGE.pending;
                      return (
                        <div key={applicant._id} className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-high transition-all">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-container text-surface flex items-center justify-center font-bold text-xl">
                            {applicant.applicant?.name?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="font-body text-body font-bold text-on-surface">{applicant.applicant?.name || 'Unknown'}</p>
                            <p className="font-caption text-caption text-on-surface-variant">{applicant.jobTitle}</p>
                          </div>
                          <span className={`border px-sm py-xs rounded-full font-label-tag text-label-tag ${badge.className}`}>{badge.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link to="/company/ats">
                  <button className="w-full py-md text-primary font-body font-bold border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                    View All Applicants
                  </button>
                </Link>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CreateJobForm({ onClose, onCreated }) {
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ title: '', description: '', location: '', salary: '', company: user?.name || '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await jobService.createJob({
        title: form.title,
        description: form.description,
        location: form.location,
        company: form.company,
        salary: form.salary ? Number(form.salary) : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create job.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container rounded-xl p-lg border border-outline-variant space-y-md">
      <div className="flex justify-between items-center">
        <h3 className="font-h3 text-h3 text-on-surface">Post a New Job</h3>
        <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      {error && <p className="text-error text-caption">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <input required placeholder="Job title" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Company name" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input required placeholder="Location" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Salary (optional)" type="number" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
      </div>
      <textarea required placeholder="Job description" rows={3} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Button type="submit" variant="primary" disabled={isSaving}>
        {isSaving ? 'Posting...' : 'Post Job'}
      </Button>
    </form>
  );
}
