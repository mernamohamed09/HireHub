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
    r.application?.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.assessment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.application?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 w-full">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-xl p-6 text-center w-full max-w-7xl mx-auto mt-8 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 flex-1 h-full overflow-hidden flex flex-col relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>

      <header className="shrink-0 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-bold text-3xl md:text-4xl text-white">Assessment Results</h1>
            <p className="text-slate-400 font-medium mt-2">View all completed candidate assessments across your jobs.</p>
          </div>
        </div>
      </header>

      <div className="glass-card-pro rounded-3xl shadow-2xl overflow-hidden flex-1 flex flex-col group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="p-6 border-b border-white/5 bg-black/20 shrink-0 relative z-10">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by candidate, job, or assessment..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl bg-black/40 text-white focus:border-emerald-400 focus:shadow-[0_0_10px_rgba(16,185,129,0.3)] outline-none transition-all placeholder:text-white/30"
            />
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="w-20 h-20 bg-black/20 border border-white/5 text-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-bold text-2xl text-white mb-2">No completed assessments</h3>
            <p className="text-slate-400 font-medium max-w-sm">Wait for candidates to finish their exams, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar flex-1 relative z-10">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-black/60 backdrop-blur-md border-b border-white/5 z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job / Assessment</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed On</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredResults.map(result => (
                  <tr key={result._id} className="hover:bg-white/5 transition-colors group/row">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm mb-1 group-hover/row:text-emerald-400 transition-colors">
                        {result.application?.applicant?.name || 'Unknown Candidate'}
                      </div>
                      <div className="text-xs text-slate-400">{result.application?.applicant?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white text-sm mb-1">{result.application?.job?.title || 'Unknown Job'}</div>
                      <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                        {result.assessment?.title || 'Assessment'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg text-white mb-1">{result.score}%</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Passing: {result.assessment?.passingScore || 50}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${result.passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                      {result.completedAt ? new Date(result.completedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/company/applications/${result.application?._id}/results`}
                        className="inline-flex items-center px-4 py-2 bg-black/20 border border-white/5 text-slate-300 rounded-xl font-bold hover:border-emerald-400 hover:text-emerald-400 transition-all text-xs shadow-md"
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
