import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import { formatPostedAt } from '../../utils/dateUtils';
import { Search, Send, Hourglass, Eye, CheckCircle, Bell, Briefcase, Compass } from 'lucide-react';

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
    <div className="w-full relative">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/5">
        <div>
          <p className="text-emerald-400 font-medium text-sm tracking-wide mb-1">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-bold text-3xl md:text-4xl text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
        </div>
        <Link to="/jobs">
          <button className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold tracking-wide text-sm transition-all shadow-[0_2px_8px_rgba(,,,0.15)] hover:shadow-[0_4px_12px_rgba(,,,0.15)] active:scale-95 border border-emerald-400/20">
            <Search size={16} /> Browse Roles
          </button>
        </Link>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-none"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[auto] p-4">
          
          {/* Stats Grid (Top row in masonry) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card-pro p-5 rounded-xl flex flex-col justify-between hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <Send size={14} />
                </div>
                <p className="text-xs text-slate-300 font-medium">Applications Sent</p>
              </div>
              <span className="text-3xl font-black text-white tracking-tight relative z-10">{applications.length}</span>
            </div>

            <div className="glass-card-pro p-5 rounded-xl flex flex-col justify-between hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Hourglass size={14} />
                </div>
                <p className="text-xs text-slate-300 font-medium">Pending Review</p>
              </div>
              <span className="text-3xl font-black text-white tracking-tight relative z-10">{pendingCount}</span>
            </div>

            <div className="glass-card-pro p-5 rounded-xl flex flex-col justify-between hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                  <Eye size={14} />
                </div>
                <p className="text-xs text-slate-300 font-medium">Reviewed</p>
              </div>
              <span className="text-3xl font-black text-white tracking-tight relative z-10">{reviewedCount}</span>
            </div>

            <div className="glass-card-pro p-5 rounded-xl flex flex-col justify-between hover-lift relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                  <CheckCircle size={14} />
                </div>
                <p className="text-xs text-slate-300 font-medium">Accepted</p>
              </div>
              <span className="text-3xl font-black text-white tracking-tight relative z-10">{acceptedCount}</span>
            </div>

          </div>

          {/* Main Section: Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-card-pro p-6 md:p-8 hover-lift">
              {/* Hero Section */}
              <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="font-bold text-3xl md:text-4xl text-white tracking-tight">Welcome back, <span className="text-gradient-emerald font-extrabold drop-shadow-sm">{user?.name}</span></h1>
                  <p className="text-slate-400 font-medium mt-2">Here is your daily activity and recommended opportunities.</p>
                </div>
                <Link to="/candidate/jobs" className="w-full md:w-auto mt-4 md:mt-0">
                  <button className="btn-pro-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold w-full md:w-auto text-sm shadow-none">
                    <Compass size={18} />
                    Browse Jobs
                  </button>
                </Link>
              </section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-white tracking-wide">Recent Applications</h3>
                <Link to="/candidate/applications" className="text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors">View All</Link>
              </div>
              
              {recentApplications.length === 0 ? (
                <div className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-slate-400 font-medium text-sm">You haven't applied to any jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map(app => {
                    const statusColors = {
                      pending: 'text-slate-400 bg-white/5 border-white/10',
                      reviewed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                      accepted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
                    };
                    const colorClass = statusColors[app.status] || statusColors.pending;

                    return (
                      <div key={app._id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-black/40 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center font-bold text-lg text-slate-300 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                            {app.job?.company?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">{app.job?.company || 'Unknown company'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{app.job?.title || 'Job removed'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${colorClass}`}>
                            {app.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">{formatPostedAt(app.appliedAt || app.createdAt)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Latest Job Openings Grid */}
            <section className="space-y-4 mt-8">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-xl text-white tracking-wide">Latest Job Openings</h3>
              </div>
              {recommendedJobs.length === 0 ? (
                <div className="glass-card-pro p-8 text-center">
                  <p className="text-slate-400 font-medium text-sm">No jobs available right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedJobs.map(job => (
                    <div key={job._id} className="glass-card-pro p-5 hover-lift flex flex-col justify-between group overflow-hidden relative">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
                      <div className="relative z-10">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                          <Briefcase className="text-slate-400 group-hover:text-emerald-400 transition-colors" size={18} />
                        </div>
                        <h4 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-emerald-300 transition-colors">{job.title}</h4>
                        <p className="text-xs text-slate-400 font-medium mb-5 line-clamp-1">{job.company} • {job.location}</p>
                      </div>
                      <Link to={`/jobs/${job._id}`} className="relative z-10 mt-auto">
                        <button className="w-full py-2.5 bg-white/5 border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:shadow-none transition-all">
                          View Job
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Panel: Profile Strength & AI Insight mockup */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card-pro p-6 md:p-8 hover-lift">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg">Profile Strength</h3>
                <span className="text-amber-400 font-black text-xl">{completion}%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full mb-6 overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${completion}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
                {completion < 100 ? 'Complete your profile to stand out to companies and improve AI matching.' : 'Your profile is fully complete! You are ready for top matches.'}
              </p>
              <Link to="/candidate/profile" className="block">
                <button className="btn-pro-outline w-full font-bold text-[11px] uppercase tracking-wider py-3 rounded-lg">
                  Update Profile
                </button>
              </Link>
            </div>
            
            {/* Contextual Widget: Activity */}
            <div className="glass-card-pro p-6 md:p-8 hover-lift">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Bell className="text-emerald-400" size={14} />
                </div>
                Recent Activity
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[1px] before:bg-white/10">
                <div className="relative flex items-center gap-4 group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-[#0f172a] text-emerald-400 z-10">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  </div>
                  <div className="flex-1 p-3.5 rounded-xl border border-white/[0.05] bg-black/20 hover:bg-black/40 transition-colors">
                    <p className="font-bold text-white text-xs">Welcome to HireHub!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Start by completing your profile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
