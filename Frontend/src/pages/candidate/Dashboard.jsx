import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { jobService } from '../../services/jobService';
import { formatPostedAt } from '../../utils/dateUtils';
import { Search, Send, Hourglass, Eye, CheckCircle, Bell, Briefcase } from 'lucide-react';

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
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-4 bg-surface-container/30 backdrop-blur-md rounded-3xl border border-white/5 shadow-lg">
        <div>
          <h1 className="font-bold text-3xl md:text-4xl text-white">
            Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">{user?.name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm font-medium">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Welcome back to your recruitment command center.
          </p>
        </div>
        <Link to="/jobs">
          <button className="flex items-center gap-2 bg-gradient-to-r from-neon-purple to-neon-cyan text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(188,19,254,0.4)] active:scale-95">
            <Search size={16} /> Browse New Roles
          </button>
        </Link>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[auto] p-4">
          
          {/* Stats Grid (Top row in masonry) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-neon-purple/50 transition-all group relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2 z-10">Applications Sent</p>
              <div className="flex justify-between items-end z-10">
                <span className="text-4xl font-bold text-white">{applications.length}</span>
                <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20 group-hover:scale-110 transition-transform"><Send className="text-neon-purple" size={20} /></div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-neon-orange/50 transition-all group relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2 z-10">Pending Review</p>
              <div className="flex justify-between items-end z-10">
                <span className="text-4xl font-bold text-white">{pendingCount}</span>
                <div className="w-10 h-10 rounded-xl bg-neon-orange/10 flex items-center justify-center border border-neon-orange/20 group-hover:scale-110 transition-transform"><Hourglass className="text-neon-orange" size={20} /></div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-neon-cyan/50 transition-all group relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2 z-10">Reviewed</p>
              <div className="flex justify-between items-end z-10">
                <span className="text-4xl font-bold text-white">{reviewedCount}</span>
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/20 group-hover:scale-110 transition-transform"><Eye className="text-neon-cyan" size={20} /></div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-neon-mint/50 transition-all group relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2 z-10">Accepted</p>
              <div className="flex justify-between items-end z-10">
                <span className="text-4xl font-bold text-white">{acceptedCount}</span>
                <div className="w-10 h-10 rounded-xl bg-neon-mint/10 flex items-center justify-center border border-neon-mint/20 group-hover:scale-110 transition-transform"><CheckCircle className="text-neon-mint" size={20} /></div>
              </div>
            </div>
          </div>

          {/* Main Section: Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-card p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center z-10 relative">
                <h3 className="font-bold text-xl text-white">Recent Applications</h3>
                <Link to="/candidate/applications" className="text-neon-cyan text-sm font-bold hover:underline">View All</Link>
              </div>
              
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 bg-surface-container/30 rounded-2xl border border-white/5">
                  <p className="text-on-surface-variant font-medium relative z-10">You haven't applied to any jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {recentApplications.map(app => {
                    const statusColors = {
                      pending: 'text-neon-orange border-neon-orange/30 bg-neon-orange/10 shadow-glow-orange',
                      reviewed: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10 shadow-glow-cyan',
                      accepted: 'text-neon-mint border-neon-mint/30 bg-neon-mint/10 shadow-glow-mint',
                      rejected: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10 shadow-glow-pink',
                    };
                    const colorClass = statusColors[app.status] || statusColors.pending;

                    return (
                      <div key={app._id} className="bg-surface-container/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center font-bold text-xl text-white border border-white/10 shadow-inner group-hover:border-neon-purple/50 transition-colors">
                            {app.job?.company?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-neon-purple transition-colors">{app.job?.company || 'Unknown company'}</p>
                            <p className="text-xs text-on-surface-variant font-medium">{app.job?.title || 'Job removed'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${colorClass}`}>
                            {app.status}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{formatPostedAt(app.appliedAt || app.createdAt)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Latest Job Openings Grid */}
            <section className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-xl text-white">Latest Job Openings</h3>
              </div>
              {recommendedJobs.length === 0 ? (
                <div className="glass-card p-8 rounded-3xl border border-white/5 text-center">
                  <p className="text-on-surface-variant font-medium">No jobs available right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedJobs.map(job => (
                    <div key={job._id} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-neon-mint/50 transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-neon-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-surface-container border border-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-neon-mint/20 group-hover:border-neon-mint/30 group-hover:shadow-glow-mint transition-all">
                          <Briefcase className="text-white/40 group-hover:text-neon-mint transition-colors" size={20} />
                        </div>
                        <h4 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-neon-mint transition-colors">{job.title}</h4>
                        <p className="text-sm text-on-surface-variant font-medium mb-6 line-clamp-1">{job.company} • {job.location}</p>
                      </div>
                      <Link to={`/jobs/${job._id}`} className="relative z-10">
                        <button className="w-full py-3 bg-surface-container border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl group-hover:bg-neon-mint group-hover:border-neon-mint/50 group-hover:text-black group-hover:shadow-glow-mint transition-all">
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
            <div className="glass-card p-8 rounded-3xl border border-neon-purple/30 shadow-glow-purple relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent"></div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-bold text-white text-lg">Profile Strength</h3>
                <span className="text-neon-purple font-bold text-2xl drop-shadow-[0_0_5px_rgba(188,19,254,0.5)]">{completion}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full mb-6 overflow-hidden relative z-10 border border-white/10">
                <div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_10px_rgba(188,19,254,0.8)]" style={{ width: `${completion}%` }}></div>
              </div>
              <p className="text-sm text-on-surface-variant font-medium mb-8 relative z-10 leading-relaxed">
                {completion < 100 ? 'Complete your profile to stand out to companies and improve AI matching.' : 'Your profile is fully complete! You are ready for top matches.'}
              </p>
              <Link to="/candidate/profile" className="block relative z-10">
                <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all">
                  Update Profile
                </button>
              </Link>
            </div>
            
            {/* Contextual Widget: Activity */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-lg">
              <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-lg">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center shadow-glow-cyan">
                  <Bell className="text-neon-cyan" size={16} />
                </div>
                Recent Activity
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-neon-cyan/50 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-neon-cyan bg-surface text-neon-cyan shadow-glow-cyan z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl border border-white/10 bg-surface-container/50 hover:bg-white/5 transition-colors">
                    <p className="font-bold text-white text-sm">Welcome to HireHub!</p>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">Start by completing your profile.</p>
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
