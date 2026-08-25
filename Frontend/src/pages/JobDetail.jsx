import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { candidateService } from '../services/candidateService';
import { formatPostedAt } from '../utils/dateUtils';
import { Building2, MapPin, Send, Bookmark, BookmarkCheck, FileText, Info, Loader2 } from 'lucide-react';

const SAVED_JOBS_KEY = 'hirehub_saved_jobs';

// Bookmarks are client-only for now; a server-side saved-jobs collection is
// tracked as a follow-up in IMPROVEMENTS.md.
const readSavedJobs = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_JOBS_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function JobDetail() {
  const { id } = useParams();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset } = useForm();

  // The CV is resolved server-side from the candidate's profile; this is shown
  // read-only so the modal states what will actually be submitted.
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    if (user?.role === 'candidate') {
      candidateService.getMyProfile().then(data => {
        if (data.profile?.resumeUrl) {
          setResumeUrl(data.profile.resumeUrl);
        }
      }).catch(() => {});
    }
  }, [user]);

  const hasDefaultCv = Boolean(resumeUrl);
  const resumeFileName = resumeUrl ? resumeUrl.split('/').pop() : null;

  const [savedJobs, setSavedJobs] = useState(readSavedJobs);
  const isSaved = savedJobs.includes(id);

  const toggleSaved = () => {
    const next = isSaved ? savedJobs.filter((jobId) => jobId !== id) : [...savedJobs, id];
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
    setSavedJobs(next);
    toast.success(isSaved ? 'Job removed from saved' : 'Job saved for later');
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await jobService.getJobById(id);
        setJob(data.job);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Job not found' : 'Failed to load job details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async (data) => {
    try {
      setIsSubmitting(true);
      await applicationService.applyToJob(id, {
        notes: data.coverNote || ''
      });
      toast.success('Application submitted successfully!');
      setIsApplyModalOpen(false);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <DashboardHeader />
        <div className="flex items-center justify-center py-32 w-full">
          <Loader2 size={40} className="animate-spin text-emerald-400" />
        </div>
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <DashboardHeader />
        <div className="max-w-6xl mx-auto px-4 py-8 w-full">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-none rounded-xl p-6 text-center font-bold">
            {error || 'Job not found'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Main Job Detail Column */}
          <div className="flex-1 space-y-6">

            {/* Header Card */}
            <div className="glass-card-pro-pro rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-16 h-16 bg-surface-container rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                    <Building2 size={32} className="text-amber-400" />
                  </div>
                  <div>
                    <h1 className="font-bold text-3xl text-white mb-2">
                      {job.title}
                    </h1>
                    <p className="text-amber-400 font-bold mb-4">{job.company}</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg border border-white/5 text-xs text-on-surface-variant font-medium">
                        <MapPin size={14} className="text-amber-500" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 flex gap-8 px-2 relative z-10">
              {['Overview', 'Company', 'Benefits', 'Reviews'].map(tab => (
                <button
                  key={tab}
                  className={`pb-3 text-sm font-bold transition-all ${activeTab === tab ? 'border-b-2 border-emerald-500 text-emerald-400 shadow-[0_4px_10px_rgba(99,102,241,0.5)]' : 'text-on-surface-variant hover:text-white'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Job Description Content */}
            <div className="space-y-8 text-on-surface-variant leading-relaxed text-sm relative z-10">
              {activeTab === 'Overview' ? (
                <section className="glass-card-pro p-6">
                  <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <Info size={20} className="text-emerald-400" />
                    About the role
                  </h3>
                  <p className="whitespace-pre-line text-white/80">{job.description}</p>
                </section>
              ) : (
                <section className="text-center py-12 text-on-surface-variant glass-card-pro p-6">
                  No {activeTab.toLowerCase()} information available for this job yet.
                </section>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="glass-card-pro-pro p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                <h3 className="font-bold text-white text-lg mb-2 relative z-10">Apply Now</h3>
                <p className="text-xs text-on-surface-variant mb-6 relative z-10">This position is currently open for applications.</p>
                <div className="space-y-4 relative z-10">
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-none"
                  >
                    Submit Application
                    <Send size={18} />
                  </button>
                  <button
                    onClick={toggleSaved}
                    aria-pressed={isSaved}
                    className={`w-full border py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isSaved
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-none'
                        : 'border-white/10 hover:bg-white/5 text-white'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    {isSaved ? 'Saved' : 'Save for Later'}
                  </button>
                </div>

                <hr className="my-6 border-white/10 relative z-10"/>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Posted:</span>
                    <span className="text-white font-bold">{formatPostedAt(job.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Salary Range:</span>
                    <span className="text-emerald-400 font-bold">
                      {job.salary ? `EGP ${job.salary.toLocaleString()}` : 'Not disclosed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleSubmit(handleApply)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Your CV</label>
            {hasDefaultCv ? (
              <>
                <div className="w-full bg-surface-container border border-white/10 rounded-xl py-3 px-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-900/20 text-amber-400 shrink-0">
                    <FileText size={20} />
                  </div>
                  <p className="font-bold text-white text-sm truncate flex-1">{resumeFileName}</p>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  Your default resume will be submitted with this application.{' '}
                  <Link to="/candidate/cv" className="underline hover:text-amber-400">Change it in your CV Manager</Link>.
                </p>
              </>
            ) : (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mt-2">
                No default CV found! <Link to="/candidate/cv" className="underline font-bold">Upload one in your profile</Link> before applying.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cover Note (Optional)</label>
            <textarea
              {...register("coverNote")}
              className="w-full bg-surface-container border border-white/10 rounded-xl py-3 px-4 text-white focus:border-emerald-500 focus:shadow-none focus:outline-none resize-none transition-all"
              placeholder="Explain why you're a great fit for this role..."
              rows="5"
            ></textarea>
          </div>
          <div className="bg-amber-500/10 p-4 rounded-xl flex items-start gap-3 border border-amber-500/20">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-400/90 leading-relaxed">Your profile and contact details will be shared with the employer's recruitment team automatically.</p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="ghost"
              type="button"
              className="flex-1 border border-white/10"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-white shadow-none"
              disabled={isSubmitting || !hasDefaultCv}
              title={!hasDefaultCv ? 'Upload a CV in your profile before applying' : undefined}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
