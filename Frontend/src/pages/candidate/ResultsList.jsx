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
    <div className="max-w-7xl mx-auto p-lg space-y-lg flex-1 h-full overflow-hidden flex flex-col">
      <header className="shrink-0 mb-md">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface">My Assessments</h1>
            <p className="text-on-surface-variant font-body mt-2">View your completed exam scores and status.</p>
          </div>
        </div>
      </header>

      <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-md flex items-start text-on-surface text-sm shrink-0">
        <ExternalLink className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="font-bold">Looking for detailed AI feedback?</p>
          <p className="mt-1 text-on-surface-variant">
            For a detailed breakdown of your strengths, weaknesses, and code reviews, please check your <a href="https://ravenace.onrender.com" target="_blank" rel="noreferrer" className="underline font-bold text-primary hover:text-primary/80 transition-colors">RavenACE account directly</a>.
          </p>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl shadow-sm border border-outline-variant overflow-hidden flex-1 flex flex-col">
        <div className="p-md border-b border-outline-variant bg-surface-container-high/50 shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by company, job, or assessment..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center bg-error-container/20 border-t border-error/30 text-error flex-1">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-3xl text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-md">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-xs">No assessments yet</h3>
            <p className="text-on-surface-variant max-w-sm">Your exam invitations and results will appear here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur border-b border-outline-variant z-10">
                <tr>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Company</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Job / Assessment</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Score</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Action / Completed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filteredResults.map(result => (
                  <tr key={result._id} className="hover:bg-primary-container/10 transition-colors">
                    <td className="px-lg py-lg">
                      <div className="font-body font-bold text-on-surface">
                        {result.application?.job?.company || 'Unknown Company'}
                      </div>
                    </td>
                    <td className="px-lg py-lg">
                      <div className="font-body font-medium text-on-surface">{result.application?.job?.title || 'Unknown Job'}</div>
                      <div className="text-caption text-tertiary font-bold">{result.assessment?.title || 'Assessment'}</div>
                    </td>
                    <td className="px-lg py-lg">
                      {result.status === 'completed' ? (
                        <>
                          <div className="font-h3 text-on-surface">{result.score}%</div>
                          <div className="text-caption text-on-surface-variant">Passing: {result.assessment?.passingScore || 50}%</div>
                        </>
                      ) : (
                        <div className="text-on-surface-variant font-bold">-</div>
                      )}
                    </td>
                    <td className="px-lg py-lg">
                      {result.status === 'completed' ? (
                        <span className={`inline-flex items-center px-sm py-0.5 rounded-full font-label-tag uppercase ${result.passed ? 'bg-secondary-container/30 text-secondary border border-secondary/20' : 'bg-error-container/30 text-error border border-error/20'}`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-sm py-0.5 rounded-full font-label-tag uppercase bg-primary-container/30 text-primary border border-primary/20">
                          {result.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-lg py-lg">
                      {result.status === 'completed' ? (
                        <span className="text-caption text-on-surface-variant">
                          {result.completedAt ? new Date(result.completedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Done'}
                        </span>
                      ) : startedStatus[result._id] ? (
                        <div className="text-caption text-on-surface-variant max-w-[200px]">
                          You've already started this assessment. Check your email for the original link or log in to <a href="https://ravenace.onrender.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">RavenACE</a>.
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartAssessment(result._id)}
                          disabled={startingId === result._id}
                          className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
