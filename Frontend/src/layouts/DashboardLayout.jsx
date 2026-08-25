import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { BackgroundScene } from '../components/ui/BackgroundScene';

export function DashboardLayout({ sidebarLinks, user }) {
  return (
    <div className="flex h-screen w-full relative z-0 overflow-hidden bg-[#0A0F1A]">
      {/* Global 3D Background */}
      <BackgroundScene />
      
      {/* Dashboard Overlay */}
      <div className="absolute inset-0 z-10 flex gap-6 p-4 lg:p-6 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <Sidebar links={sidebarLinks} user={user} />
        </div>
        
        <div className="flex-1 flex flex-col relative overflow-hidden h-full pointer-events-auto">
          {/* Subtle glass background for the main content area, less opaque so stars show through */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] border border-white/5 rounded-2xl pointer-events-none"></div>
          <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative z-10">
            <div className="p-6 lg:p-8 flex-1 flex flex-col">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
