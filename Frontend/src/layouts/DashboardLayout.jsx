import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { BackgroundScene } from '../components/ui/BackgroundScene';
import { Menu, X } from 'lucide-react';

export function DashboardLayout({ sidebarLinks, user }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full relative z-0 overflow-hidden bg-[#0A0F1A]">
      {/* Global 3D Background */}
      <BackgroundScene />
      
      {/* Dashboard Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col md:flex-row gap-0 md:gap-6 p-0 md:p-4 lg:p-6 pointer-events-none">
        
        {/* Mobile Header (Hidden on md+) */}
        <div className="md:hidden pointer-events-auto flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border-b border-white/10 z-50">
          <div className="flex items-center gap-2">
            <img src="/Logo.svg" alt="HireHub" className="h-8 w-auto scale-125 ml-2" />
            <span className="font-bold text-xl text-white tracking-tight leading-none ml-2">
              Hire<span className="text-emerald-400">Hub</span>
            </span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(true)} 
            className="text-white p-2 bg-white/5 rounded-xl border border-white/10"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] pointer-events-auto" 
            onClick={() => setIsMobileOpen(false)} 
          />
        )}

        {/* Sidebar Container */}
        <div className={`
          pointer-events-auto h-full fixed md:relative z-[70] 
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          left-0 top-0 w-max md:w-auto
        `}>
           {isMobileOpen && (
             <button 
               onClick={() => setIsMobileOpen(false)} 
               className="md:hidden absolute top-4 -right-12 text-white p-2 bg-black/80 rounded-full border border-white/10 shadow-xl"
             >
               <X size={20} />
             </button>
           )}
          <Sidebar links={sidebarLinks} user={user} onMobileItemClick={() => setIsMobileOpen(false)} />
        </div>
        
        <div className="flex-1 flex flex-col relative overflow-hidden h-full pointer-events-auto p-4 md:p-0">
          {/* Subtle glass background for the main content area */}
          <div className="absolute inset-0 md:inset-0 -inset-x-4 bg-black/20 backdrop-blur-[2px] border-t md:border border-white/5 md:rounded-2xl pointer-events-none"></div>
          <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative z-10">
            <div className="py-4 md:p-6 lg:p-8 flex-1 flex flex-col">
              <Outlet />
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
