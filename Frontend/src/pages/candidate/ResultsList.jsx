import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Search, ExternalLink } from 'lucide-react';

const CandidateResultsList = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startingId, setStartingId] = useState(null);
  const [startedStatus, setStartedStatus] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/candidate/results');
        setResults(response.data.results || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load assessment results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleStartAssessment = async (invitationId) => {
    try {
      setStartingId(invitationId);
      const response = await api.post(`/candidate/invitations/${invitationId}/start-link`);
      
      const payload = response.data.data || response.data; // Handle both nested and flat structures safely
      
      if (payload.alreadyStarted) {
        setStartedStatus(prev => ({ ...prev, [invitationId]: true }));
      } else if (payload.inviteUrl) {
        window.location.href = payload.inviteUrl;
      }
    } catch (err) {
      console.error('Failed to start assessment:', err);
      alert('Failed to start assessment. Please try again later.');
    } finally {
      setStartingId(null);
    }
  };

  const filteredResults = results.filter(r => 
    r.application?.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.assessment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.application?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3xl w-full">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 flex-1 h-full overflow-hidden flex flex-col pt-8">
      <header className="shrink-0 mb-4 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-bold text-3xl text-white/90">My Assessments</h1>
            <p className="text-on-surface-variant text-sm mt-2">View your completed exam scores and status.</p>
          </div>
        </div>
      </header>

      <div className="glass-card-pro border-white/5 border-emerald-300/30 rounded-2xl p-6 flex items-start text-white text-sm shrink-0 shadow-lg hover:shadow-none transition-shadow duration-300 relative z-10 bg-emerald-300/5">
        <ExternalLink className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-emerald-300" />
        <div>
          <p className="font-bold text-emerald-300">Looking for detailed AI feedback?</p>
          <p className="mt-1 text-on-surface-variant">
            For a detailed breakdown of your strengths, weaknesses, and code reviews, please check your <a href="https://ravenace.onrender.com" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-300 hover:text-white transition-colors">RavenACE account directly</a>.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl shadow-lg border border-white/10 overflow-hidden flex-1 flex flex-col relative z-10">
        <div className="p-6 border-b border-white/10 bg-surface-container/50 shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by company, job, or assessment..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl bg-background text-white focus:border-emerald-400 focus:shadow-none outline-none transition-all"
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center bg-red-400/10 border-t border-red-400/30 text-red-400 flex-1 font-bold">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-surface-container border border-white/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-2xl text-white mb-2">No assessments yet</h3>
            <p className="text-on-surface-variant max-w-sm">Your exam invitations and results will appear here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
            <table className="w-full text-left border-collapse border border-white/5 rounded-xl overflow-hidden">
              <thead className="sticky top-0 bg-surface-container backdrop-blur-xl border-b border-white/10 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Job / Assessment</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Action / Completed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-background/50">
                {filteredResults.map(result => (
                  <tr key={result._id} className="hover:bg-emerald-400/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {result.application?.job?.company || 'Unknown Company'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-white mb-1">{result.application?.job?.title || 'Unknown Job'}</div>
                      <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{result.assessment?.title || 'Assessment'}</div>
                    </td>
                    <td className="px-6 py-5">
                      {result.status === 'completed' ? (
                        <>
                          <div className="font-bold text-xl text-white">{result.score}%</div>
                          <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Passing: {result.assessment?.passingScore || 50}%</div>
                        </>
                      ) : (
                        <div className="text-on-surface-variant font-bold">-</div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {result.status === 'completed' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-shadow duration-300 ${result.passed ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 hover:shadow-none' : 'bg-red-400/20 text-red-400 border border-red-400/30 hover:shadow-none'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-300/20 text-emerald-300 border border-emerald-300/30 shadow-sm hover:shadow-none transition-shadow duration-300">
                          {result.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {result.status === 'completed' ? (
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          {result.completedAt ? new Date(result.completedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Done'}
                        </span>
                      ) : startedStatus[result._id] ? (
                        <div className="text-xs font-medium text-on-surface-variant max-w-[200px] leading-relaxed">
                          You've already started this assessment. Check your email for the original link or log in to <a href="https://ravenace.onrender.com" target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline font-bold">RavenACE</a>.
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(result._id)}
                          disabled={startingId === result._id}
                          className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-white border-none rounded-xl font-bold text-xs hover:opacity-90 shadow-md hover:shadow-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                          {startingId === result._id ? 'Starting...' : 'Start Assessment'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateResultsList;
