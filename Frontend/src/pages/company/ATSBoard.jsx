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
  Briefcase, CheckCircle, AlertCircle, Loader2, Send, Star, Zap
} from 'lucide-react';

const COLUMNS = [
  { key: 'pending', title: 'Pending', color: 'slate' },
  { key: 'reviewed', title: 'Reviewed', color: 'blue' },
  { key: 'accepted', title: 'Accepted', color: 'emerald' },
  { key: 'rejected', title: 'Rejected', color: 'red' },
];

const getMatchBadge = (aiAnalysis) => {
  if (!aiAnalysis) return null;

  if (aiAnalysis.status === 'pending' || aiAnalysis.status === 'processing') {
    return { label: 'Analyzing…', className: 'bg-black/40 border-white/10 text-slate-400', icon: <Loader2 size={10} className="animate-spin" /> };
  }
  if (aiAnalysis.status === 'failed') {
    const isUnreadable = /resume file (is missing|could not be read)|unreadable/i.test(aiAnalysis.lastError || '');
    return {
      label: isUnreadable ? 'Unreadable Resume' : 'AI Analysis Failed',
      title: aiAnalysis.lastError || 'The AI analysis could not be completed.',
      className: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
      icon: <AlertCircle size={10} />
    };
  }

  const score = aiAnalysis.matchScore ?? 0;
  if (score >= 80) return { label: `${score}% Top Match`, className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]', icon: <Star size={10} className="fill-emerald-400" /> };
  if (score >= 60) return { label: `${score}% Moderate Match`, className: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]', icon: <Zap size={10} className="fill-amber-400" /> };
  return { label: `${score}% Low Match`, className: 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]', icon: <AlertCircle size={10} /> };
};

