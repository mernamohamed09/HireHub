import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { jobService } from '../services/jobService';
import { formatPostedAt } from '../utils/dateUtils';
import { Search, MapPin, Building2, Briefcase, Loader2, ChevronLeft, ChevronRight, DollarSign, Filter } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest First' },
  { value: 'salary-high', label: 'Salary: High to Low' },
  { value: 'salary-low', label: 'Salary: Low to High' },
];

export function BrowseJobs() {
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState(0);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  const [appliedFilters, setAppliedFilters] = useState({ q: '', location: '', minSalary: 0, sort: 'latest', page: 1 });

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const hasFilters = appliedFilters.q || appliedFilters.location || appliedFilters.minSalary > 0 || appliedFilters.sort !== 'latest' || appliedFilters.page > 1;
        if (hasFilters) {
          const data = await jobService.searchJobs({
            q: appliedFilters.q || undefined,
            location: appliedFilters.location || undefined,
            minSalary: appliedFilters.minSalary > 0 ? appliedFilters.minSalary : undefined,
            sort: appliedFilters.sort,
            page: appliedFilters.page,
            limit: 10,
          });
          setJobs(data.jobs || []);
          setTotal(data.total ?? (data.jobs || []).length);
          setTotalPages(data.totalPages || 1);
        } else {
          const data = await jobService.getAllJobs();
          setJobs(data.jobs || []);
          setTotal(data.jobs?.length || 0);
          setTotalPages(1);
        }
      } catch {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [appliedFilters]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({ q, location, minSalary, sort, page: 1 });
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    setAppliedFilters(prev => ({ ...prev, page: nextPage }));
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 pb-12 w-full pt-8">
        {/* Header Section */}
        <div className="glass-card-pro border-white/5 p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 blur-[100px] rounded-full"></div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <h1 className="font-bold text-3xl text-white mb-2">Find Your Dream Role</h1>
              <p className="text-on-surface-variant text-sm">Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}{total > jobs.length ? ` of ${total}` : ''} available now.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sort by:</span>
              <select
                className="bg-surface-container border border-white/10 rounded-xl text-white text-sm px-4 py-2 focus:border-emerald-400 focus:shadow-[0_0_8px_rgba(16,185,129,0.15)] outline-none transition-all"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); setAppliedFilters(prev => ({ ...prev, sort: e.target.value, page: 1 })); }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="glass-card-pro border-white/5 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={18} className="text-amber-400" />
                <h3 className="font-bold text-white text-lg">Filters</h3>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">SEARCH KEYWORD</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-xl focus:border-emerald-400 focus:shadow-[0_0_8px_rgba(16,185,129,0.15)] outline-none text-white transition-all text-sm"
                    type="text"
                    placeholder="Job title, keyword..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">LOCATION</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-xl focus:border-emerald-400 focus:shadow-[0_0_8px_rgba(16,185,129,0.15)] outline-none text-white transition-all text-sm"
                    type="text"
                    placeholder="e.g. Cairo, Remote..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">MIN SALARY</label>
                  <span className="text-emerald-400 font-bold text-xs">{minSalary > 0 ? `EGP ${minSalary / 1000}k+` : 'Any'}</span>
                </div>
                <input
                  className="w-full accent-emerald-400 cursor-pointer"
                  max="100000" min="0" step="5000"
                  type="range"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                />
                <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-bold">
                  <span>Any</span>
                  <span>100k</span>
                </div>
              </div>

              <Button variant="primary" className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-white shadow-none" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Job Grid */}
          <div className="lg:col-span-9">
            {isLoading && (
              <div className="flex items-center justify-center py-32">
                <Loader2 size={40} className="animate-spin text-emerald-400" />
              </div>
            )}

            {!isLoading && error && (
              <div className="bg-amber-400/10 border border-amber-400/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)] rounded-xl p-6 text-center font-bold">
                {error}
              </div>
            )}

            {!isLoading && !error && jobs.length === 0 && (
              <div className="glass-card-pro rounded-2xl p-12 text-center text-on-surface-variant flex flex-col items-center">
                <Briefcase size={48} className="text-white/10 mb-4" />
                <p>No jobs match your filters. Try broadening your search.</p>
              </div>
            )}

            {!isLoading && !error && jobs.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <div key={job._id} className="glass-card-pro p-6 relative overflow-hidden group hover:border-emerald-400/50 hover:bg-emerald-400/5 transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-surface-container border border-white/10 shadow-inner flex items-center justify-center shrink-0">
                        <Building2 size={28} className="text-amber-400" />
                      </div>
                    </div>
                    <div className="mb-6 flex-1 relative z-10">
                      <h3 className="font-bold text-xl text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant mb-4">
                        <span className="bg-surface-container-high px-2 py-1 rounded-md border border-white/5">{job.company}</span>
                        <span className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md border border-white/5"><MapPin size={12} className="text-amber-500" />{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.salary ? (
                          <>
                            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1"><DollarSign size={14} /> {job.salary.toLocaleString()}</span>
                            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mt-0.5">/ month</span>
                          </>
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">Salary not disclosed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">{formatPostedAt(job.createdAt)}</span>
                      <Link to={`/jobs/${job._id}`}>
                        <Button variant="ghost" size="sm" className="border border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-black">Apply Now</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/10 text-white hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.15)] transition-all disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:shadow-none disabled:hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Page <span className="text-white">{page}</span> of {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/10 text-white hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.15)] transition-all disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:shadow-none disabled:hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
