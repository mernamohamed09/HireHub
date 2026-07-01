import { Button } from '../../components/ui/Button';

export function Dashboard() {
  return (
    <div className="w-full">
      {/* TopAppBar (Glass) */}
      <header className="sticky top-0 z-40 bg-surface-container/50 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center h-16 px-md w-full mb-xl -mt-lg mx-[-24px] lg:mx-[-32px] w-[calc(100%+48px)] lg:w-[calc(100%+64px)]">
        <div className="flex items-center gap-md">
          <button className="md:hidden text-on-surface p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-h3 text-h3 font-bold text-on-surface md:block hidden">Dashboard Overview</h2>
          <h2 className="font-h3 text-h3 font-bold text-on-surface md:hidden">HireHub</h2>
        </div>
        
        <div className="flex items-center gap-lg">
          <div className="hidden lg:flex items-center gap-md text-on-surface-variant">
            <span className="material-symbols-outlined">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-body font-body w-48 outline-none placeholder:text-on-surface-variant/50" placeholder="Search candidates..." type="text" />
          </div>
          
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Button variant="primary" className="active:scale-95">Join Now</Button>
          </div>
        </div>
      </header>

      <div className="space-y-xl">
        {/* Hero Welcome */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
          <div>
            <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-surface">Welcome back, TechCorp 👋</h1>
            <p className="font-body text-body text-on-surface-variant mt-xs">Here is what's happening with your recruitment pipeline today.</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col md:flex-row gap-md w-full md:w-auto">
            <button className="flex items-center justify-center gap-sm bg-primary text-on-primary px-lg py-md rounded-lg font-body font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md shadow-primary/10">
              <span className="material-symbols-outlined">add</span>
              Post New Job
            </button>
            <button className="flex items-center justify-center gap-sm bg-surface-container-high text-on-surface border border-outline-variant px-lg py-md rounded-lg font-body font-bold hover:bg-surface-variant transition-all active:scale-95">
              <span className="material-symbols-outlined">leaderboard</span>
              View ATS Board
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-tertiary transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-body font-medium">Active Job Posts</span>
              <span className="material-symbols-outlined text-tertiary">work</span>
            </div>
            <div className="mt-lg">
              <p className="text-h1 font-h1 text-tertiary">5</p>
              <p className="text-caption font-caption text-on-surface-variant mt-xs">+2 from last month</p>
            </div>
          </div>
          
          <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-tertiary transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-body font-medium">Total Applicants</span>
              <span className="material-symbols-outlined text-tertiary">group</span>
            </div>
            <div className="mt-lg">
              <p className="text-h1 font-h1 text-tertiary">87</p>
              <p className="text-caption font-caption text-on-surface-variant mt-xs">14 new today</p>
            </div>
          </div>
          
          <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-tertiary transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-body font-medium">Interviews This Week</span>
              <span className="material-symbols-outlined text-tertiary">event</span>
            </div>
            <div className="mt-lg">
              <p className="text-h1 font-h1 text-tertiary">6</p>
              <p className="text-caption font-caption text-on-surface-variant mt-xs">2 scheduled for tomorrow</p>
            </div>
          </div>
          
          <div className="bg-surface-container-low border border-outline-variant p-lg rounded-xl flex flex-col justify-between hover:border-tertiary transition-colors group">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-body font-medium">Positions Filled</span>
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
            </div>
            <div className="mt-lg">
              <p className="text-h1 font-h1 text-tertiary">3</p>
              <p className="text-caption font-caption text-on-surface-variant mt-xs">92% target achievement</p>
            </div>
          </div>
        </section>

        {/* Main Dashboard Layout (Bento Grid Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left: Active Job Posts Table */}
          <section className="lg:col-span-2 bg-surface-container p-lg rounded-xl border border-outline-variant space-y-md hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-h3 text-h3 text-on-surface">Active Job Posts</h3>
              <a className="text-primary text-body font-medium hover:underline cursor-pointer">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant">
                  <tr>
                    <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Role Name</th>
                    <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Applicants</th>
                    <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider">Posted Date</th>
                    <th className="py-sm font-label-tag text-label-tag text-on-surface-variant uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  <tr className="group hover:bg-surface-container-high transition-colors">
                    <td className="py-md">
                      <p className="font-body text-body font-bold text-on-surface">Senior Product Manager</p>
                      <p className="font-caption text-caption text-on-surface-variant">Product & Strategy</p>
                    </td>
                    <td className="py-md font-body text-body text-on-surface">24</td>
                    <td className="py-md font-body text-body text-on-surface-variant">Oct 12, 2024</td>
                    <td className="py-md text-right">
                      <span className="bg-tertiary-container/30 text-tertiary border border-tertiary/20 px-sm py-xs rounded-full font-label-tag text-label-tag">Active</span>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-container-high transition-colors">
                    <td className="py-md">
                      <p className="font-body text-body font-bold text-on-surface">DevOps Engineer</p>
                      <p className="font-caption text-caption text-on-surface-variant">Infrastructure</p>
                    </td>
                    <td className="py-md font-body text-body text-on-surface">18</td>
                    <td className="py-md font-body text-body text-on-surface-variant">Oct 08, 2024</td>
                    <td className="py-md text-right">
                      <span className="bg-tertiary-container/30 text-tertiary border border-tertiary/20 px-sm py-xs rounded-full font-label-tag text-label-tag">Active</span>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-container-high transition-colors">
                    <td className="py-md">
                      <p className="font-body text-body font-bold text-on-surface">Lead UI/UX Designer</p>
                      <p className="font-caption text-caption text-on-surface-variant">Creative Design</p>
                    </td>
                    <td className="py-md font-body text-body text-on-surface">31</td>
                    <td className="py-md font-body text-body text-on-surface-variant">Oct 05, 2024</td>
                    <td className="py-md text-right">
                      <span className="bg-error-container/30 text-error border border-error/20 px-sm py-xs rounded-full font-label-tag text-label-tag">Expiring</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Right: Recent Applicants */}
          <section className="bg-surface-container p-lg rounded-xl border border-outline-variant space-y-lg hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-on-surface">Recent Applicants</h3>
              <button className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
            <div className="space-y-md">
              {/* Applicant 1 */}
              <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-high transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-container text-surface flex items-center justify-center font-bold text-xl">
                  M
                </div>
                <div className="flex-1">
                  <p className="font-body text-body font-bold text-on-surface">Marcus Thorne</p>
                  <p className="font-caption text-caption text-on-surface-variant">Product Manager</p>
                </div>
                <span className="bg-secondary-container/30 text-secondary border border-secondary/20 px-sm py-xs rounded-full font-label-tag text-label-tag">New</span>
              </div>
              
              {/* Applicant 2 */}
              <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-high transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-container text-surface flex items-center justify-center font-bold text-xl">
                  E
                </div>
                <div className="flex-1">
                  <p className="font-body text-body font-bold text-on-surface">Elena Rodriguez</p>
                  <p className="font-caption text-caption text-on-surface-variant">DevOps Engineer</p>
                </div>
                <span className="bg-tertiary-container/30 text-tertiary border border-tertiary/20 px-sm py-xs rounded-full font-label-tag text-label-tag">Reviewing</span>
              </div>

              {/* Applicant 3 */}
              <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-high transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-container text-surface flex items-center justify-center font-bold text-xl">
                  J
                </div>
                <div className="flex-1">
                  <p className="font-body text-body font-bold text-on-surface">Jameson Wu</p>
                  <p className="font-caption text-caption text-on-surface-variant">UI/UX Designer</p>
                </div>
                <span className="bg-tertiary-container/30 text-tertiary border border-tertiary/20 px-sm py-xs rounded-full font-label-tag text-label-tag">Reviewing</span>
              </div>

              {/* Applicant 4 */}
              <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-high transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-container text-surface flex items-center justify-center font-bold text-xl">
                  S
                </div>
                <div className="flex-1">
                  <p className="font-body text-body font-bold text-on-surface">Sarah Jenkins</p>
                  <p className="font-caption text-caption text-on-surface-variant">Senior Engineer</p>
                </div>
                <span className="bg-secondary-container/30 text-secondary border border-secondary/20 px-sm py-xs rounded-full font-label-tag text-label-tag">New</span>
              </div>
            </div>
            <button className="w-full py-md text-primary font-body font-bold border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
              View All Applicants
            </button>
          </section>
        </div>

        {/* Hiring Trends Visualization (Atmospheric/Visual) */}
        <section className="bg-surface-container-highest p-lg rounded-xl border border-outline-variant overflow-hidden relative min-h-[200px] flex items-center justify-center hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-primary-container/40 to-tertiary-container/40"></div>
          </div>
          <div className="relative z-10 text-center max-w-md space-y-md">
            <h4 className="font-h2 text-h2 text-on-surface">Automated Talent Matching</h4>
            <p className="font-body text-body text-on-surface-variant">Our AI is currently analyzing 200+ candidates for your Senior Product Manager role. Expected match reports in 2 hours.</p>
            <div className="flex justify-center gap-sm">
              <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse delay-200"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
