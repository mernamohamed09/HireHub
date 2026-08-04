import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

export function DashboardLayout({ sidebarLinks, user }) {
  return (
    <div className="flex h-screen w-full bg-cyberpunk noise-overlay p-4 lg:p-6 overflow-hidden gap-6 relative z-0">
      <div className="absolute inset-0 z-[-1] ambient-purple opacity-30 pointer-events-none"></div>
      <Sidebar links={sidebarLinks} user={user} />
      <div className="dashboard-container flex-1 flex flex-col relative z-10 overflow-hidden h-full">
        <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="p-6 lg:p-8 flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
