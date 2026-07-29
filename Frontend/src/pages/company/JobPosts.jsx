import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/Button';
import { jobService } from '../../services/jobService';
import { formatPostedAt } from '../../utils/dateUtils';

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
    <form onSubmit={handleSubmit} className="bg-surface-container-high rounded-lg p-md space-y-sm">
      {error && <p className="text-error text-caption">{Array.isArray(error) ? error.join(', ') : error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
        <input required placeholder="Job title" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Company name" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <input required placeholder="Location" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Salary (optional)" type="number" className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
      </div>
      <textarea required placeholder="Job description" rows={3} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm outline-none focus:border-tertiary" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex gap-sm">
        <Button type="submit" variant="primary" size="sm" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
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
    <div className="w-full">
      <header className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface">Job Posts</h1>
          <p className="text-on-surface-variant mt-sm">Manage the jobs your company has posted.</p>
        </div>
        <Button variant="outline" onClick={() => setReloadKey(k => k + 1)}>Refresh</Button>
      </header>

      {error && (
        <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center mb-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-3xl">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : myJobs.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-xl text-center text-on-surface-variant">
          You haven't posted any jobs yet. Post one from your Dashboard.
        </div>
      ) : (
        <div className="space-y-md">
          {myJobs.map(job => (
            <div key={job._id} className="bg-surface-container rounded-xl border border-outline-variant p-lg">
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
                <div className="flex justify-between items-start gap-md">
                  <div>
                    <h3 className="font-h3 text-h3 text-on-surface">{job.title}</h3>
                    <p className="text-on-surface-variant text-body">{job.company} • {job.location}</p>
                    <p className="text-on-surface-variant text-caption mt-xs">
                      {job.salary ? `EGP ${job.salary.toLocaleString()}` : 'Salary not disclosed'} • {formatPostedAt(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-sm shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(job._id)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(job._id)}>Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
