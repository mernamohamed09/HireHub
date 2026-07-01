import { useState } from 'react';

const mockApplications = [
  { id: 1, company: 'Vodafone', role: 'Senior Product Designer', date: 'Oct 12, 2024', status: 'Interview Scheduled', statusClass: 'bg-tertiary-container/30 text-tertiary border-tertiary/20', logo: 'V' },
  { id: 2, company: 'Paymob', role: 'UX Researcher', date: 'Oct 10, 2024', status: 'Under Review', statusClass: 'bg-secondary-container/30 text-secondary border-secondary/20', logo: 'P' },
  { id: 3, company: 'Breadfast', role: 'Creative Lead', date: 'Oct 08, 2024', status: 'Application Closed', statusClass: 'bg-error-container/30 text-error border-error/20', logo: 'B' },
  { id: 4, company: 'Instabug', role: 'Front-end Developer', date: 'Oct 05, 2024', status: 'Interviewing', statusClass: 'bg-tertiary-container/30 text-tertiary border-tertiary/20', logo: 'I' },
  { id: 5, company: 'Noon', role: 'Marketing Specialist', date: 'Oct 02, 2024', status: 'Pending Review', statusClass: 'bg-secondary-container/30 text-secondary border-secondary/20', logo: 'N' },
  { id: 6, company: 'CIB Bank', role: 'Security Analyst', date: 'Sep 28, 2024', status: 'Declined', statusClass: 'bg-error-container/30 text-error border-error/20', logo: 'C' },
];

