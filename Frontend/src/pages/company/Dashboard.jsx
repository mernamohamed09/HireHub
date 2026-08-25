import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, PresentationControls } from '@react-three/drei';
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

function AnimatedSphere() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <PresentationControls global config={{ mass: 2, tension: 500 }} snap={{ mass: 4, tension: 1500 }} rotation={[0, 0.3, 0]} polar={[-Math.PI / 3, Math.PI / 3]} azimuth={[-Math.PI / 1.4, Math.PI / 2]}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 4]} />
          <meshStandardMaterial color="#10b981" wireframe opacity={0.6} transparent emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
        {/* Inner solid core */}
        <Sphere args={[0.7, 32, 32]}>
          <MeshDistortMaterial color="#0f766e" attach="material" distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
        </Sphere>
      </Float>
    </PresentationControls>
  );
}


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
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white tracking-tight">Welcome back, <span className="text-gradient-emerald font-extrabold drop-shadow-sm">{companyName}</span></h1>
            <p className="text-slate-400 font-medium mt-2">Here is what's happening with your recruitment pipeline today.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowCreateJob(true)}
              className="btn-pro-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold whitespace-nowrap w-full md:w-auto text-sm"
            >
              <Plus size={18} />
              Post New Job
            </button>
            <Link to="/company/ats" className="w-full">
              <button className="btn-pro-outline flex items-center justify-center w-full gap-2 px-6 py-3 rounded-xl font-bold text-sm">
                <KanbanSquare size={18} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[auto]">
            {/* Masonry Dashboard Layout */}
              
              {/* Analytics / Stats Card (Highlight) */}
              <div className="xl:col-span-1 xl:row-span-2 relative group hover-lift rounded-[26px]">
                {/* Glowing Emerald Border Wrapper */}
                <div className="absolute inset-0 bg-emerald-500 rounded-[26px] opacity-20 group-hover:opacity-40 blur-[10px] transition-all"></div>
                
                {/* Inner Card content */}
                <div className="glass-card-pro h-full p-6 flex flex-col z-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-white font-bold text-lg z-10">Total Applicants</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 z-10 shadow-none">
                        <Users size={20} />
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-12 mb-4">
                      <p className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight">{totalApplicants}</p>
                      <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-full text-amber-400 text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <TrendingUp size={16} /> +12% this week
                      </div>
                    </div>
                  </div>
                  
                  {/* Interactive 3D Sphere */}
                  <div className="absolute bottom-0 right-0 w-64 h-64 md:w-80 md:h-80 z-0 opacity-80 pointer-events-auto cursor-grab active:cursor-grabbing">
                    <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#10b981" />
                      <directionalLight position={[-10, -10, -5]} intensity={1} color="#34d399" />
                      <AnimatedSphere />
                    </Canvas>
                  </div>
                </div>
              </div>

              {/* Active Jobs Card */}
              <div className="xl:col-span-1 xl:row-span-1 glass-card-pro p-6 flex flex-col justify-between hover-lift relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-white font-bold text-lg">Active Job Posts</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-none">
                    <Briefcase size={20} />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between z-10">
                  <div className="flex flex-col">
                    <p className="text-5xl font-black text-white tracking-tight">{myJobs.length}</p>
                    <Link to="/company/jobs" className="text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors mt-2">Manage Jobs →</Link>
                  </div>
                  {/* CSS Circular Progress Mockup */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-white/10" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" className="stroke-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (Math.min(myJobs.length, 10) / 10))} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-white font-bold text-lg">{myJobs.length}/10</span>
                  </div>
                </div>
              </div>

              {/* Highlight Action Card */}
              <div className="xl:col-span-1 xl:row-span-1 glass-card-pro p-6 flex flex-col justify-between relative hover-lift group overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <Megaphone size={140} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-emerald-500/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-white text-xs font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Sparkles size={12} className="text-amber-400" /> Pro Tip
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-2">Need more talent?</h3>
                  <p className="text-slate-300 text-sm mb-6 max-w-[200px] font-medium">Post a new job and reach thousands of candidates instantly.</p>
                  <button onClick={() => setShowCreateJob(true)} className="btn-gold w-full py-3 rounded-xl font-bold text-sm">
                    Post Job Now
                  </button>
                </div>
              </div>

              {/* Recent Applicants (Horizontal Layouts) */}
              <div className="xl:col-span-2 xl:row-span-2 glass-card-pro p-6 space-y-6 flex flex-col hover-lift relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-xl">Recent Applicants</h3>
                    <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">{recentApplicants.length} New</span>
                  </div>
                  <Link to="/company/ats" className="text-emerald-400 text-sm font-bold hover:text-white transition-colors bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">View Pipeline</Link>
                </div>
                
                {recentApplicants.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/20 rounded-2xl border border-white/5">
                     <Users size={40} className="text-slate-500 mb-4" />
                     <p className="text-slate-400 font-medium">No applicants yet. Post a job to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10 flex-1">
                    {recentApplicants.map(applicant => {
                      const badge = STATUS_BADGE[applicant.status] || STATUS_BADGE.pending;
                      const isNew = applicant.status === 'pending';
                      
                      const badgeClass = applicant.status === 'rejected' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                                         applicant.status === 'accepted' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
                                         'text-amber-400 border-amber-400/30 bg-amber-400/10';

                      return (
                        <div key={applicant._id} className="bg-black/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-black/40 border border-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-sm">
                          <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl relative ${isNew ? 'bg-gradient-to-br from-amber-500 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/5 border border-white/10'}`}>
                            {applicant.applicant?.name?.[0] || '?'}
                            {isNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#0f172a] animate-pulse"></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{applicant.applicant?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{applicant.jobTitle}</p>
                          </div>
                          <span className={`border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
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
    <form onSubmit={handleSubmit} className="glass-card-pro p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Post a New Job</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>
      {error && <p className="text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required placeholder="Job title" className="glass-input-pro w-full rounded-xl px-4 py-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Company name" className="glass-input-pro w-full rounded-xl px-4 py-3" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input required placeholder="Location" className="glass-input-pro w-full rounded-xl px-4 py-3" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Salary (optional)" type="number" className="glass-input-pro w-full rounded-xl px-4 py-3" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
      </div>
      <textarea required placeholder="Job description" rows={3} className="glass-input-pro w-full rounded-xl px-4 py-3 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button type="submit" disabled={isSaving} className="btn-pro-primary w-full py-4 text-lg rounded-xl font-bold">
        {isSaving ? 'Posting...' : 'Post Job'}
      </button>
    </form>
  );
}
