import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import { formatPostedAt } from '../../utils/dateUtils';

const PROFILE_FIELDS = ['title', 'bio', 'skills', 'experience', 'education', 'resumeUrl'];

function computeCompletion(profile) {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  }).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

export function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [appsData, jobsData, profileData] = await Promise.allSettled([
          applicationService.getMyApplications(),
          jobService.getAllJobs(),
          candidateService.getMyProfile(),
        ]);

        if (appsData.status === 'fulfilled') setApplications(appsData.value.applications || []);
        if (jobsData.status === 'fulfilled') setJobs(jobsData.value.jobs || []);
        if (profileData.status === 'fulfilled') setCompletion(computeCompletion(profileData.value.profile));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const reviewedCount = applications.filter(a => a.status === 'reviewed').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const recentApplications = applications.slice(0, 5);
  const recommendedJobs = jobs.slice(0, 3);

  return (
    <div className="w-full">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface">Good morning, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="font-body text-body text-on-surface-variant">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Welcome back to your recruitment command center.
          </p>
        </div>
        <Link to="/jobs">
          <button className="px-lg py-md bg-primary-container text-on-primary-container font-body font-bold rounded-xl transition-transform active:scale-95 shadow-lg">
            Browse New Roles
          </button>
        </Link>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-3xl">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-lg">
          {/* Stats Row */}
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
              <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Applications Sent</p>
              <span className="text-h1 font-h1 text-tertiary">{applications.length}</span>
            </div>
            <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
              <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Pending Review</p>
              <span className="text-h1 font-h1 text-tertiary">{pendingCount}</span>
            </div>
            <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
              <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Reviewed</p>
              <span className="text-h1 font-h1 text-tertiary">{reviewedCount}</span>
            </div>
            <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
              <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Accepted</p>
              <span className="text-h1 font-h1 text-tertiary">{acceptedCount}</span>
            </div>
          </div>

          {/* Main Section: Recent Applications & Recommended Jobs */}
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden hover:scale-[1.01] transition-transform duration-300">
              <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-h3 text-h3 text-on-surface">Recent Applications</h3>
                <Link to="/candidate/applications" className="text-primary font-body text-body hover:underline transition-all">View All</Link>
              </div>
              {recentApplications.length === 0 ? (
                <p className="p-lg text-on-surface-variant">You haven't applied to any jobs yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high">
                      <tr>
                        <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase">Company & Role</th>
                        <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase">Applied</th>
                        <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {recentApplications.map(app => (
                        <tr key={app._id} className="hover:bg-surface-container-highest transition-colors group">
                          <td className="px-lg py-lg">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 bg-on-surface/10 rounded-lg flex items-center justify-center font-bold text-primary">
                                {app.job?.company?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-body text-body font-bold">{app.job?.company || 'Unknown company'}</p>
                                <p className="font-caption text-caption text-on-surface-variant">{app.job?.title || 'Job removed'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-lg font-body text-body text-on-surface-variant">{formatPostedAt(app.appliedAt || app.createdAt)}</td>
                          <td className="px-lg py-lg">
                            <span className="font-label-tag text-label-tag px-md py-1 rounded-full uppercase bg-tertiary-container/20 text-tertiary">{app.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-h3 text-h3 text-on-surface">Latest Job Openings</h3>
              </div>
              {recommendedJobs.length === 0 ? (
                <p className="text-on-surface-variant">No jobs available right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  {recommendedJobs.map(job => (
                    <div key={job._id} className="bg-surface-container-high p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                      <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden p-2 flex items-center justify-center mb-lg">
                        <span className="material-symbols-outlined text-tertiary">work</span>
                      </div>
                      <h4 className="font-body text-body font-bold text-on-surface mb-xs">{job.title}</h4>
                      <p className="font-caption text-caption text-on-surface-variant mb-lg">{job.company} • {job.location}</p>
                      <Link to={`/jobs/${job._id}`}>
                        <button className="w-full py-md bg-outline-variant text-on-surface font-body font-bold rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">View Job</button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: Profile Completion */}
          <div className="col-span-12 lg:col-span-4 space-y-lg">
            <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-body text-body font-bold text-on-surface">Profile Strength</h3>
                <span className="text-primary font-bold">{completion}%</span>
              </div>
              <div className="w-full h-2 bg-outline-variant rounded-full mb-lg overflow-hidden">
                <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(169,199,255,0.4)]" style={{ width: `${completion}%` }}></div>
              </div>
              <p className="font-caption text-caption text-on-surface-variant mb-md">
                {completion < 100 ? 'Complete your profile to stand out to companies.' : 'Your profile is fully complete!'}
              </p>
              <Link to="/candidate/profile" className="text-primary font-body text-body hover:underline">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