const AiSkillTags = ({ skills }) => {
  if (!skills?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {skills.slice(0, 4).map((skill) => (
        <span
          key={skill}
          className="flex items-center gap-1 bg-white/5 text-emerald-400 text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border border-emerald-500/20"
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
  <div className="bg-black/40 border border-white/5 p-5 rounded-2xl hover:border-emerald-500/40 hover:bg-black/60 transition-all flex flex-col relative overflow-hidden group hover-lift shadow-lg">
    {/* Decorative background glow based on score if top match */}
    {candidate.aiAnalysis?.matchScore >= 80 && (
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
    )}

    <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
      <div className="flex flex-col">
        <p className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">{candidate.applicant?.name || 'Unknown'}</p>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
          {formatPostedAt(candidate.appliedAt || candidate.createdAt)}
        </p>
      </div>
      {matchBadge && (
        <span
          title={matchBadge.title}
          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1 ${matchBadge.className}`}
        >
          {matchBadge.icon}
          {matchBadge.label}
        </span>
      )}
    </div>

    <AiSkillTags skills={candidate.aiAnalysis?.matchedSkills} />

    {candidate.aiAnalysis?.missingRequiredSkills?.length > 0 && (
      <p className="text-[10px] text-red-400 mb-3 flex items-center gap-1 relative z-10 bg-red-500/5 py-1.5 px-2 rounded-lg border border-red-500/10">
        <AlertCircle size={10} className="shrink-0" />
        Missing: {candidate.aiAnalysis.missingRequiredSkills.slice(0, 3).join(', ')}
      </p>
    )}

    {candidate.applicant?.skills?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
        {candidate.applicant.skills.slice(0, 3).map(tag => (
          <span key={tag} className="bg-black/40 text-slate-300 border border-white/5 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
            {tag}
          </span>
        ))}
      </div>
    )}

    <select
      value={candidate.status}
      onChange={(e) => onStatusChange(candidate._id, e.target.value)}
      className="w-full py-2 mb-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider bg-black/60 text-white px-3 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all relative z-10 cursor-pointer"
    >
      {COLUMNS.map(col => (
        <option key={col.key} value={col.key} className="bg-background text-white">Move to: {col.title}</option>
      ))}
    </select>

    <div className="flex gap-2 relative z-10">
      {candidate.cvUrl ? (
        <button
          type="button"
          onClick={() => onViewCv(candidate._id)}
          className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
        >
          <FileText size={14} /> CV
        </button>
      ) : (
        <button 
          disabled
          title="No CV attached"
          className="flex-1 py-2 bg-black/40 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/5 cursor-not-allowed"
        >
          <FileText size={14} /> No CV
        </button>
      )}
      <button 
        onClick={() => onMessageClick(candidate.applicant._id)}
        className="flex-1 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500 hover:to-amber-500 hover:text-white hover:border-transparent rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-none"
      >
        <MessageSquare size={14} /> Chat
      </button>
      <button
        type="button"
        title="Reanalyze with the latest ATS model"
        onClick={() => onReanalyze(candidate._id)}
        className="w-10 py-2 bg-white/5 border border-white/10 text-amber-400 hover:bg-amber-400/20 hover:border-amber-400/50 rounded-xl flex items-center justify-center transition-all"
      >
        <RefreshCw size={14} />
      </button>
    </div>

    {/* Assessments Section */}
    <div className="mt-5 border-t border-white/10 pt-4 relative z-10">
      <button 
        onClick={toggleAssessments}
        className="w-full text-left text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-white transition-colors flex items-center justify-between group/acc"
      >
        <span className="flex items-center gap-2">
          <CheckCircle size={14} className="text-amber-400 group-hover/acc:text-white transition-colors" /> 
          Assessments {showAssessments || invitations.length > 0 ? `(${invitations.length})` : ''}
        </span>
        {showAssessments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showAssessments && (
        <div className="mt-4 p-3 bg-black/60 rounded-xl border border-white/5 shadow-inner space-y-3">
          {loadingInvites ? (
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider p-2">
              <Loader2 size={12} className="animate-spin" /> Loading...
            </div>
          ) : (
            <>
              {invitations.map(inv => (
                <div key={inv._id} className="border border-white/5 bg-black/40 rounded-lg p-3 shadow-sm hover:border-emerald-400/30 transition-colors">
                  <p className="text-[11px] font-bold text-white mb-2 truncate">{inv.assessment?.title}</p>
                  <AssessmentStatusView 
                    invitationId={inv._id} 
                    applicationId={candidate._id}
                    initialStatus={{ status: inv.status, score: inv.score, passed: inv.passed }}
                  />
                </div>
              ))}
              {invitations.length === 0 && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 py-1">No assessments sent.</p>}
              
              <div className="flex gap-2 items-center mt-3 pt-3 border-t border-white/5">
                <select 
                  className="flex-1 text-[10px] p-2 border border-white/10 rounded-lg bg-black/40 text-white outline-none focus:border-amber-400 transition-all font-bold uppercase tracking-wider"
                  value={invitingAssesmentId}
                  onChange={(e) => setInvitingAssesmentId(e.target.value)}
                >
                  <option value="">Select test...</option>
                  {availableAssessments.filter(a => !invitations.some(inv => inv.assessment?._id === a._id)).map(a => (
                    <option key={a._id} value={a._id}>{a.title}</option>
                  ))}
                </select>
                <button 
                  onClick={handleInvite}
                  disabled={!invitingAssesmentId || isInviting}
                  className="bg-amber-500 text-black px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg disabled:opacity-50 hover:bg-amber-400 transition-all flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                >
                  {isInviting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Send
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

const KanbanColumn = ({ title, color, items, availableAssessments, onStatusChange, onMessageClick, onViewCv, onReanalyze }) => {
  const colorMap = {
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500'
  };

  const bgMap = {
    slate: 'from-slate-500/5 to-transparent border-t-slate-500/50',
    blue: 'from-blue-500/5 to-transparent border-t-blue-500/50',
    emerald: 'from-emerald-500/5 to-transparent border-t-emerald-500/50',
    red: 'from-red-500/5 to-transparent border-t-red-500/50'
  };

  return (
    <section className={`min-w-[320px] max-w-[340px] flex flex-col h-[calc(100vh-200px)] glass-card-pro overflow-hidden relative border-t-2 ${bgMap[color]}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] pointer-events-none"></div>
      <div className="flex items-center justify-between mb-2 p-5 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${colorMap[color]}`}></div>
          <h2 className="font-bold text-white uppercase tracking-widest text-xs">{title}</h2>
        </div>
        <span className="bg-black/60 border border-white/10 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-inner">
          {items.length}
        </span>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar p-5 relative z-10 bg-gradient-to-b from-black/10 to-transparent">
        {items.map(candidate => (
          <CandidateCard key={candidate._id} candidate={candidate} availableAssessments={availableAssessments} onStatusChange={onStatusChange} onMessageClick={onMessageClick} onViewCv={onViewCv} onReanalyze={onReanalyze} />
        ))}
        {items.length === 0 && (
          <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            Empty
          </div>
        )}
      </div>
    </section>
  );
};

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
    <div className="flex flex-col h-full overflow-hidden w-full relative z-10">
      {/* Top Navigation / Header */}
      <header className="glass-card-pro p-5 flex items-center justify-between w-full mb-8 z-40 relative shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5 opacity-50 pointer-events-none rounded-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-black/40 rounded-xl border border-white/10 shadow-inner">
            <Briefcase size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recruitment Pipeline</p>
            <div className="flex items-center gap-4">
              <select
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-2xl font-bold text-white bg-transparent outline-none cursor-pointer hover:text-emerald-400 transition-colors appearance-none pr-6 border-b border-transparent hover:border-emerald-500/30 pb-1"
              >
                {myJobs.length === 0 && <option value="" className="bg-background text-white">No jobs posted yet</option>}
                {myJobs.map(job => (
                  <option key={job._id} value={job._id} className="bg-background text-white">{job.title}</option>
                ))}
              </select>
              {selectedJob && (
                <span className="text-xs text-amber-400 bg-black/40 border border-amber-400/20 px-3 py-1.5 rounded-lg shadow-inner font-bold flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_currentColor]"></span>
                  {applicants.length} candidate{applicants.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={fetchJobData}
            title="Refresh Board"
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-400 hover:text-emerald-400 text-slate-400 transition-all shadow-inner hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] group"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="text-xs text-white font-bold uppercase tracking-wider bg-black/40 rounded-xl px-5 py-3.5 outline-none border border-white/10 focus:border-emerald-400 transition-all shadow-inner appearance-none pr-10 cursor-pointer hover:border-emerald-500/50"
            >
              <option value="latest">Sort: Latest</option>
              <option value="ai_score">Sort: AI Match</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-2xl p-4 text-center mb-6 text-sm font-bold flex items-center justify-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-32 flex-col gap-4">
          <Loader2 size={48} className="animate-spin text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Pipeline...</p>
        </div>
      ) : myJobs.length === 0 ? (
        <div className="glass-card-pro p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-20 border-white/5">
          <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center border border-white/10 shadow-inner mb-6">
            <Briefcase size={40} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Pipeline is Empty</h2>
          <p className="text-slate-400 mb-8">You haven't posted any jobs yet. Create your first job posting from the Dashboard to start receiving and managing applicants.</p>
          <Button variant="primary" onClick={() => navigate('/company/dashboard')} className="px-8">
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto custom-scrollbar relative mx-[-24px] lg:mx-[-32px] px-lg lg:px-xl pb-lg">
          <div className="flex h-full gap-8 min-w-max relative z-10 pt-2">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.key}
                title={col.title}
                color={col.color}
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
