import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Rocket, Bell } from 'lucide-react';

export function ForCandidates() {
  return (
    <div className="w-full">
      <section className="relative hero-mesh py-24 px-gutter overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-full font-bold tracking-widest uppercase mb-4 border border-emerald-500/30 shadow-lg">
              <Rocket size={16} />
              Accelerate Your Career
            </div>
            <h1 className="font-bold text-5xl md:text-7xl text-white leading-tight">
              Companies apply <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400 drop-shadow-[0_0_15px_rgba(188,19,254,0.5)]">to you.</span>
            </h1>
            <p className="font-medium text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Create your profile once and let our AI match you with companies that respect your skills and salary expectations. No more cover letters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold rounded-xl uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(188,19,254,0.3)]">Create Free Profile</button>
              </Link>
              <Link to="/jobs">
                <button className="w-full sm:w-auto px-8 py-4 bg-surface-container/50 text-white font-bold rounded-xl border border-white/10 uppercase tracking-wider hover:bg-white/5 hover:border-white/30 transition-all">Browse Jobs First</button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl relative max-w-md w-full overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full pointer-events-none transition-all group-hover:bg-emerald-500/30"></div>
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                <h3 className="font-bold text-lg text-white">Interview Requests</h3>
                <Bell className="text-emerald-400" size={20} />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="p-4 rounded-xl bg-surface-container/50 border border-white/5 relative overflow-hidden group-hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg hover:bg-white/5">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-emerald-400"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">TechCorp Inc.</div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg border border-emerald-500/30">New</span>
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium leading-relaxed">Requested an interview for Frontend Lead</div>
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 bg-emerald-500/20 text-emerald-500 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-all shadow-lg border border-emerald-500/30">Accept</button>
                    <button className="flex-1 bg-surface-container text-on-surface-variant py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:text-white hover:bg-white/10 transition-all border border-white/10">Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
