import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';
import { formatPostedAt } from '../../utils/dateUtils';

const COLUMNS = [
  { key: 'pending', title: 'Pending' },
  { key: 'reviewed', title: 'Reviewed' },
  { key: 'accepted', title: 'Accepted' },
  { key: 'rejected', title: 'Rejected' },
];

// Maps an application's aiAnalysis to a badge label/style, or null if there's
// nothing to show yet (e.g. a legacy application with no aiAnalysis at all).
const getMatchBadge = (aiAnalysis) => {
  if (!aiAnalysis) return null;

  if (aiAnalysis.status === 'pending' || aiAnalysis.status === 'processing') {
    return { label: 'Analyzing…', className: 'bg-surface-container-highest text-on-surface-variant' };
  }
  if (aiAnalysis.status === 'failed') {
    const isUnreadable = /resume file (is missing|could not be read)|unreadable/i.test(aiAnalysis.lastError || '');
    return {
      label: isUnreadable ? 'Unreadable Resume' : 'AI Analysis Failed',
      title: aiAnalysis.lastError || 'The AI analysis could not be completed.',
      className: 'bg-surface-container-highest text-on-surface-variant',
    };
  }

  const score = aiAnalysis.matchScore ?? 0;
  if (score >= 80) return { label: `${score}% Top Match`, className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' };
  if (score >= 60) return { label: `${score}% Moderate Match`, className: 'bg-amber-500/20 text-amber-400' };
  return { label: `${score}% Low Match`, className: 'bg-rose-500/20 text-rose-400' };
};

const AiSkillTags = ({ skills }) => {
  if (!skills?.length) return null;

  return (
    <div className="flex flex-wrap gap-xs mb-md">
      {skills.slice(0, 4).map((skill) => (
        <span
          key={skill}
          className="flex items-center gap-1 bg-tertiary-container/20 text-tertiary text-[10px] uppercase tracking-wider px-sm py-1 rounded-full font-label-tag border border-tertiary-container/30"
        >
          <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
          {skill}
        </span>
      ))}
    </div>
  );
};

const CandidateCard = ({ candidate, onStatusChange, onMessageClick, onViewCv, onReanalyze }) => {
  const matchBadge = getMatchBadge(candidate.aiAnalysis);

  return (
  <div className="bg-surface-container border border-outline-variant rounded-xl p-md shadow-md hover:border-primary-container transition-all">
    <div className="flex items-start justify-between gap-sm">
      <p className="font-body text-body font-bold text-on-surface">{candidate.applicant?.name || 'Unknown'}</p>
      {matchBadge && (
        <span
          title={matchBadge.title}
          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-sm py-1 rounded-full ${matchBadge.className}`}
        >
          {matchBadge.label}
        </span>
      )}
    </div>
    <p className="font-caption text-caption text-on-surface-variant mb-md">
      Applied {formatPostedAt(candidate.appliedAt || candidate.createdAt)}
    </p>
    <AiSkillTags skills={candidate.aiAnalysis?.matchedSkills} />
    {candidate.aiAnalysis?.missingRequiredSkills?.length > 0 && (
      <p className="text-[10px] text-rose-400 mb-sm">
        Missing: {candidate.aiAnalysis.missingRequiredSkills.slice(0, 3).join(', ')}
      </p>
    )}
    {candidate.applicant?.skills?.length > 0 && (
      <div className="flex flex-wrap gap-xs mb-md">
        {candidate.applicant.skills.slice(0, 3).map(tag => (
          <span key={tag} className="bg-surface-container-highest text-on-surface text-[10px] uppercase tracking-wider px-sm py-1 rounded-full font-label-tag">
            {tag}
          </span>
        ))}
      </div>
    )}
    <select
      value={candidate.status}
      onChange={(e) => onStatusChange(candidate._id, e.target.value)}
      className="w-full py-xs border border-outline-variant rounded-lg font-caption text-caption bg-surface-container-low text-on-surface-variant px-sm outline-none"
    >
      {COLUMNS.map(col => (
        <option key={col.key} value={col.key}>{col.title}</option>
      ))}
    </select>
    <div className="flex gap-sm mt-sm">
      {candidate.cvUrl ? (
        <button
          type="button"
          onClick={() => onViewCv(candidate._id)}
          className="flex-1 py-xs bg-surface-container-highest text-on-surface rounded-lg font-caption text-caption font-bold hover:brightness-110 flex items-center justify-center gap-xs transition-all border border-outline-variant"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          View CV
        </button>
      ) : (
        <button 
          disabled
          title="No CV attached"
          className="flex-1 py-xs bg-surface-container-lowest text-on-surface-variant/50 rounded-lg font-caption text-caption font-bold flex items-center justify-center gap-xs border border-outline-variant/30 cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          No CV
        </button>
      )}
      <button 
        onClick={() => onMessageClick(candidate.applicant._id)}
        className="flex-1 py-xs bg-primary-container text-on-primary-container rounded-lg font-caption text-caption font-bold hover:brightness-110 flex items-center justify-center gap-xs transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">chat</span>
        Message
      </button>
      <button
        type="button"
        title="Reanalyze with the latest ATS model"
        aria-label="Reanalyze application"
        onClick={() => onReanalyze(candidate._id)}
        className="w-9 py-xs bg-surface-container-highest text-tertiary rounded-lg hover:brightness-110 flex items-center justify-center border border-outline-variant"
      >
        <span className="material-symbols-outlined text-[16px]">refresh</span>
      </button>
    </div>
  </div>
  );
};

const KanbanColumn = ({ title, items, onStatusChange, onMessageClick, onViewCv, onReanalyze }) => (
  <section className="min-w-[280px] max-w-[320px] flex flex-col h-[calc(100vh-200px)]">
    <div className="flex items-center justify-between mb-md px-xs">
      <div className="flex items-center gap-sm">
        <h2 className="font-body text-body font-bold text-on-surface">{title}</h2>
        <span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-sm py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
    </div>
    <div className="flex-1 space-y-md overflow-y-auto custom-scrollbar pr-xs">
      {items.map(candidate => (
        <CandidateCard key={candidate._id} candidate={candidate} onStatusChange={onStatusChange} onMessageClick={onMessageClick} onViewCv={onViewCv} onReanalyze={onReanalyze} />
      ))}
    </div>
  </section>
);

export function ATSBoard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const socket = useSocket();

  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortMode, setSortMode] = useState('latest');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await jobService.getAllJobs();
        const ownJobs = (data.jobs || []).filter(job => job.postedBy?._id === user?._id);
        setMyJobs(ownJobs);
        setSelectedJobId(ownJobs[0]?._id || null);
      } catch {
        setError('Failed to load your jobs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  // The sort mode is sent to the server so the ranking is authoritative (and
  // stays correct once these lists paginate). Toggling sort does not refetch -
  // the memo below re-orders what's already loaded - so switching stays instant
  // and never resets scroll position.
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!selectedJobId) {
        setApplicants([]);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await applicationService.getApplicantsForJob(
          selectedJobId,
          sortMode === 'ai_score' ? 'ai_score' : undefined
        );
        setApplicants(data.applicants || []);
      } catch {
        setError('Failed to load applicants for this job.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
    // sortMode is intentionally not a dependency: re-sorting is done client-side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId]);

  // Real-time sync: update a candidate's badge/skills in place as soon as the
  // backend finishes AI analysis, without refetching the whole board. Uses the
  // shared authenticated socket connection.
  useEffect(() => {
    if (!socket) return;

    const onAiCompleted = (payload) => {
      setApplicants(prev => prev.map(a => (
        a._id === payload.applicationId
          ? {
              ...a,
              aiAnalysis: {
                ...a.aiAnalysis,
                status: payload.status,
                matchScore: payload.matchScore ?? a.aiAnalysis?.matchScore,
                matchedSkills: payload.matchedSkills ?? a.aiAnalysis?.matchedSkills,
                missingRequiredSkills: payload.missingRequiredSkills ?? a.aiAnalysis?.missingRequiredSkills,
                scoreBreakdown: payload.scoreBreakdown ?? a.aiAnalysis?.scoreBreakdown,
                requiredYears: payload.requiredYears ?? a.aiAnalysis?.requiredYears,
                candidateYears: payload.candidateYears ?? a.aiAnalysis?.candidateYears,
                scoringVersion: payload.scoringVersion ?? a.aiAnalysis?.scoringVersion,
              },
            }
          : a
      )));
    };
    socket.on('application_ai_completed', onAiCompleted);

    return () => socket.off('application_ai_completed', onAiCompleted);
  }, [socket]);

  // Sorting is derived client-side from the already-loaded applicants, so
  // toggling it never refetches, flashes a loader, or resets scroll position.
  const sortedApplicants = useMemo(() => {
    if (sortMode !== 'ai_score') return applicants;

    const effectiveScore = (candidate) => (
      typeof candidate.aiAnalysis?.matchScore === 'number' ? candidate.aiAnalysis.matchScore : -1
    );

    return [...applicants].sort((a, b) => {
      const scoreDiff = effectiveScore(b) - effectiveScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt);
    });
  }, [applicants, sortMode]);

  const handleStatusChange = async (applicationId, status) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status);
      setApplicants(prev => prev.map(a => (a._id === applicationId ? { ...a, status } : a)));
    } catch {
      setError('Failed to update applicant status.');
    }
  };

  const handleMessageClick = async (applicantId) => {
    try {
      await chatService.getOrCreateConversation(applicantId);
      navigate('/chat');
    } catch {
      setError('Failed to start conversation.');
    }
  };

  const handleViewCv = async (applicationId) => {
    try {
      const blob = await applicationService.downloadCv(applicationId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError('Could not open this CV.');
    }
  };

  const handleReanalyze = async (applicationId) => {
    try {
      await applicationService.reanalyze(applicationId);
      setApplicants((current) => current.map((application) =>
        application._id === applicationId
          ? { ...application, aiAnalysis: { ...application.aiAnalysis, status: 'pending' } }
          : application
      ));
    } catch {
      setError('Could not queue this application for reanalysis.');
    }
  };

  const selectedJob = myJobs.find(j => j._id === selectedJobId);

  return (
    <div className="flex flex-col h-full overflow-hidden w-full relative">
      {/* Top Navigation / Header */}
      <header className="bg-surface-container/50 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center justify-between px-md w-full mb-lg -mt-lg mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)] z-40 relative">
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-tertiary">work_history</span>
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="font-h3 text-h3 text-on-surface bg-transparent outline-none"
          >
            {myJobs.length === 0 && <option value="">No jobs posted yet</option>}
            {myJobs.map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
          {selectedJob && (
            <span className="font-caption text-caption text-on-surface-variant bg-surface-container-highest px-xs rounded ml-sm">
              {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className="font-caption text-caption text-on-surface-variant bg-surface-container-highest rounded-lg px-sm py-1 outline-none border border-outline-variant"
        >
          <option value="latest">Sort by: Latest Applied</option>
          <option value="ai_score">Sort by: AI Match Score</option>
        </select>
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
          You haven't posted any jobs yet. Post a job from your Dashboard to start reviewing applicants.
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto custom-scrollbar relative mx-[-24px] lg:mx-[-32px] px-lg lg:px-xl pb-lg">
          <div className="flex h-full gap-lg min-w-max relative z-10 pt-md">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.key}
                title={col.title}
                items={sortedApplicants.filter(a => a.status === col.key)}
                onStatusChange={handleStatusChange}
                onMessageClick={handleMessageClick}
                onViewCv={handleViewCv}
                onReanalyze={handleReanalyze}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
