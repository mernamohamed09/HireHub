import { Link } from 'react-router-dom';

export function Dashboard() {
  return (
    <div className="w-full">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="font-h2 text-h2 text-on-surface">Good morning, Sarah 👋</h1>
          <p className="font-body text-body text-on-surface-variant">October 24, 2024 • Welcome back to your recruitment command center.</p>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-md rounded-xl glass-panel text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link to="/jobs">
            <button className="px-lg py-md bg-primary-container text-on-primary-container font-body font-bold rounded-xl transition-transform active:scale-95 shadow-lg">
              Browse New Roles
            </button>
          </Link>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Stats Row */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Applications Sent</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-h1 font-h1 text-tertiary">12</span>
              <span className="text-on-tertiary-container font-label-tag text-label-tag bg-tertiary-container/30 px-sm py-0.5 rounded-full">+2 this week</span>
            </div>
          </div>
          <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Interviews Scheduled</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-h1 font-h1 text-tertiary">3</span>
              <span className="text-on-primary font-label-tag text-label-tag bg-secondary-container px-sm py-0.5 rounded-full">Next today</span>
            </div>
          </div>
          <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Profile Views</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-h1 font-h1 text-tertiary">47</span>
              <span className="text-on-tertiary-container font-label-tag text-label-tag bg-tertiary-container/30 px-sm py-0.5 rounded-full">Top 5%</span>
            </div>
          </div>
          <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:border-tertiary transition-colors hover:scale-[1.01]">
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Saved Jobs</p>
            <div className="flex items-baseline gap-sm">
              <span className="text-h1 font-h1 text-tertiary">8</span>
              <span className="text-on-surface-variant font-label-tag text-label-tag border border-outline-variant px-sm py-0.5 rounded-full">Active alerts</span>
            </div>
          </div>
        </div>

        {/* Main Section: Recent Applications & Interview */}
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          {/* Recent Applications Table */}
          <section className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden hover:scale-[1.01] transition-transform duration-300">
            <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-on-surface">Recent Applications</h3>
              <button className="text-primary font-body text-body hover:underline transition-all">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase">Company & Role</th>
                    <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase">Applied Date</th>
                    <th className="px-lg py-md font-label-tag text-label-tag text-on-surface-variant uppercase">Status</th>
                    <th className="px-lg py-md"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {[
                    { id: 1, initial: 'V', company: 'Vodafone Egypt', role: 'Senior Frontend Developer', date: 'Oct 20, 2024', status: 'Under Review', statusClass: 'bg-tertiary-container/20 text-tertiary' },
                    { id: 2, initial: 'P', company: 'Paymob', role: 'React Developer', date: 'Oct 18, 2024', status: 'Pending', statusClass: 'bg-outline-variant/30 text-on-surface-variant' },
                    { id: 3, initial: 'B', company: 'Breadfast', role: 'UI/UX Designer', date: 'Oct 15, 2024', status: 'Under Review', statusClass: 'bg-tertiary-container/20 text-tertiary' },
                  ].map(app => (
                    <tr key={app.id} className="hover:bg-surface-container-highest transition-colors group">
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 bg-on-surface/10 rounded-lg flex items-center justify-center font-bold text-primary">{app.initial}</div>
                          <div>
                            <p className="font-body text-body font-bold">{app.company}</p>
                            <p className="font-caption text-caption text-on-surface-variant">{app.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-lg font-body text-body text-on-surface-variant">{app.date}</td>
                      <td className="px-lg py-lg">
                        <span className={`font-label-tag text-label-tag px-md py-1 rounded-full uppercase ${app.statusClass}`}>{app.status}</span>
                      </td>
                      <td className="px-lg py-lg text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recommended Jobs Grid */}
          <section>
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-h3 text-h3 text-on-surface">Recommended for You</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {/* Card 1 */}
              <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="flex justify-between items-start mb-lg">
                  <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden p-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">code</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-tertiary transition-colors">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
                <h4 className="font-body text-body font-bold text-on-surface mb-xs">Software Engineer</h4>
                <p className="font-caption text-caption text-on-surface-variant mb-lg">Stripe • Remote</p>
                <div className="flex flex-wrap gap-xs mb-lg">
                  <span className="font-label-tag text-label-tag bg-surface-container px-sm py-1 rounded-full border border-outline-variant uppercase">Full-time</span>
                  <span className="font-label-tag text-label-tag bg-surface-container px-sm py-1 rounded-full border border-outline-variant uppercase">$120k - $160k</span>
                </div>
                <button className="w-full py-md bg-outline-variant text-on-surface font-body font-bold rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">Apply Now</button>
              </div>
              
              {/* Card 2 */}
              <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="flex justify-between items-start mb-lg">
                  <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden p-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">leaderboard</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-tertiary transition-colors">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
                <h4 className="font-body text-body font-bold text-on-surface mb-xs">Senior Product Lead</h4>
                <p className="font-caption text-caption text-on-surface-variant mb-lg">Meta • Cairo</p>
                <div className="flex flex-wrap gap-xs mb-lg">
                  <span className="font-label-tag text-label-tag bg-surface-container px-sm py-1 rounded-full border border-outline-variant uppercase">Hybrid</span>
                  <span className="font-label-tag text-label-tag bg-surface-container px-sm py-1 rounded-full border border-outline-variant uppercase">Senior</span>
                </div>
                <button className="w-full py-md bg-outline-variant text-on-surface font-body font-bold rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">Apply Now</button>
              </div>
              
              {/* Card 3 */}
              <div className="bg-surface-container-high p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="flex justify-between items-start mb-lg">
                  <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden p-2 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">web</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-tertiary transition-colors">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
                <h4 className="font-body text-body font-bold text-on-surface mb-xs">Frontend Architect</h4>
                <p className="font-caption text-caption text-on-surface-variant mb-lg">Instabug • Cairo</p>
                <div className="flex flex-wrap gap-xs mb-lg">
                  <span className="font-label-tag text-label-tag bg-surface-container px-sm py-1 rounded-full border border-outline-variant uppercase">On-site</span>
                  <span className="font-label-tag text-label-tag bg-surface-container px-sm py-1 rounded-full border border-outline-variant uppercase">Tech Stack</span>
                </div>
                <button className="w-full py-md bg-outline-variant text-on-surface font-body font-bold rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-colors">Apply Now</button>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Upcoming Interviews & Profile */}
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          {/* Upcoming Interview Card */}
          <div className="bg-tertiary-container/10 rounded-xl border-2 border-tertiary p-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-sm mb-lg">
                <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></span>
                <span className="font-label-tag text-label-tag text-tertiary font-bold uppercase tracking-widest">Upcoming Today</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-sm">Paymob - Senior Developer Interview</h3>
              <div className="flex items-center gap-md text-on-surface-variant mb-xl">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span className="font-caption text-caption">2:00 PM (45m)</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">videocam</span>
                  <span className="font-caption text-caption">Google Meet</span>
                </div>
              </div>
              <div className="flex gap-md">
                <button className="flex-1 py-md bg-tertiary text-on-tertiary-fixed font-body font-bold rounded-xl transition-transform active:scale-95 shadow-md shadow-tertiary/20">
                  Join Meeting
                </button>
                <button className="p-md glass-panel text-on-surface rounded-xl hover:bg-surface-container-highest transition-colors">
                  <span className="material-symbols-outlined">description</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="bg-surface-container p-lg rounded-xl border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-body text-body font-bold text-on-surface">Profile Strength</h3>
              <span className="text-primary font-bold">85%</span>
            </div>
            <div className="w-full h-2 bg-outline-variant rounded-full mb-lg overflow-hidden">
              <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(169,199,255,0.4)]"></div>
            </div>
            <p className="font-caption text-caption text-on-surface-variant mb-xl">Almost there! Complete your portfolio to get 2x more views.</p>
            <ul className="space-y-md">
              <li className="flex items-center gap-md">
                <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-body text-body text-on-surface-variant">Update work history</span>
              </li>
              <li className="flex items-center gap-md">
                <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-body text-body text-on-surface-variant">Verify email</span>
              </li>
              <li className="flex items-center gap-md">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-[20px]">circle</span>
                <span className="font-body text-body text-on-surface">Add portfolio link</span>
                <span className="ml-auto text-primary font-label-tag text-label-tag border border-primary px-sm rounded-full">+15%</span>
              </li>
            </ul>
          </div>

          {/* Calendar Mini View */}
          <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-body text-body font-bold text-on-surface">October 2024</h3>
              <div className="flex gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">chevron_left</span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">chevron_right</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-label-tag text-label-tag text-on-surface-variant mb-md">
              <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              <div className="h-8 flex items-center justify-center font-caption text-caption opacity-30">21</div>
              <div className="h-8 flex items-center justify-center font-caption text-caption opacity-30">22</div>
              <div className="h-8 flex items-center justify-center font-caption text-caption opacity-30">23</div>
              <div className="h-8 bg-tertiary/20 text-tertiary rounded-lg flex items-center justify-center font-caption text-caption font-bold relative">
                24
                <span className="absolute bottom-1 w-1 h-1 bg-tertiary rounded-full"></span>
              </div>
              <div className="h-8 flex items-center justify-center font-caption text-caption">25</div>
              <div className="h-8 flex items-center justify-center font-caption text-caption">26</div>
              <div className="h-8 flex items-center justify-center font-caption text-caption">27</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
