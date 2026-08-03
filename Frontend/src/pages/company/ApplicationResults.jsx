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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'grading':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Clock className="w-3 h-3 mr-1" /> Grading</span>;
      case 'not_started':
      case 'registered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" /> Not Started</span>;
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-xl w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </button>
          <h1 className="font-h1 text-h1 font-bold text-on-surface">Assessment Results</h1>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-surface-container p-xl rounded-2xl shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
          <p className="text-on-surface-variant font-body text-body">No assessments have been sent for this application yet.</p>
        </div>
      ) : (
        <div className="space-y-xl">
          {results.map((result, index) => (
            <div 
              key={result.invitationId}
              className="bg-surface-container rounded-2xl shadow-sm border border-outline-variant overflow-hidden"
            >
              {/* Header */}
              <div className="p-xl border-b border-outline-variant flex flex-wrap items-center justify-between gap-lg">
                <div>
                  <h2 className="font-h2 text-h2 font-bold text-on-surface mb-xs">{result.assessmentTitle}</h2>
                  <div className="flex items-center gap-sm mt-sm">
                    {getStatusBadge(result.status)}
                    {result.status === 'completed' && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-label-tag text-label-tag font-bold ${result.passed ? 'bg-primary-container text-primary' : 'bg-error text-white'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                  </div>
                </div>
                {result.status === 'completed' && (
                  <div className="text-right">
                    <p className="font-label-tag text-label-tag text-on-surface-variant uppercase font-bold tracking-wider mb-1">Final Score</p>
                    <p className={`text-[48px] font-bold leading-none ${result.passed ? 'text-primary' : 'text-error'}`}>
                      {result.score}%
                    </p>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-xl">
                {result.status !== 'completed' && result.status !== 'error' ? (
                  <div className="text-center py-3xl">
                    <Clock className="w-12 h-12 text-on-surface-variant mx-auto mb-md" />
                    <p className="text-on-surface-variant font-body text-body">Detailed results will be available once the assessment is completed.</p>
                  </div>
                ) : !result.detailedResult ? (
                  <div className="text-center py-3xl">
                    <AlertCircle className="w-12 h-12 text-error mx-auto mb-md" />
                    <p className="text-on-surface-variant font-body text-body">Could not fetch detailed results. Please try again later.</p>
                  </div>
                ) : (
                  <div className="space-y-xl">
                    <h3 className="font-h3 text-h3 font-bold text-on-surface mb-lg border-b border-outline-variant pb-sm">Question Breakdown</h3>
                    
                    {result.detailedResult.results?.map((q, qIndex) => (
                      <div key={q.questionId || qIndex} className="bg-surface-container-low p-lg rounded-xl border border-outline-variant shadow-sm">
                        
                        {/* Question Header */}
                        <div className="flex justify-between items-start mb-lg gap-md">
                          <div className="flex-1">
                            <span className="inline-block px-3 py-1 bg-secondary-container text-secondary text-[10px] font-bold rounded-lg mb-sm uppercase tracking-wider">
                              {q.questionType}
                            </span>
                            <p className="text-on-surface font-body text-[16px] font-bold">{q.questionText}</p>
                          </div>
                          <div className="text-right whitespace-nowrap bg-surface-container-high px-4 py-2 rounded-xl border border-outline-variant">
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Score</p>
                            <p className="font-bold text-on-surface text-[18px]">
                              {(q.questionType === 'mcq' || q.questionType === 'truefalse') ? (q.isCorrect ? q.maxScore : 0) : (q.score || 0)} / {q.maxScore}
                            </p>
                          </div>
                        </div>

                        {/* Answers Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-2">Candidate's Answer</p>
                            <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                              {q.studentAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                            </div>
                          </div>
                          
                          {(q.questionType === 'mcq' || q.questionType === 'truefalse') && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded p-4">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-2">Correct Answer</p>
                              <div className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-mono text-sm">
                                {q.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Feedback Section (For Written/Coding) */}
                        {(q.questionType === 'written' || q.questionType === 'coding') && q.aiFeedback && (
                          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase mb-2">AI Feedback</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{q.aiFeedback}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.strengths && q.strengths.length > 0 && (
                                <div>
                                  <p className="text-xs text-green-600 font-bold uppercase mb-1">Strengths</p>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {q.strengths.map((s, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {q.weaknesses && q.weaknesses.length > 0 && (
                                <div>
                                  <p className="text-xs text-orange-600 font-bold uppercase mb-1">Areas for Improvement</p>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {q.weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{w}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            {q.questionType === 'coding' && (
                               <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                   <div className="flex gap-4">
                                       <div>
                                          <p className="text-xs text-gray-500 uppercase font-bold">Language</p>
                                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q.language}</p>
                                       </div>
                                       <div>
                                          <p className="text-xs text-gray-500 uppercase font-bold">Test Cases</p>
                                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q.testCasesPassed} / {q.testCasesTotal} Passed</p>
                                       </div>
                                   </div>
                                   {q.codeReview && (
                                      <div className="mt-3">
                                          <p className="text-xs text-blue-600 uppercase font-bold mb-1">Code Quality Review</p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">{q.codeReview}</p>
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
