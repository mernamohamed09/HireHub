import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

export function DashboardLayout({ sidebarLinks, user }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar links={sidebarLinks} user={user} />
      <main className="ml-[240px] flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar">
        <div className="p-[24px] lg:p-[32px] flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