export function MyApplications() {
  const [activeId, setActiveId] = useState(1);

  const activeApp = mockApplications.find(app => app.id === activeId);

  return (
    <div className="flex-1 max-w-full overflow-hidden flex flex-col md:flex-row gap-lg h-full">
      {/* Application List Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="mb-xl shrink-0">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-h1 text-h1 text-on-surface">My Applications</h2>
              <p className="text-on-surface-variant font-body mt-2">Track your professional journey across {mockApplications.length} active listings.</p>
            </div>
            <div className="flex gap-sm">
              <button className="bg-primary-container text-on-primary-container px-md py-sm rounded-lg flex items-center gap-sm font-body font-medium hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Data
              </button>
            </div>
          </div>
          {/* Filter Tabs */}
          <div className="flex gap-md border-b border-outline-variant/30 overflow-x-auto custom-scrollbar whitespace-nowrap">
            <button className="pb-md px-sm text-tertiary border-b-2 border-tertiary font-medium">All (24)</button>
            <button className="pb-md px-sm text-on-surface-variant hover:text-on-surface transition-colors">Pending (8)</button>
            <button className="pb-md px-sm text-on-surface-variant hover:text-on-surface transition-colors">Accepted (4)</button>
            <button className="pb-md px-sm text-on-surface-variant hover:text-on-surface transition-colors">Rejected (10)</button>
            <button className="pb-md px-sm text-on-surface-variant hover:text-on-surface transition-colors">Interviews (2)</button>
          </div>
        </header>

        {/* Table Section */}
        <div className="bg-surface-container rounded-xl border border-outline-variant overflow-y-auto custom-scrollbar shadow-2xl flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container-high/90 backdrop-blur border-b border-outline-variant z-10">
              <tr>
                <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Company</th>
                <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Applied Date</th>
                <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {mockApplications.map(app => {
                const isActive = activeId === app.id;
                return (
                  <tr 
                    key={app.id} 
                    onClick={() => setActiveId(app.id)}
                    className={`hover:bg-primary-container/10 transition-colors cursor-pointer ${isActive ? 'bg-tertiary-container/10' : ''}`}
                  >
                    <td className="px-lg py-lg">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded bg-white text-surface flex items-center justify-center p-1 font-bold text-lg">
                          {app.logo}
                        </div>
                        <span className="font-body font-semibold">{app.company}</span>
                      </div>
                    </td>
                    <td className="px-lg py-lg text-on-surface font-body">{app.role}</td>
                    <td className="px-lg py-lg text-on-surface-variant font-body">{app.date}</td>
                    <td className="px-lg py-lg">
                      <span className={`border font-label-tag text-label-tag px-sm py-1 rounded-full uppercase ${app.statusClass}`}>{app.status}</span>
                    </td>
                    <td className="px-lg py-lg">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer (Right Side) */}
      <aside className="w-full md:w-[35%] shrink-0 bg-surface-container border border-outline-variant rounded-xl p-lg shadow-2xl relative overflow-y-auto custom-scrollbar flex flex-col transition-opacity duration-300">
        <div className="sticky top-0 bg-surface-container z-10 pb-md mb-lg border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="font-h3 text-h3 text-on-surface">Application Detail</h3>
          <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {activeApp && (
          <>
            <div className="mb-xl flex items-center gap-md">
              <div className="w-16 h-16 rounded-xl bg-white text-surface p-2 border border-outline-variant shadow-lg flex items-center justify-center font-bold text-3xl">
                {activeApp.logo}
              </div>
              <div>
                <h4 className="font-h2 text-[22px] text-on-surface leading-tight">{activeApp.role}</h4>
                <p className="text-tertiary font-body font-medium">{activeApp.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md mb-xl">
              <div className="bg-surface-container-high/50 p-md rounded-lg border border-outline-variant/20">
                <p className="font-label-tag text-label-tag text-on-surface-variant uppercase mb-1">Salary Range</p>
                <p className="font-body font-bold text-on-surface">$4.5k - $6k</p>
              </div>
              <div className="bg-surface-container-high/50 p-md rounded-lg border border-outline-variant/20">
                <p className="font-label-tag text-label-tag text-on-surface-variant uppercase mb-1">Location</p>
                <p className="font-body font-bold text-on-surface">Remote / Cairo</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-xl">
              <h5 className="font-h3 text-body font-bold text-on-surface mb-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">timeline</span>
                Application Timeline
              </h5>
              <div className="relative space-y-xl pl-md">
                {/* Connector Line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-outline-variant/30"></div>
                
                {/* Step 1: Done */}
                <div className="relative flex gap-lg">
                  <div className="relative z-10 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-8 ring-primary/10 mt-1">
                    <span className="material-symbols-outlined text-[12px] text-on-primary font-bold">check</span>
                  </div>
                  <div>
                    <p className="font-body font-bold text-on-surface">Applied Successfully</p>
                    <p className="font-caption text-caption text-on-surface-variant">Oct 12, 2024 • 10:30 AM</p>
                    <p className="mt-2 text-on-surface-variant font-body bg-surface-container-lowest/50 p-sm rounded border border-outline-variant/10">
                      Your application has been received by the hiring team.
                    </p>
                  </div>
                </div>

                {/* Step 2: Done */}
                <div className="relative flex gap-lg">
                  <div className="relative z-10 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-8 ring-primary/10 mt-1">
                    <span className="material-symbols-outlined text-[12px] text-on-primary font-bold">check</span>
                  </div>
                  <div>
                    <p className="font-body font-bold text-on-surface">Under Review</p>
                    <p className="font-caption text-caption text-on-surface-variant">Oct 14, 2024 • 02:15 PM</p>
                    <p className="mt-2 text-on-surface-variant font-body">Recruiter <span className="text-on-surface">Ahmed Maher</span> moved your profile to the shortlist.</p>
                  </div>
                </div>

                {/* Step 3: Active */}
                <div className="relative flex gap-lg">
                  <div className="relative z-10 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center ring-8 ring-tertiary/20 mt-1 animate-pulse"></div>
                  <div>
                    <p className="font-body font-bold text-tertiary">Interview Scheduled</p>
                    <p className="font-caption text-caption text-on-surface-variant">Oct 20, 2024 • 11:00 AM (Upcoming)</p>
                    <div className="mt-3 flex items-center gap-sm bg-tertiary-container/20 p-md rounded-lg border border-tertiary/30">
                      <span className="material-symbols-outlined text-tertiary">video_call</span>
                      <div className="flex-1">
                        <p className="text-body font-semibold text-tertiary">Technical Interview</p>
                        <p className="text-caption text-on-surface-variant">Microsoft Teams</p>
                      </div>
                      <button className="bg-tertiary text-on-tertiary px-sm py-1 rounded font-label-tag text-label-tag font-bold uppercase hover:brightness-110">Join</button>
                    </div>
                  </div>
                </div>

                {/* Step 4: Pending */}
                <div className="relative flex gap-lg">
                  <div className="relative z-10 w-4 h-4 rounded-full bg-outline-variant flex items-center justify-center mt-1"></div>
                  <div>
                    <p className="font-body font-bold text-outline">Final Decision</p>
                    <p className="font-caption text-caption text-on-surface-variant italic">Waiting for interview feedback</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-xl border-t border-outline-variant/30">
              <button className="w-full bg-surface-container-high text-on-surface-variant font-body font-semibold py-md rounded-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-all mb-sm">
                View Full Job Description
              </button>
              <button className="w-full bg-error-container/20 text-error font-body font-semibold py-md rounded-lg border border-error/20 hover:bg-error-container/30 transition-all">
                Withdraw Application
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
