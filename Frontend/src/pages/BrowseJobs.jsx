import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { jobService } from '../services/jobService';
import { formatPostedAt } from '../utils/dateUtils';

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
      <div className="max-w-container_max_width mx-auto px-gutter pb-lg w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-md">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface mb-xs">Find Your Dream Role</h1>
            <p className="font-body text-body text-on-surface-variant">Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}{total > jobs.length ? ` of ${total}` : ''} available now.</p>
          </div>
          <div className="flex items-center gap-sm">
            <span className="font-label-tag text-label-tag uppercase text-on-surface-variant">Sort by:</span>
            <select
              className="bg-surface-container-high border-none rounded-lg text-body px-md py-sm focus:ring-2 focus:ring-tertiary outline-none"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); setAppliedFilters(prev => ({ ...prev, sort: e.target.value, page: 1 })); }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-lg">
            <div className="bg-surface-container p-md rounded-xl border border-outline-variant">
              <h3 className="font-h3 text-h3 text-on-surface mb-md">Filters</h3>

              <div className="mb-lg">
                <label className="font-label-tag text-label-tag text-on-surface-variant block mb-sm">SEARCH KEYWORD</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-background border border-outline-variant rounded-lg focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none text-on-surface transition-all"
                    type="text"
                    placeholder="Job title, keyword..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              <div className="mb-lg">
                <label className="font-label-tag text-label-tag text-on-surface-variant block mb-sm">LOCATION</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-background border border-outline-variant rounded-lg focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none text-on-surface"
                    type="text"
                    placeholder="e.g. Cairo, Remote..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              <div className="mb-lg">
                <div className="flex justify-between items-center mb-sm">
                  <label className="font-label-tag text-label-tag text-on-surface-variant">MIN SALARY</label>
                  <span className="text-tertiary font-body text-body font-bold">{minSalary > 0 ? `EGP ${minSalary / 1000}k+` : 'Any'}</span>
                </div>
                <input
                  className="cursor-pointer w-full"
                  max="100000" min="0" step="5000"
                  type="range"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                />
                <div className="flex justify-between mt-xs font-caption text-caption text-outline">
                  <span>Any</span>
                  <span>100k</span>
                </div>
              </div>

              <Button variant="primary" className="w-full" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Job Grid */}
          <div className="lg:col-span-9">
            {isLoading && (
              <div className="flex items-center justify-center py-3xl">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!isLoading && error && (
              <div className="bg-error-container/20 border border-error/30 text-error rounded-xl p-lg text-center">
                {error}
              </div>
            )}

            {!isLoading && !error && jobs.length === 0 && (
              <div className="bg-surface-container border border-outline-variant rounded-xl p-xl text-center text-on-surface-variant">
                No jobs match your filters. Try broadening your search.
              </div>
            )}

            {!isLoading && !error && jobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {jobs.map(job => (
                  <div key={job._id} className="bg-surface-container border border-outline-variant rounded-xl p-md hover:border-tertiary/50 transition-all group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-md">
                      <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center p-sm overflow-hidden">
                        <span className="material-symbols-outlined text-on-surface-variant text-[28px]">corporate_fare</span>
                      </div>
                    </div>
                    <div className="mb-md flex-1">
                      <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-xs text-on-surface-variant font-body text-body mb-sm">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span className="flex items-center"><span className="material-symbols-outlined text-[16px] mr-1">location_on</span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-sm mt-md">
                        {job.salary ? (
                          <>
                            <span className="font-body text-body font-bold text-tertiary">EGP {job.salary.toLocaleString()}</span>
                            <span className="text-outline text-caption">/ month</span>
                          </>
                        ) : (
                          <span className="font-body text-body text-on-surface-variant">Salary not disclosed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                      <span className="font-caption text-caption text-outline">{formatPostedAt(job.createdAt)}</span>
                      <Link to={`/jobs/${job._id}`}>
                        <Button variant="primary" size="sm" className="bg-primary-container text-on-primary-container hover:bg-primary-container/80 shadow-none">Apply Now</Button>
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
          <div className="mt-xl flex items-center justify-center gap-sm">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-body text-body text-on-surface-variant px-md">Page {page} of {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
