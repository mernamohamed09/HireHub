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
        <div className="flex items-center justify-center py-3xl">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <DashboardHeader />
        <div className="max-w-6xl mx-auto px-gutter py-xl w-full">
          <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-xl text-center">
            {error || 'Job not found'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="max-w-6xl mx-auto px-gutter py-xl w-full">
        <div className="flex flex-col lg:flex-row gap-lg">

          {/* Main Job Detail Column */}
          <div className="flex-1 space-y-lg">

            {/* Header Card */}
            <div className="bg-surface-container rounded-xl p-xl border border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16"></div>
              <div className="flex items-start justify-between">
                <div className="flex gap-lg">
                  <div className="w-16 h-16 bg-surface-container-high rounded-lg flex items-center justify-center p-sm shrink-0 shadow-xl shadow-black/20">
                    <span className="material-symbols-outlined text-on-surface-variant text-[32px]">corporate_fare</span>
                  </div>
                  <div>
                    <h1 className="font-h2 text-h2 text-on-surface flex items-center gap-sm">
                      {job.title}
                    </h1>
                    <p className="text-tertiary font-medium">{job.company}</p>
                    <div className="flex flex-wrap gap-md mt-md">
                      <div className="flex items-center gap-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span className="text-caption">{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-outline-variant flex gap-xl px-sm">
              {['Overview', 'Company', 'Benefits', 'Reviews'].map(tab => (
                <button
                  key={tab}
                  className={`pb-md transition-all ${activeTab === tab ? 'border-b-2 border-tertiary text-tertiary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Job Description Content */}
            <div className="space-y-xl text-on-surface-variant leading-relaxed">
              {activeTab === 'Overview' ? (
                <section>
                  <h3 className="font-h3 text-h3 text-on-surface mb-md">About the role</h3>
                  <p className="whitespace-pre-line">{job.description}</p>
                </section>
              ) : (
                <section className="text-center py-xl text-on-surface-variant">
                  No {activeTab.toLowerCase()} information available for this job yet.
                </section>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 space-y-lg">
              <div className="bg-surface-container rounded-xl p-lg border border-outline-variant shadow-lg">
                <h3 className="font-h3 text-h3 mb-md">Apply Now</h3>
                <p className="text-caption text-on-surface-variant mb-lg">This position is currently open for applications.</p>
                <div className="space-y-md">
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full bg-primary-container text-on-primary-container py-md rounded-lg font-bold hover:bg-primary transition-all flex items-center justify-center gap-sm shadow-lg shadow-primary-container/20"
                  >
                    Submit Application
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                  <button
                    onClick={toggleSaved}
                    aria-pressed={isSaved}
                    className={`w-full border py-md rounded-lg font-bold transition-all flex items-center justify-center gap-sm ${
                      isSaved
                        ? 'border-tertiary text-tertiary bg-tertiary/10 hover:bg-tertiary/20'
                        : 'border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isSaved ? 'bookmark_added' : 'bookmark'}
                    </span>
                    {isSaved ? 'Saved' : 'Save for Later'}
                  </button>
                </div>

                <hr className="my-lg border-outline-variant"/>

                <div className="space-y-md">
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">Posted:</span>
                    <span className="text-on-surface font-medium">{formatPostedAt(job.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-caption">
                    <span className="text-on-surface-variant">Salary Range:</span>
                    <span className="text-tertiary font-bold">
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
        <form onSubmit={handleSubmit(handleApply)} className="space-y-lg">
          <div className="space-y-sm">
            <label className="block font-label-tag text-on-surface-variant uppercase">Your CV</label>
            {hasDefaultCv ? (
              <>
                <div className="w-full bg-surface-container border border-outline-variant rounded-lg py-md px-md flex items-center gap-md">
                  <div className="w-10 h-10 rounded flex items-center justify-center bg-red-900/20 shrink-0">
                    <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                  </div>
                  <p className="font-bold text-on-surface text-sm truncate flex-1">{resumeFileName}</p>
                </div>
                <p className="text-caption text-on-surface-variant mt-1">
                  Your default resume will be submitted with this application.{' '}
                  <Link to="/candidate/cv" className="underline hover:text-tertiary">Change it in your CV Manager</Link>.
                </p>
              </>
            ) : (
              <p className="text-caption text-error mt-1">
                No default CV found! <Link to="/candidate/cv" className="underline hover:text-error/80">Upload one in your profile</Link> before applying.
              </p>
            )}
          </div>
          <div className="space-y-sm">
            <label className="block font-label-tag text-on-surface-variant uppercase">Cover Note (Optional)</label>
            <textarea
              {...register("coverNote")}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-md px-md text-on-surface focus:ring-2 focus:ring-tertiary focus:outline-none resize-none"
              placeholder="Explain why you're a great fit for this role..."
              rows="5"
            ></textarea>
          </div>
          <div className="bg-surface-container-high/50 p-md rounded-lg flex items-start gap-md border border-outline-variant">
            <span className="material-symbols-outlined text-tertiary">info</span>
            <p className="text-caption text-on-surface-variant">Your profile and contact details will be shared with the employer's recruitment team automatically.</p>
          </div>
          <div className="flex gap-md pt-md">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1 shadow-lg shadow-primary-container/20"
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
