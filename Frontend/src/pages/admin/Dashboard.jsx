import { useState } from 'react';
import { Button } from '../../components/ui/Button';

const mockUsers = [
  { id: 1, name: 'Elena Rodriguez', email: 'elena.r@example.com', role: 'Candidate', active: true, avatar: 'E' },
  { id: 2, name: 'Mark Stevenson', email: 'm.stevenson@techcorp.io', role: 'Company', active: true, avatar: 'M' },
  { id: 3, name: 'Ji-Su Park', email: 'jisu.park@design.co', role: 'Candidate', active: false, avatar: 'J' },
  { id: 4, name: 'Omar Kassim', email: 'omar.k@globalhr.com', role: 'Company', active: true, avatar: 'O' },
  { id: 5, name: 'Susan Miller', email: 's.miller@execsearch.net', role: 'Candidate', active: true, avatar: 'S' },
];

export function Dashboard() {
  const [users, setUsers] = useState(mockUsers);

  const toggleUserActive = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  return (
    <div className="w-full relative">
      {/* Floating Glassmorphic Header */}
      <header className="sticky top-0 z-40 mb-xl flex justify-between items-center bg-surface/80 backdrop-blur-md py-md border-b border-outline-variant/30 -mt-lg mx-[-24px] lg:mx-[-32px] px-md lg:px-xl w-[calc(100%+48px)] lg:w-[calc(100%+64px)]">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Admin Overview</h2>
          <p className="text-on-surface-variant font-caption text-caption">Real-time system performance and user activity.</p>
        </div>
        <div className="flex items-center gap-md">
          <div className="relative">
            <span className="material-symbols-outlined p-base bg-surface-container rounded-full text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error border-2 border-background rounded-full"></span>
          </div>
          <Button variant="primary" className="shadow-lg active:scale-95">
            Generate Report
          </Button>
        </div>
      </header>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-md mb-xl">
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-tertiary transition-colors">
          <span className="material-symbols-outlined text-tertiary">group</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Total Users</span>
          <div className="flex items-end justify-between">
            <span className="font-h2 text-h2 text-on-surface">3,240</span>
            <span className="text-tertiary font-caption text-caption flex items-center">+12% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
          </div>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-primary transition-colors">
          <span className="material-symbols-outlined text-primary">domain</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Companies</span>
          <div className="flex items-end justify-between">
            <span className="font-h2 text-h2 text-on-surface">186</span>
            <span className="text-primary font-caption text-caption flex items-center">+5% <span className="material-symbols-outlined text-[14px]">trending_up</span></span>
          </div>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-secondary transition-colors">
          <span className="material-symbols-outlined text-secondary">work_outline</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Active Jobs</span>
          <div className="flex items-end justify-between">
            <span className="font-h2 text-h2 text-on-surface">412</span>
            <span className="text-secondary font-caption text-caption flex items-center">+24 <span className="material-symbols-outlined text-[14px]">add</span></span>
          </div>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs group hover:border-on-surface transition-colors">
          <span className="material-symbols-outlined text-on-surface">description</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Applications</span>
          <div className="flex items-end justify-between">
            <span className="font-h2 text-h2 text-on-surface">58</span>
            <span className="text-on-surface-variant font-caption text-caption">Today</span>
          </div>
        </div>
        <div className="glass-panel p-lg rounded-xl flex flex-col gap-xs border-error/50 bg-error-container/10 group hover:bg-error-container/20 transition-all">
          <span className="material-symbols-outlined text-error">flag</span>
          <span className="text-on-surface-variant font-label-tag text-label-tag uppercase">Flagged</span>
          <div className="flex items-end justify-between">
            <span className="font-h2 text-h2 text-error">3</span>
            <span className="text-error font-caption text-caption font-bold">Action Needed</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Main Analytics & Flagged Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl mb-xl">
        {/* Platform Activity Placeholder Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-lg flex flex-col hover:scale-[1.01] transition-transform duration-300">
          <div className="flex justify-between items-center mb-xl">
            <h3 className="font-h3 text-h3 text-on-surface">Platform Activity</h3>
            <div className="flex gap-sm">
              <button className="font-label-tag text-label-tag px-sm py-xs bg-tertiary-container/30 text-tertiary rounded-full">Weekly</button>
              <button className="font-label-tag text-label-tag px-sm py-xs text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">Monthly</button>
            </div>
          </div>
          
          {/* Visual Placeholder for Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-md h-48 px-md">
            {[40, 65, 50, 90, 35, 75, 45].map((height, i) => (
              <div 
                key={i} 
                className={`w-full ${height === 90 ? 'bg-tertiary/20 hover:bg-tertiary' : 'bg-primary/20 hover:bg-primary'} rounded-t-lg transition-all cursor-pointer relative group`}
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface px-sm py-xs rounded text-[10px] hidden group-hover:block z-10">{height * 3}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-md px-md text-on-surface-variant font-caption text-caption">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        
        {/* Flagged Content */}
        <div className="glass-panel rounded-xl p-lg flex flex-col hover:scale-[1.01] transition-transform duration-300">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-sm">
              Flagged Content
              <span className="bg-error-container text-on-error-container text-[10px] px-sm py-xs rounded-full">3 Reports</span>
            </h3>
          </div>
          <div className="space-y-md flex-1 overflow-y-auto max-h-64 pr-xs custom-scrollbar">
            {/* Report 1 */}
            <div className="p-md bg-surface-container rounded-lg border-l-4 border-error">
              <div className="flex items-start justify-between mb-xs">
                <span className="font-label-tag text-label-tag text-error font-bold uppercase">Spam/Scam</span>
                <span className="text-on-surface-variant text-[10px]">2h ago</span>
              </div>
              <p className="font-body text-body text-on-surface-variant mb-md">Job posting: "Remote Junior Developer (Earn $500/hr)" has been flagged by 4 users.</p>
              <div className="flex gap-sm">
                <button className="flex-1 bg-error text-on-error font-label-tag text-label-tag py-xs rounded hover:opacity-90 transition-opacity">Review</button>
                <button className="flex-1 border border-outline-variant text-on-surface-variant font-label-tag text-label-tag py-xs rounded hover:bg-surface-container-high transition-colors">Dismiss</button>
              </div>
            </div>
            
            {/* Report 2 */}
            <div className="p-md bg-surface-container rounded-lg border-l-4 border-error">
              <div className="flex items-start justify-between mb-xs">
                <span className="font-label-tag text-label-tag text-error font-bold uppercase">Harassment</span>
                <span className="text-on-surface-variant text-[10px]">5h ago</span>
              </div>
              <p className="font-body text-body text-on-surface-variant mb-md">Candidate "M. Jordan" reported inappropriate chat message from "Nexus HR".</p>
              <div className="flex gap-sm">
                <button className="flex-1 bg-error text-on-error font-label-tag text-label-tag py-xs rounded hover:opacity-90 transition-opacity">Review</button>
                <button className="flex-1 border border-outline-variant text-on-surface-variant font-label-tag text-label-tag py-xs rounded hover:bg-surface-container-high transition-colors">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <section className="glass-panel rounded-xl overflow-hidden mb-xl hover:scale-[1.01] transition-transform duration-300">
        <div className="p-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md border-b border-outline-variant/30">
          <h3 className="font-h3 text-h3 text-on-surface">Recent User Registrations</h3>
          <div className="flex gap-md w-full md:w-auto">
            <div className="flex items-center bg-surface-container rounded-lg px-md py-xs border border-outline-variant/50 flex-1 md:flex-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body text-on-surface placeholder-on-surface-variant w-full md:w-48 outline-none" placeholder="Search users..." type="text" />
            </div>
            <button className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined">filter_list</span>
              <span className="font-body text-body hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high/50 text-on-surface-variant font-label-tag text-label-tag uppercase">
              <tr>
                <th className="px-lg py-md">User</th>
                <th className="px-lg py-md">Email</th>
                <th className="px-lg py-md">Role</th>
                <th className="px-lg py-md text-center">Status</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-surface-container-highest transition-colors group">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-surface flex items-center justify-center font-bold text-sm">
                        {user.avatar}
                      </div>
                      <span className="font-body text-body font-bold text-on-surface whitespace-nowrap">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md font-body text-body text-on-surface-variant whitespace-nowrap">{user.email}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-xs rounded-full font-label-tag text-[10px] uppercase ${user.role === 'Candidate' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-primary-container/30 text-primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-lg py-md text-center">
                    <div 
                      className="inline-flex items-center p-xs bg-surface-container rounded-full cursor-pointer hover:bg-outline-variant/30 transition-all active:scale-95"
                      onClick={() => toggleUserActive(user.id)}
                    >
                      <div className={`toggle-bg w-9 h-5 rounded-full transition-colors ${user.active ? 'bg-tertiary' : 'bg-outline-variant/50'}`}>
                        <div className={`toggle-dot w-3 h-3 bg-white rounded-full mt-1 ml-1 transition-transform ${user.active ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all opacity-0 group-hover:opacity-100">more_vert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-lg bg-surface-container-low flex justify-between items-center text-on-surface-variant font-caption text-caption border-t border-outline-variant/30">
          <span>Showing {users.length} of 3,240 users</span>
          <div className="flex gap-md">
            <button className="hover:text-primary transition-colors">Previous</button>
            <button className="hover:text-primary transition-colors">Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
