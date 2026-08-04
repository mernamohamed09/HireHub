import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { companyService } from '../../services/companyService';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { Plus, KanbanSquare, Users, TrendingUp, Briefcase, Megaphone, X, Sparkles } from 'lucide-react';


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
      <div className="space-y-8 p-4">
        {/* Hero Welcome */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">Welcome back, <span className="bg-[linear-gradient(135deg,#ff69ead4_0%,#56289f_100%)] text-transparent bg-clip-text">{companyName}</span></h1>
            <p className="text-on-surface-variant font-medium mt-2">Here is what's happening with your recruitment pipeline today.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={() => setShowCreateJob(true)}
              className="gap-2 px-8 py-3 whitespace-nowrap w-full md:w-auto text-white border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Plus size={20} />
              Post New Job
            </Button>
            <Link to="/company/ats" className="w-full">
              <Button variant="ghost" className="w-full gap-2 px-6 py-3 border border-white/10 hover:border-neon-mint/30">
                <KanbanSquare size={20} />
                View ATS Board
              </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[auto]">
            {/* Masonry Dashboard Layout */}
              
              {/* Analytics / Stats Card (Highlight) */}
              <div className="xl:col-span-1 xl:row-span-2 relative group hover-lift rounded-[26px] p-[2px]">
                {/* Glowing Purple Border Wrapper */}
                <div className="absolute inset-0 bg-neon-purple rounded-[26px] opacity-40 group-hover:opacity-70 blur-[4px] transition-all"></div>
                <div className="absolute inset-0 bg-neon-purple rounded-[26px] opacity-50 group-hover:opacity-80 transition-all"></div>
                
                {/* Inner Card content */}
                <div className="relative h-full bg-[#11172A]/90 backdrop-blur-3xl rounded-[24px] p-6 flex flex-col z-10 overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-neon-purple/20 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-white font-h3 font-bold z-10">Total Applicants</span>
                      <div className="w-10 h-10 rounded-full bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple shadow-glow-purple z-10">
                        <Users size={20} />
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-12 mb-4">
                      <p className="text-7xl md:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-md">{totalApplicants}</p>
                      <div className="inline-flex items-center gap-2 bg-neon-purple/10 border border-neon-purple/40 px-4 py-2 rounded-full text-neon-purple text-sm font-bold shadow-[0_0_15px_rgba(110,92,255,0.2)]">
                        <TrendingUp size={16} /> +12% this week
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Area Chart to fill empty space */}
                  <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden rounded-b-[24px] pointer-events-none">
                    <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                      <path d="M0,80 L0,40 C30,50 60,10 100,25 C140,40 170,10 200,20 L200,80 Z" fill="url(#purpleAreaGlow)" />
                      <path d="M0,40 C30,50 60,10 100,25 C140,40 170,10 200,20" fill="none" stroke="#6E5CFF" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(110,92,255,0.8)]" />
                      {/* Glowing dot at the end of the trend line */}
                      <circle cx="200" cy="20" r="4" fill="#fff" className="drop-shadow-[0_0_8px_rgba(255,255,255,1)]" stroke="#6E5CFF" strokeWidth="2" />
                      <defs>
                        <linearGradient id="purpleAreaGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6E5CFF" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6E5CFF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Jobs Card */}
              <div className="xl:col-span-1 xl:row-span-1 glass-card-cyan p-6 flex flex-col justify-between hover-lift">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neon-cyan/20 blur-[50px] rounded-full pointer-events-none"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-white font-h3 font-bold">Active Job Posts</span>
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan shadow-glow-cyan">
                    <Briefcase size={20} />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between z-10">
                  <div className="flex flex-col">
                    <p className="text-5xl font-bold text-white tracking-tight">{myJobs.length}</p>
                    <Link to="/company/jobs" className="text-neon-cyan text-sm font-semibold hover:underline mt-2">Manage Jobs →</Link>
                  </div>
                  {/* CSS Circular Progress Mockup */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-white/10" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" className="stroke-neon-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (Math.min(myJobs.length, 10) / 10))} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-white font-bold text-lg">{myJobs.length}/10</span>
                  </div>
                </div>
              </div>

              {/* Highlight Action Card */}
              <div className="xl:col-span-1 xl:row-span-1 glass-card-pink p-6 flex flex-col justify-between relative hover-lift group overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <Megaphone size={140} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-neon-pink/20 border border-neon-pink/40 px-3 py-1 rounded-full text-white text-xs font-bold mb-4 shadow-glow-pink">
                    <Sparkles size={12} className="text-neon-pink" /> Pro Tip
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-2">Need more talent?</h3>
                  <p className="text-on-surface-variant text-sm mb-6 max-w-[200px]">Post a new job and reach thousands of candidates instantly.</p>
                  <Button variant="primary" onClick={() => setShowCreateJob(true)} className="w-full py-3 shadow-lg text-white/90 border-none opacity-90 hover:opacity-100 transition-opacity">
                    Post Job Now
                  </Button>
                </div>
              </div>

              {/* Recent Applicants (Horizontal Layouts) */}
              <div className="xl:col-span-2 xl:row-span-2 glass-card p-6 space-y-6 flex flex-col hover-lift relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-neon-mint/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-3">
                    <h3 className="font-h3 text-white font-bold text-xl">Recent Applicants</h3>
                    <span className="bg-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-full">{recentApplicants.length} New</span>
                  </div>
                  <Link to="/company/ats" className="text-neon-cyan text-sm font-semibold hover:underline bg-neon-cyan/10 px-4 py-1.5 rounded-full border border-neon-cyan/20">View Pipeline</Link>
                </div>
                
                {recentApplicants.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface-container/30 rounded-2xl border border-white/5 border-dashed">
                     <Users size={40} className="text-white/20 mb-4" />
                     <p className="text-on-surface-variant font-medium">No applicants yet. Post a job to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10 flex-1">
                    {recentApplicants.map(applicant => {
                      const badge = STATUS_BADGE[applicant.status] || STATUS_BADGE.pending;
                      const isNew = applicant.status === 'pending';
                      
                      const neonBadgeClass = applicant.status === 'rejected' ? 'text-neon-pink border-neon-pink/30 bg-neon-pink/10 shadow-glow-pink' :
                                             applicant.status === 'accepted' ? 'text-neon-mint border-neon-mint/30 bg-neon-mint/10 shadow-glow-mint' :
                                             'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10 shadow-glow-cyan';

                      return (
                        <div key={applicant._id} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all cursor-pointer group">
                          <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl relative ${isNew ? 'bg-gradient-to-br from-neon-cyan to-neon-purple shadow-glow-cyan' : 'bg-surface-container-high border border-white/10'}`}>
                            {applicant.applicant?.name?.[0] || '?'}
                            {isNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full border-2 border-background animate-pulse"></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate group-hover:text-neon-cyan transition-colors">{applicant.applicant?.name || 'Unknown'}</p>
                            <p className="text-xs text-on-surface-variant truncate mt-0.5">{applicant.jobTitle}</p>
                          </div>
                          <span className={`border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${neonBadgeClass}`}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
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
    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-mint to-neon-cyan"></div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Post a New Job</h3>
        <button type="button" onClick={onClose} className="text-white hover:text-neon-pink bg-surface-container-high p-2 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      {error && <p className="text-neon-pink text-sm font-bold bg-neon-pink/10 p-3 rounded-xl border border-neon-pink/20">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required placeholder="Job title" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-mint focus:shadow-glow-mint transition-all" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Company name" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-mint focus:shadow-glow-mint transition-all" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input required placeholder="Location" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-mint focus:shadow-glow-mint transition-all" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Salary (optional)" type="number" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-mint focus:shadow-glow-mint transition-all" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
      </div>
      <textarea required placeholder="Job description" rows={3} className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-neon-mint focus:shadow-glow-mint transition-all resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Button type="submit" disabled={isSaving} variant="ghost" className="w-full py-4 text-lg bg-surface-container border border-white/10 hover:border-white/30 text-white/90 hover:bg-white/5 transition-all">
        {isSaving ? 'Posting...' : 'Post Job'}
      </Button>
    </form>
  );
}
