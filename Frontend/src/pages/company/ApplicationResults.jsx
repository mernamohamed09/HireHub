import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const ApplicationResults = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/${applicationId}/results`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neon-mint/10 text-neon-mint border border-neon-mint/30 shadow-glow-mint"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neon-orange/10 text-neon-orange border border-neon-orange/30 shadow-glow-orange"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'grading':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neon-purple/10 text-neon-purple border border-neon-purple/30 shadow-glow-purple"><Clock className="w-3 h-3 mr-1" /> Grading</span>;
      case 'not_started':
      case 'registered':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-white/70 border border-white/20"><Clock className="w-3 h-3 mr-1" /> Not Started</span>;
      case 'error':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neon-pink/10 text-neon-pink border border-neon-pink/30 shadow-glow-pink"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-white/70 border border-white/20">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 glass-card hover:border-neon-cyan/50 hover:bg-neon-cyan/10 transition-all rounded-xl shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-neon-cyan transition-colors" />
          </button>
          <h1 className="font-bold text-3xl md:text-4xl text-white">Assessment Results</h1>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-surface-container/50 rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <AlertCircle className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="font-bold text-2xl text-white mb-2">No Assessments</h3>
          <p className="text-on-surface-variant font-medium max-w-md mx-auto">No assessments have been sent for this application yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {results.map((result, index) => (
            <div 
              key={result.invitationId}
              className="glass-card rounded-3xl shadow-2xl overflow-hidden group"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/10 bg-surface-container/30 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h2 className="font-bold text-2xl text-white mb-3">{result.assessmentTitle}</h2>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(result.status)}
                    {result.status === 'completed' && (
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold border ${result.passed ? 'bg-neon-mint/10 text-neon-mint border-neon-mint/30 shadow-glow-mint' : 'bg-neon-pink/10 text-neon-pink border-neon-pink/30 shadow-glow-pink'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                  </div>
                </div>
                {result.status === 'completed' && (
                  <div className="text-right relative z-10 bg-surface-container p-4 rounded-2xl border border-white/10 shadow-inner">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Final Score</p>
                    <p className={`text-4xl font-bold leading-none ${result.passed ? 'text-neon-mint drop-shadow-[0_0_8px_rgba(85,245,198,0.5)]' : 'text-neon-pink drop-shadow-[0_0_8px_rgba(255,42,109,0.5)]'}`}>
                      {result.score}%
                    </p>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-8">
                {result.status !== 'completed' && result.status !== 'error' ? (
                  <div className="text-center py-12 bg-surface-container/30 rounded-2xl border border-white/5">
                    <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-on-surface-variant font-medium">Detailed results will be available once the assessment is completed.</p>
                  </div>
                ) : !result.detailedResult ? (
                  <div className="text-center py-12 bg-neon-pink/5 rounded-2xl border border-neon-pink/20">
                    <AlertCircle className="w-12 h-12 text-neon-pink mx-auto mb-4" />
                    <p className="text-neon-pink font-medium">Could not fetch detailed results. Please try again later.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="font-bold text-xl text-white mb-6 border-b border-white/10 pb-4">Question Breakdown</h3>
                    
                    {result.detailedResult.results?.map((q, qIndex) => (
                      <div key={q.questionId || qIndex} className="bg-surface-container/50 p-6 rounded-2xl border border-white/10 shadow-lg hover:border-white/20 transition-all">
                        
                        {/* Question Header */}
                        <div className="flex justify-between items-start mb-6 gap-6">
                          <div className="flex-1">
                            <span className="inline-block px-3 py-1 bg-neon-purple/10 text-neon-purple border border-neon-purple/30 text-[10px] font-bold rounded-lg mb-3 uppercase tracking-wider shadow-glow-purple">
                              {q.questionType}
                            </span>
                            <p className="text-white text-lg font-medium leading-relaxed">{q.questionText}</p>
                          </div>
                          <div className="text-right whitespace-nowrap bg-surface-container p-4 rounded-xl border border-white/10 shadow-inner">
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Score</p>
                            <p className="font-bold text-white text-xl">
                              <span className={(q.questionType === 'mcq' || q.questionType === 'truefalse') ? (q.isCorrect ? 'text-neon-mint' : 'text-neon-pink') : 'text-neon-cyan'}>
                                {(q.questionType === 'mcq' || q.questionType === 'truefalse') ? (q.isCorrect ? q.maxScore : 0) : (q.score || 0)}
                              </span> <span className="text-white/30">/</span> {q.maxScore}
                            </p>
                          </div>
                        </div>

                        {/* Answers Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-surface-container-high/50 rounded-xl p-5 border border-white/5">
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-3">Candidate's Answer</p>
                            <div className="text-white/90 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                              {q.studentAnswer || <span className="text-white/30 italic">No answer provided</span>}
                            </div>
                          </div>
                          
                          {(q.questionType === 'mcq' || q.questionType === 'truefalse') && (
                            <div className="bg-neon-cyan/5 rounded-xl p-5 border border-neon-cyan/20">
                              <p className="text-[10px] text-neon-cyan font-bold uppercase tracking-wider mb-3">Correct Answer</p>
                              <div className="text-white whitespace-pre-wrap font-mono text-sm">
                                {q.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Feedback Section (For Written/Coding) */}
                        {(q.questionType === 'written' || q.questionType === 'coding') && q.aiFeedback && (
                          <div className="mt-6 border-t border-white/10 pt-6">
                            <p className="text-[10px] text-neon-purple font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Sparkles size={12} /> AI Feedback
                            </p>
                            <p className="text-sm text-white/80 mb-6 leading-relaxed bg-surface-container-high/30 p-4 rounded-xl border border-white/5">{q.aiFeedback}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {q.strengths && q.strengths.length > 0 && (
                                <div className="bg-neon-mint/5 p-5 rounded-xl border border-neon-mint/20">
                                  <p className="text-[10px] text-neon-mint font-bold uppercase tracking-wider mb-3">Strengths</p>
                                  <ul className="list-disc pl-5 space-y-2">
                                    {q.strengths.map((s, i) => <li key={i} className="text-sm text-white/90">{s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {q.weaknesses && q.weaknesses.length > 0 && (
                                <div className="bg-neon-orange/5 p-5 rounded-xl border border-neon-orange/20">
                                  <p className="text-[10px] text-neon-orange font-bold uppercase tracking-wider mb-3">Areas for Improvement</p>
                                  <ul className="list-disc pl-5 space-y-2">
                                    {q.weaknesses.map((w, i) => <li key={i} className="text-sm text-white/90">{w}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            {q.questionType === 'coding' && (
                               <div className="mt-6 pt-6 border-t border-white/10">
                                   <div className="flex flex-wrap gap-6">
                                       <div className="bg-surface-container px-4 py-3 rounded-xl border border-white/10 flex-1">
                                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Language</p>
                                          <p className="text-sm font-bold text-white">{q.language}</p>
                                       </div>
                                       <div className="bg-surface-container px-4 py-3 rounded-xl border border-white/10 flex-1">
                                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Test Cases</p>
                                          <p className="text-sm font-bold text-neon-cyan">{q.testCasesPassed} / {q.testCasesTotal} Passed</p>
                                       </div>
                                   </div>
                                   {q.codeReview && (
                                      <div className="mt-6 bg-surface-container/50 p-5 rounded-xl border border-white/5">
                                          <p className="text-[10px] text-neon-cyan uppercase font-bold tracking-wider mb-3">Code Quality Review</p>
                                          <p className="text-sm text-white/90 leading-relaxed font-mono">{q.codeReview}</p>
                                      </div>
                                   )}
                               </div>
                            )}

                          </div>
                        )}
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationResults;
