import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/Button';
import { jobService } from '../../services/jobService';
import { formatPostedAt } from '../../utils/dateUtils';
import CreateAssessment from '../../components/Assessment/CreateAssessment';
import { Briefcase, MapPin, Building, DollarSign, Calendar, Edit2, Trash2, ClipboardList, Loader2, RefreshCw } from 'lucide-react';

function EditJobForm({ job, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: job.title,
    description: job.description,
    location: job.location,
    company: job.company,
    salary: job.salary ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      const data = await jobService.updateJob(job._id, {
        title: form.title,
        description: form.description,
        location: form.location,
        company: form.company,
        salary: form.salary === '' ? null : Number(form.salary),
      });
      onSaved(data.job);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update job.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4">
      {error && <p className="text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-xs font-bold">{Array.isArray(error) ? error.join(', ') : error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required placeholder="Job title" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-lg transition-all" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Company name" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-lg transition-all" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input required placeholder="Location" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-lg transition-all" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Salary (optional)" type="number" className="bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-lg transition-all" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
      </div>
      <textarea required placeholder="Job description" rows={3} className="w-full bg-surface-container border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 focus:shadow-lg transition-all" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        <Button type="button" variant="ghost" className="border border-white/10" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function JobPosts() {
  const { user } = useSelector((state) => state.auth);

  const [myJobs, setMyJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [assessmentJobId, setAssessmentJobId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await jobService.getAllJobs();
        setMyJobs((data.jobs || []).filter(job => job.postedBy?._id === user?._id));
      } catch {
        setError('Failed to load your jobs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user, reloadKey]);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Deactivate this job posting? It will stop accepting applications.')) return;
    try {
      await jobService.deleteJob(jobId);
      setMyJobs(prev => prev.filter(j => j._id !== jobId));
    } catch {
      setError('Failed to delete job.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <header className="flex justify-between items-center mb-8 glass-card-pro p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="font-bold text-3xl md:text-4xl text-white">Job Posts</h1>
          <p className="text-slate-400 font-medium mt-2">Manage the jobs your company has posted.</p>
        </div>
        <button 
          onClick={() => setReloadKey(k => k + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-white/10 hover:border-emerald-400 hover:text-emerald-400 rounded-xl text-sm font-bold text-white transition-all relative z-10 shadow-md"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-center mb-6 text-sm font-bold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={40} className="animate-spin text-emerald-500" />
        </div>
      ) : myJobs.length === 0 ? (
        <div className="glass-card p-10 text-center text-on-surface-variant flex flex-col items-center justify-center">
          <Briefcase size={48} className="text-white/10 mb-4" />
          <p>You haven't posted any jobs yet. Post one from your Dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myJobs.map(job => (
            <div key={job._id} className="glass-card-pro p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all hover-lift">
              {editingId === job._id ? (
                <EditJobForm
                  job={job}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updatedJob) => {
                    setMyJobs(prev => prev.map(j => (j._id === job._id ? updatedJob : j)));
                    setEditingId(null);
                  }}
                />
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-white mb-2">{job.title}</h3>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-md border border-white/5">
                        <Building size={14} className="text-emerald-400" /> {job.company}
                      </span>
                      <span className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-md border border-white/5">
                        <MapPin size={14} className="text-amber-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-md border border-white/5">
                        <DollarSign size={14} className="text-emerald-400" /> {job.salary ? `EGP ${job.salary.toLocaleString()}` : 'Not disclosed'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-1 rounded-md border border-white/5">
                        <Calendar size={14} className="text-emerald-500" /> {formatPostedAt(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                    <button 
                      onClick={() => setAssessmentJobId(job._id === assessmentJobId ? null : job._id)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${
                        assessmentJobId === job._id 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg'
                          : 'bg-surface-container border-white/10 text-white hover:border-emerald-400 hover:text-emerald-400'
                      }`}
                    >
                      <ClipboardList size={16} />
                      {assessmentJobId === job._id ? 'Cancel' : 'Assessments'}
                    </button>
                    
                    <button 
                      onClick={() => setEditingId(job._id)}
                      className="flex items-center justify-center p-2.5 bg-surface-container border border-white/10 rounded-xl text-on-surface-variant hover:text-white hover:border-white transition-all"
                      title="Edit Job"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(job._id)}
                      className="flex items-center justify-center p-2.5 bg-surface-container border border-white/10 rounded-xl text-on-surface-variant hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
                      title="Delete Job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Assessment Creation UI */}
              {assessmentJobId === job._id && !editingId && (
                <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                  <CreateAssessment 
                    jobId={job._id} 
                    onSuccess={() => setAssessmentJobId(null)} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
