import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Rocket, BrainCircuit, MessageSquare, KanbanSquare, Network, Sparkles, Binary, Building2, UserCircle2 } from 'lucide-react';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('candidate');

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-mesh py-32 px-gutter overflow-hidden min-h-screen flex items-center border-b border-white/10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-purple/20 blur-[150px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-cyan/20 blur-[150px] rounded-full pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none -z-10 mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10 w-full">
          <div className="w-full md:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-neon-cyan/10 text-neon-cyan px-4 py-2 rounded-full font-bold tracking-widest uppercase mb-4 border border-neon-cyan/30 shadow-glow-cyan backdrop-blur-md">
              <Network size={16} />
              The Future of Recruitment
            </div>
            <h1 className="font-bold text-6xl md:text-8xl text-white leading-tight">
              Find Your Next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">Opportunity</span>
            </h1>
            <p className="font-medium text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Connect with top tech companies. From disruptive startups to global enterprises, your professional breakthrough starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link to="/jobs">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold rounded-xl uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center justify-center gap-2">
                  <Sparkles size={18} /> Find Jobs
                </button>
              </Link>
              <Link to="/company/post-job">
                <button className="w-full sm:w-auto px-8 py-4 bg-surface-container/50 text-white font-bold rounded-xl border border-white/10 uppercase tracking-wider hover:bg-white/5 hover:border-white/30 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
                  <Building2 size={18} /> Post a Job
                </button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative h-[500px]">
            {/* Glassmorphism Mockups */}
            <div className="absolute top-10 right-0 w-72 glass-card rounded-2xl p-6 transform rotate-6 z-30 shadow-2xl border border-white/10 backdrop-blur-xl group hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30 shadow-glow-purple">
                  <Rocket className="text-neon-purple" size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg text-white group-hover:text-neon-purple transition-colors">Senior Frontend</div>
                  <div className="text-xs text-on-surface-variant font-medium">Tech Hub</div>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-purple w-full"></div>
                </div>
                <div className="h-2 w-3/4 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-cyan w-full"></div>
                </div>
                <div className="flex justify-between mt-8 items-end">
                  <span className="bg-neon-pink/20 border border-neon-pink/30 text-neon-pink px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-glow-pink animate-pulse">URGENT</span>
                  <span className="text-neon-cyan font-bold text-lg drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">$3k - $5k</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-0 w-80 glass-card rounded-2xl p-6 transform -rotate-3 z-20 shadow-2xl border border-white/10 backdrop-blur-xl group hover:rotate-0 transition-transform duration-500 delay-100">
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="font-bold text-white mb-4 flex justify-between items-center relative z-10">
                <span>Application Status</span>
                <Binary className="text-neon-cyan opacity-50" size={16} />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between bg-surface-container/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Interview Scheduled</span>
                  <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan animate-pulse"></span>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center shadow-glow-cyan"><UserCircle2 className="text-neon-cyan" size={20} /></div>
                  <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center"><Building2 className="text-neon-purple" size={20} /></div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><MessageSquare className="text-white/40" size={20} /></div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neon-cyan/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="glass-panel border-y border-white/10 py-16 px-gutter relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-mint drop-shadow-[0_0_10px_rgba(0,255,255,0.4)] group-hover:scale-110 transition-transform">10,000+</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-4">Jobs Posted</div>
          </div>
          <div className="text-center border-y md:border-y-0 md:border-x border-white/10 py-12 md:py-0 group">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink drop-shadow-[0_0_10px_rgba(188,19,254,0.4)] group-hover:scale-110 transition-transform">2,500+</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-4">Verified Companies</div>
          </div>
          <div className="text-center group">
            <div className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform">95%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-4">Placement Rate</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-gutter relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-bold text-4xl md:text-5xl text-white">Engineered for Efficiency</h2>
            <p className="text-on-surface-variant mt-4 text-lg max-w-2xl mx-auto font-medium">Streamlined professional recruitment for the modern era.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-10 border border-white/5 hover:border-neon-cyan/50 transition-all duration-300 group hover:-translate-y-2 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-2xl bg-neon-cyan/20 flex items-center justify-center mb-8 border border-neon-cyan/30 shadow-glow-cyan relative z-10">
                <BrainCircuit className="text-neon-cyan" size={32} />
              </div>
              <h3 className="font-bold text-2xl text-white mb-4 relative z-10">Smart Matching</h3>
              <p className="font-medium text-on-surface-variant leading-relaxed relative z-10">AI-driven algorithms that analyze skills beyond keywords to find your perfect cultural and technical fit.</p>
            </div>
            
            <div className="glass-card rounded-3xl p-10 border border-white/5 hover:border-neon-purple/50 transition-all duration-300 group hover:-translate-y-2 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-2xl bg-neon-purple/20 flex items-center justify-center mb-8 border border-neon-purple/30 shadow-glow-purple relative z-10">
                <MessageSquare className="text-neon-purple" size={32} />
              </div>
              <h3 className="font-bold text-2xl text-white mb-4 relative z-10">Real-time Chat</h3>
              <p className="font-medium text-on-surface-variant leading-relaxed relative z-10">Instant communication between HR leads and candidates. Schedule interviews and ask questions without leaving the hub.</p>
            </div>
            
            <div className="glass-card rounded-3xl p-10 border border-white/5 hover:border-neon-pink/50 transition-all duration-300 group hover:-translate-y-2 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-neon-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-2xl bg-neon-pink/20 flex items-center justify-center mb-8 border border-neon-pink/30 shadow-glow-pink relative z-10">
                <KanbanSquare className="text-neon-pink" size={32} />
              </div>
              <h3 className="font-bold text-2xl text-white mb-4 relative z-10">ATS Pipeline</h3>
              <p className="font-medium text-on-surface-variant leading-relaxed relative z-10">Manage applicants through a visual drag-and-drop kanban board. Custom stages tailored to your hiring process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-surface-container/30 border-y border-white/5 px-gutter relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl md:text-5xl text-white">How It Works</h2>
          </div>
          <div className="flex justify-center mb-16">
            <div className="inline-flex glass-panel p-2 rounded-full border border-white/10 shadow-lg">
              <button 
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'candidate' ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-glow-cyan' : 'text-on-surface-variant hover:text-white'}`}
                onClick={() => setActiveTab('candidate')}
              >
                For Candidates
              </button>
              <button 
                className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'company' ? 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white shadow-glow-purple' : 'text-on-surface-variant hover:text-white'}`}
                onClick={() => setActiveTab('company')}
              >
                For Companies
              </button>
            </div>
          </div>
          
          {activeTab === 'candidate' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-8 items-start hover:border-neon-cyan/30 transition-colors group shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border-2 border-neon-cyan/30 flex items-center justify-center shrink-0 text-neon-cyan font-bold text-xl shadow-glow-cyan relative z-10 group-hover:scale-110 transition-transform">1</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-2xl text-white mb-2">Create your AI profile</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Upload your CV and our system will automatically parse your experience into a digital footprint.</p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-8 items-start hover:border-neon-purple/30 transition-colors group shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 border-2 border-neon-purple/30 flex items-center justify-center shrink-0 text-neon-purple font-bold text-xl shadow-glow-purple relative z-10 group-hover:scale-110 transition-transform">2</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-2xl text-white mb-2">Receive Tailored Matches</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Instead of searching, get notified of jobs that actually match your specific tech stack and location preferences.</p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-8 items-start hover:border-neon-pink/30 transition-colors group shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-neon-pink/10 border-2 border-neon-pink/30 flex items-center justify-center shrink-0 text-neon-pink font-bold text-xl shadow-glow-pink relative z-10 group-hover:scale-110 transition-transform">3</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-2xl text-white mb-2">One-click Interviewing</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Connect directly with decision-makers via our secure chat system.</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'company' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-8 items-start hover:border-neon-purple/30 transition-colors group shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 border-2 border-neon-purple/30 flex items-center justify-center shrink-0 text-neon-purple font-bold text-xl shadow-glow-purple relative z-10 group-hover:scale-110 transition-transform">1</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-2xl text-white mb-2">Post Your Requirements</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Define your role with granular technical requirements and culture-fit markers.</p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-8 items-start hover:border-neon-cyan/30 transition-colors group shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border-2 border-neon-cyan/30 flex items-center justify-center shrink-0 text-neon-cyan font-bold text-xl shadow-glow-cyan relative z-10 group-hover:scale-110 transition-transform">2</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-2xl text-white mb-2">Smart Candidate Screening</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">HireHub automatically ranks applicants based on data points, saving hours of manual review.</p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex gap-8 items-start hover:border-neon-mint/30 transition-colors group shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-mint/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 rounded-2xl bg-neon-mint/10 border-2 border-neon-mint/30 flex items-center justify-center shrink-0 text-neon-mint font-bold text-xl shadow-glow-mint relative z-10 group-hover:scale-110 transition-transform">3</div>
                <div className="relative z-10">
                  <h4 className="font-bold text-2xl text-white mb-2">Scale Your Team</h4>
                  <p className="text-on-surface-variant font-medium leading-relaxed">Manage the full pipeline from technical test to final offer in one centralized dashboard.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-gutter relative overflow-hidden">
        <div className="max-w-6xl mx-auto glass-panel border border-neon-cyan/30 shadow-glow-cyan rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-purple/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="font-bold text-5xl md:text-7xl text-white mb-8">Ready to start your journey?</h2>
            <p className="text-white/80 font-medium text-xl mb-12 max-w-2xl mx-auto leading-relaxed">Join the largest community of tech professionals today and unlock your true potential.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register">
                <button className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-95">Create Free Account</button>
              </Link>
              <button className="glass-card border border-white/20 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-wider text-sm hover:bg-white/10 hover:border-white/40 transition-all active:scale-95">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
