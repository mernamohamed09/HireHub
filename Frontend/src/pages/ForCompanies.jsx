import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Building2, Sparkles } from 'lucide-react';

export function ForCompanies() {
  return (
    <div className="w-full">
      <section className="relative hero-mesh py-24 px-gutter overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none -z-10 -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-full md:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full font-bold tracking-widest uppercase mb-4 border border-emerald-400/30 shadow-lg">
              <Building2 size={16} />
              Enterprise Ready
            </div>
            <h1 className="font-bold text-5xl md:text-7xl text-white leading-tight">
              Hire the top 1% of <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">Tech Talent</span>
            </h1>
            <p className="font-medium text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Stop sifting through hundreds of unqualified resumes. Our AI-driven platform matches you instantly with pre-vetted professionals perfectly suited for your technical stack and culture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)]">Start Hiring Now</button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto px-8 py-4 bg-surface-container/50 text-white font-bold rounded-xl border border-white/10 uppercase tracking-wider hover:bg-white/5 hover:border-white/30 transition-all">Company Login</button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl relative max-w-md w-full overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-[40px] rounded-full pointer-events-none transition-all group-hover:bg-emerald-400/30"></div>
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 relative z-10">
                <h3 className="font-bold text-lg text-white">AI Match Pipeline</h3>
                <Sparkles className="text-emerald-500" size={20} />
              </div>
              <div className="space-y-4 relative z-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/50 border border-white/5 hover:border-emerald-400/50 hover:bg-white/5 transition-all cursor-pointer shadow-lg group/item">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner border transition-all ${
                      i === 1 ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30 shadow-lg' :
                      i === 2 ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30 shadow-lg' :
                      'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 shadow-lg'
                    }`}>
                      {i === 1 ? '98%' : i === 2 ? '95%' : '91%'}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover/item:text-emerald-400 transition-colors">Senior React Developer</div>
                      <div className="text-xs text-on-surface-variant font-medium mt-1">Matches {10 - i}/10 required skills</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
