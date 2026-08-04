import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';
import { formatPostedAt } from '../../utils/dateUtils';
import AssessmentStatusView from '../../components/Assessment/AssessmentStatusView';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import {
  Sparkles, RefreshCw, FileText, MessageSquare, ChevronDown, ChevronUp,
  Briefcase, CheckCircle, XCircle, AlertCircle, Eye, Loader2, Send
} from 'lucide-react';

const COLUMNS = [
  { key: 'pending', title: 'Pending' },
  { key: 'reviewed', title: 'Reviewed' },
  { key: 'accepted', title: 'Accepted' },
  { key: 'rejected', title: 'Rejected' },
];

const getMatchBadge = (aiAnalysis) => {
  if (!aiAnalysis) return null;

  if (aiAnalysis.status === 'pending' || aiAnalysis.status === 'processing') {
    return { label: 'Analyzing…', className: 'bg-surface-container-high border-white/10 text-on-surface-variant' };
  }
  if (aiAnalysis.status === 'failed') {
    const isUnreadable = /resume file (is missing|could not be read)|unreadable/i.test(aiAnalysis.lastError || '');
    return {
      label: isUnreadable ? 'Unreadable Resume' : 'AI Analysis Failed',
      title: aiAnalysis.lastError || 'The AI analysis could not be completed.',
      className: 'bg-neon-pink/10 border-neon-pink/20 text-neon-pink shadow-glow-pink',
    };
  }

  const score = aiAnalysis.matchScore ?? 0;
  if (score >= 80) return { label: `${score}% Top Match`, className: 'bg-neon-mint/10 border-neon-mint/30 text-neon-mint shadow-glow-mint' };
  if (score >= 60) return { label: `${score}% Moderate Match`, className: 'bg-neon-orange/10 border-neon-orange/30 text-neon-orange shadow-glow-orange' };
  return { label: `${score}% Low Match`, className: 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink shadow-glow-pink' };
};

const AiSkillTags = ({ skills }) => {
  if (!skills?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {skills.slice(0, 4).map((skill) => (
        <span
          key={skill}
          className="flex items-center gap-1 bg-neon-purple/10 text-neon-purple text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-neon-purple/20 shadow-glow-purple"
        >
          <Sparkles size={10} />
          {skill}
        </span>
      ))}
    </div>
  );
};

const CandidateCard = ({ candidate, availableAssessments, onStatusChange, onMessageClick, onViewCv, onReanalyze }) => {
  const matchBadge = getMatchBadge(candidate.aiAnalysis);
  const [showAssessments, setShowAssessments] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [invitingAssesmentId, setInvitingAssesmentId] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchInvitations = async () => {
    setLoadingInvites(true);
    try {
      const response = await api.get(`/applications/${candidate._id}/invitations`);
      setInvitations(response.data.invitations);
    } catch (err) {
      toast.error('Failed to load invitations');
    } finally {
      setLoadingInvites(false);
    }
  };

  const toggleAssessments = () => {
    if (!showAssessments && invitations.length === 0) {
      fetchInvitations();
    }
    setShowAssessments(!showAssessments);
  };

  const handleInvite = async () => {
    if (!invitingAssesmentId) return;
    setIsInviting(true);
    try {
      const response = await api.post(`/applications/${candidate._id}/assessments/${invitingAssesmentId}/invite`);
      toast.success('Candidate invited successfully');
      setInvitations([response.data.invitation, ...invitations]);
      setInvitingAssesmentId('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite candidate');
    } finally {
      setIsInviting(false);
    }
  };

  return (
  <div className="glass-card p-5 hover:border-neon-purple/50 transition-all flex flex-col relative overflow-hidden group hover-lift">
    {/* Decorative background glow based on score if top match */}
    {candidate.aiAnalysis?.matchScore >= 80 && (
      <div className="absolute top-0 right-0 w-24 h-24 bg-neon-mint/5 blur-2xl rounded-full"></div>
    )}

    <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
      <p className="font-bold text-white text-sm">{candidate.applicant?.name || 'Unknown'}</p>
      {matchBadge && (
        <span
          title={matchBadge.title}
          className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${matchBadge.className}`}
        >
          {matchBadge.label}
        </span>
      )}
    </div>
    <p className="text-[10px] text-on-surface-variant mb-4 relative z-10">
      Applied {formatPostedAt(candidate.appliedAt || candidate.createdAt)}
    </p>

    <AiSkillTags skills={candidate.aiAnalysis?.matchedSkills} />

    {candidate.aiAnalysis?.missingRequiredSkills?.length > 0 && (
      <p className="text-[10px] text-neon-pink mb-3 flex items-center gap-1 relative z-10">
        <AlertCircle size={10} />
        Missing: {candidate.aiAnalysis.missingRequiredSkills.slice(0, 3).join(', ')}
      </p>
    )}

    {candidate.applicant?.skills?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
        {candidate.applicant.skills.slice(0, 3).map(tag => (
          <span key={tag} className="bg-surface-container text-white/70 border border-white/5 text-[9px] uppercase tracking-wider px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    )}

    <select
      value={candidate.status}
      onChange={(e) => onStatusChange(candidate._id, e.target.value)}
      className="w-full py-2 mb-4 border border-white/10 rounded-xl text-xs bg-surface-container-high text-white px-3 outline-none focus:border-neon-purple transition-colors relative z-10"
    >
      {COLUMNS.map(col => (
        <option key={col.key} value={col.key} className="bg-background text-white">{col.title}</option>
      ))}
    </select>

    <div className="flex gap-2 relative z-10">
      {candidate.cvUrl ? (
        <button
          type="button"
          onClick={() => onViewCv(candidate._id)}
          className="flex-1 py-1.5 bg-surface-container hover:bg-surface-container-high border border-white/10 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
        >
          <FileText size={12} /> View CV
        </button>
      ) : (
        <button 
          disabled
          title="No CV attached"
          className="flex-1 py-1.5 bg-surface-container-lowest text-on-surface-variant/50 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-white/5 cursor-not-allowed"
        >
          <FileText size={12} /> No CV
        </button>
      )}
      <button 
        onClick={() => onMessageClick(candidate.applicant._id)}
        className="flex-1 py-1.5 bg-neon-purple/20 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
      >
        <MessageSquare size={12} /> Message
      </button>
      <button
        type="button"
        title="Reanalyze with the latest ATS model"
        onClick={() => onReanalyze(candidate._id)}
        className="w-8 py-1.5 bg-surface-container border border-white/10 text-neon-cyan hover:bg-neon-cyan/20 rounded-lg flex items-center justify-center transition-all"
      >
        <RefreshCw size={12} />
      </button>
    </div>

    {/* Assessments Section */}
    <div className="mt-4 border-t border-white/10 pt-3 relative z-10">
      <button 
        onClick={toggleAssessments}
        className="w-full text-left text-xs font-bold text-neon-cyan hover:text-white transition-colors flex items-center justify-between"
      >
        <span>Assessments {showAssessments || invitations.length > 0 ? `(${invitations.length})` : ''}</span>
        {showAssessments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showAssessments && (
        <div className="mt-3 space-y-3">
          {loadingInvites ? (
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
              <Loader2 size={10} className="animate-spin" /> Loading invitations...
            </div>
          ) : (
            <>
              {invitations.map(inv => (
                <div key={inv._id} className="border border-white/10 bg-surface-container-high rounded-xl p-3 shadow-inner">
                  <p className="text-[10px] font-bold text-white mb-2">{inv.assessment?.title}</p>
                  <AssessmentStatusView 
                    invitationId={inv._id} 
                    applicationId={candidate._id}
                    initialStatus={{ status: inv.status, score: inv.score, passed: inv.passed }}
                  />
                </div>
              ))}
              {invitations.length === 0 && <p className="text-[10px] text-on-surface-variant">No assessments sent yet.</p>}
              
              <div className="flex gap-2 items-center mt-3">
                <select 
                  className="flex-1 text-[10px] p-1.5 border border-white/10 rounded-lg bg-surface-container-high text-white outline-none focus:border-neon-mint"
                  value={invitingAssesmentId}
                  onChange={(e) => setInvitingAssesmentId(e.target.value)}
                >
                  <option value="">Select assessment...</option>
                  {availableAssessments.filter(a => !invitations.some(inv => inv.assessment?._id === a._id)).map(a => (
                    <option key={a._id} value={a._id}>{a.title}</option>
                  ))}
                </select>
                <button 
                  onClick={handleInvite}
                  disabled={!invitingAssesmentId || isInviting}
                  className="bg-gradient-to-r from-neon-mint to-emerald-400 text-black px-3 py-1.5 text-[10px] font-bold rounded-lg disabled:opacity-50 hover:opacity-90 flex items-center gap-1"
                >
                  {isInviting ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                  Invite
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

const KanbanColumn = ({ title, items, availableAssessments, onStatusChange, onMessageClick, onViewCv, onReanalyze }) => (
  <section className="min-w-[280px] max-w-[320px] flex flex-col h-[calc(100vh-200px)] glass-panel bg-surface-container/20 overflow-hidden relative">
    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 blur-[40px] pointer-events-none"></div>
    <div className="flex items-center justify-between mb-4 p-4 border-b border-white/5 bg-surface-container-high/30">
      <div className="flex items-center gap-2">
        <h2 className="font-bold text-white uppercase tracking-wider text-xs">{title}</h2>
        <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {items.length}
        </span>
      </div>
    </div>
    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar p-4">
      {items.map(candidate => (
        <CandidateCard key={candidate._id} candidate={candidate} availableAssessments={availableAssessments} onStatusChange={onStatusChange} onMessageClick={onMessageClick} onViewCv={onViewCv} onReanalyze={onReanalyze} />
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
  const [availableAssessments, setAvailableAssessments] = useState([]);

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

  const fetchJobData = async () => {
    if (!selectedJobId) {
      setApplicants([]);
      setAvailableAssessments([]);
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

      const assessmentRes = await api.get(`/jobs/${selectedJobId}/assessments`);
      setAvailableAssessments(assessmentRes.data.assessments || []);
    } catch {
      setError('Failed to load data for this job.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId]);

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
      <header className="glass-card-purple p-4 flex items-center justify-between w-full mb-6 z-40 relative">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-neon-purple/10 rounded-xl border border-neon-purple/20">
            <Briefcase size={20} className="text-neon-purple" />
          </div>
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-lg font-bold text-white bg-transparent outline-none cursor-pointer hover:text-neon-purple transition-colors"
          >
            {myJobs.length === 0 && <option value="" className="bg-background text-white">No jobs posted yet</option>}
            {myJobs.map(job => (
              <option key={job._id} value={job._id} className="bg-background text-white">{job.title}</option>
            ))}
          </select>
          {selectedJob && (
            <span className="text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded-full shadow-glow-cyan font-bold">
              {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobData}
            title="Refresh Board"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 hover:border-neon-cyan hover:text-neon-cyan text-on-surface-variant transition-all shadow-md"
          >
            <RefreshCw size={18} />
          </button>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="text-xs text-white font-bold bg-surface-container-high rounded-xl px-4 py-2 outline-none border border-white/5 focus:border-neon-purple transition-all"
          >
            <option value="latest">Sort: Latest Applied</option>
            <option value="ai_score">Sort: AI Match Score</option>
          </select>
        </div>
      </header>

      {error && (
        <div className="bg-neon-pink/10 border border-neon-pink/30 text-neon-pink shadow-glow-pink rounded-xl p-4 text-center mb-6 text-sm font-bold flex items-center justify-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={40} className="animate-spin text-neon-purple" />
        </div>
      ) : myJobs.length === 0 ? (
        <div className="glass-card p-10 text-center text-on-surface-variant flex flex-col items-center justify-center">
          <Briefcase size={48} className="text-white/10 mb-4" />
          <p>You haven't posted any jobs yet. Post a job from your Dashboard to start reviewing applicants.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto custom-scrollbar relative mx-[-24px] lg:mx-[-32px] px-lg lg:px-xl pb-lg">
          <div className="flex h-full gap-6 min-w-max relative z-10 pt-4">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.key}
                title={col.title}
                items={sortedApplicants.filter(a => a.status === col.key)}
                availableAssessments={availableAssessments}
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
