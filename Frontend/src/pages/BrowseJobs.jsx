import { useState } from 'react';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { Button } from '../components/ui/Button';

// Mock Data
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'Valu',
    location: 'Cairo, Egypt',
    type: 'FULL-TIME',
    salary: 'EGP 35k - 50k',
    postedAt: 'Posted 2 days ago',
    logo: 'https://via.placeholder.com/60',
    isRemote: false,
    isUrgent: false
  },
  {
    id: 2,
    title: 'Frontend Lead (React)',
    company: 'Swvl',
    location: 'Cairo (Hybrid)',
    type: 'REMOTE',
    salary: 'EGP 60k - 85k',
    postedAt: 'Posted 5 hours ago',
    logo: 'https://via.placeholder.com/60',
    isRemote: true,
    isUrgent: false
  },
  {
    id: 3,
    title: 'React Native Engineer',
    company: 'MaxAB',
    location: 'New Cairo',
    type: 'FULL-TIME',
    salary: 'EGP 40k - 55k',
    postedAt: 'Posted Yesterday',
    logo: 'https://via.placeholder.com/60',
    isRemote: false,
    isUrgent: true
  },
  {
    id: 4,
    title: 'UI Engineer (React)',
    company: 'Thndr',
    location: 'Maadi, Cairo',
    type: 'CONTRACT',
    salary: 'EGP 30k - 45k',
    postedAt: 'Posted 3 days ago',
    logo: 'https://via.placeholder.com/60',
    isRemote: false,
    isUrgent: false
  },
  {
    id: 5,
    title: 'Senior Web Developer',
    company: 'Breadfast',
    location: 'Cairo, Egypt',
    type: 'FULL-TIME',
    salary: 'EGP 50k - 70k',
    postedAt: 'Posted 1 week ago',
    logo: 'https://via.placeholder.com/60',
    isRemote: false,
    isUrgent: false
  },
  {
    id: 6,
    title: 'Software Engineer (Web)',
    company: 'Trella',
    location: 'Maadi, Cairo',
    type: 'FULL-TIME',
    salary: 'EGP 45k - 60k',
    postedAt: 'Posted 4 days ago',
    logo: 'https://via.placeholder.com/60',
    isRemote: false,
    isUrgent: false
  }
];

export function BrowseJobs() {
  const [salaryRange, setSalaryRange] = useState(45000);

  return (
    <>
      <DashboardHeader />
      <div className="max-w-container_max_width mx-auto px-gutter py-lg w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-md">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface mb-xs">Find Your Dream Role</h1>
            <p className="font-body text-body text-on-surface-variant">Showing {MOCK_JOBS.length} of 142 jobs tailored for your experience.</p>
          </div>
          <div className="flex items-center gap-sm">
            <span className="font-label-tag text-label-tag uppercase text-on-surface-variant">Sort by:</span>
            <select className="bg-surface-container-high border-none rounded-lg text-body px-md py-sm focus:ring-2 focus:ring-tertiary outline-none">
              <option>Newest First</option>
              <option>Salary: High to Low</option>
              <option>Recommended</option>
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
                  <input className="w-full pl-10 pr-4 py-2 bg-background border border-outline-variant rounded-lg focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none text-on-surface transition-all" type="text" defaultValue="React"/>
                </div>
              </div>
              
              <div className="mb-lg">
                <label className="font-label-tag text-label-tag text-on-surface-variant block mb-sm">LOCATION</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
                  <input className="w-full pl-10 pr-4 py-2 bg-background border border-outline-variant rounded-lg focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none text-on-surface" type="text" defaultValue="Cairo, Egypt"/>
                </div>
              </div>
              
              <div className="mb-lg">
                <label className="font-label-tag text-label-tag text-on-surface-variant block mb-sm">JOB TYPE</label>
                <div className="space-y-sm">
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant bg-background text-tertiary focus:ring-tertiary" type="checkbox" defaultChecked />
                    <span className="font-body text-body text-on-surface group-hover:text-tertiary transition-colors">Full-time</span>
                  </label>
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant bg-background text-tertiary focus:ring-tertiary" type="checkbox"/>
                    <span className="font-body text-body text-on-surface group-hover:text-tertiary transition-colors">Contract</span>
                  </label>
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input className="w-4 h-4 rounded border-outline-variant bg-background text-tertiary focus:ring-tertiary" type="checkbox"/>
                    <span className="font-body text-body text-on-surface group-hover:text-tertiary transition-colors">Remote</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-lg">
                <div className="flex justify-between items-center mb-sm">
                  <label className="font-label-tag text-label-tag text-on-surface-variant">SALARY RANGE</label>
                  <span className="text-tertiary font-body text-body font-bold">EGP {salaryRange / 1000}k+</span>
                </div>
                <input 
                  className="cursor-pointer w-full" 
                  max="100000" min="10000" step="5000" 
                  type="range" 
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(Number(e.target.value))}
                />
                <div className="flex justify-between mt-xs font-caption text-caption text-outline">
                  <span>10k</span>
                  <span>100k</span>
                </div>
              </div>
              
              <Button variant="primary" className="w-full">
                Apply Filters
              </Button>
            </div>
            
            <div className="relative bg-tertiary-container/30 p-md rounded-xl border border-tertiary/20 overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-h3 text-h3 text-tertiary mb-xs">Unlock Pro</h4>
                <p className="font-caption text-caption text-on-tertiary-container mb-md">Get priority listing and direct access to recruiters.</p>
                <button className="px-md py-sm bg-tertiary text-on-tertiary font-bold text-caption rounded-full hover:scale-105 transition-transform">Upgrade Now</button>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-tertiary/10 group-hover:rotate-12 transition-transform">auto_awesome</span>
            </div>
          </aside>

          {/* Job Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-lg">
            {MOCK_JOBS.map(job => (
              <div key={job.id} className="bg-surface-container border border-outline-variant rounded-xl p-md hover:border-tertiary/50 transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-md">
                  <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center p-sm overflow-hidden">
                    <img className="max-w-full max-h-full object-cover rounded" alt={job.company} src={job.logo} />
                  </div>
                  <div className="flex gap-xs">
                    <span className="bg-tertiary-container/20 text-tertiary px-sm py-xs rounded-full font-label-tag text-label-tag">
                      {job.type}
                    </span>
                    <button className="material-symbols-outlined text-outline hover:text-error transition-colors">favorite</button>
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
                    <span className="font-body text-body font-bold text-tertiary">{job.salary}</span>
                    <span className="text-outline text-caption">/ month</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                  <span className="font-caption text-caption text-outline">{job.postedAt}</span>
                  <Button variant="primary" size="sm" className="bg-primary-container text-on-primary-container hover:bg-primary-container/80 shadow-none">Apply Now</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-xl flex items-center justify-center gap-sm">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">3</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </>
  );
}
