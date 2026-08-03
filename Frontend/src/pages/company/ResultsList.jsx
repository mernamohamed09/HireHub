import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Search } from 'lucide-react';

const CompanyResultsList = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/company/results');
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

  const filteredResults = results.filter(r => 
    r.application?.applicant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.application?.applicant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center w-full max-w-7xl mx-auto mt-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-lg space-y-lg flex-1 h-full overflow-hidden flex flex-col">
      <header className="shrink-0 mb-md">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface">Assessment Results</h1>
            <p className="text-on-surface-variant font-body mt-2">View all completed candidate assessments across your jobs.</p>
          </div>
        </div>
      </header>

      <div className="bg-surface-container rounded-xl shadow-sm border border-outline-variant overflow-hidden flex-1 flex flex-col">
        <div className="p-md border-b border-outline-variant bg-surface-container-high/50 shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by candidate, job, or assessment..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-3xl text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-surface-container-highest text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-md">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-xs">No completed assessments</h3>
            <p className="text-on-surface-variant max-w-sm">Wait for candidates to finish their exams, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur border-b border-outline-variant z-10">
                <tr>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Candidate</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Job / Assessment</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Score</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Completed On</th>
                  <th className="px-lg py-md text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filteredResults.map(result => (
                  <tr key={result._id} className="hover:bg-primary-container/10 transition-colors">
                    <td className="px-lg py-lg">
                      <div className="font-body font-bold text-on-surface">
                        {result.application?.applicant?.firstName} {result.application?.applicant?.lastName}
                      </div>
                      <div className="text-caption text-on-surface-variant">{result.application?.applicant?.email}</div>
                    </td>
                    <td className="px-lg py-lg">
                      <div className="font-body font-medium text-on-surface">{result.application?.job?.title || 'Unknown Job'}</div>
                      <div className="text-caption text-tertiary font-bold">{result.assessment?.title || 'Assessment'}</div>
                    </td>
                    <td className="px-lg py-lg">
                      <div className="font-h3 text-on-surface">{result.score}%</div>
                      <div className="text-caption text-on-surface-variant">Passing: {result.assessment?.passingScore || 50}%</div>
                    </td>
                    <td className="px-lg py-lg">
                      <span className={`inline-flex items-center px-sm py-0.5 rounded-full font-label-tag uppercase ${result.passed ? 'bg-secondary-container/30 text-secondary border border-secondary/20' : 'bg-error-container/30 text-error border border-error/20'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-lg py-lg text-caption text-on-surface-variant">
                      {result.completedAt ? new Date(result.completedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-lg py-lg text-right">
                      <Link 
                        to={`/company/applications/${result.application?._id}/results`}
                        className="inline-flex items-center px-md py-sm bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-all text-sm"
                      >
                        View Details
                      </Link>
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

export default CompanyResultsList;
