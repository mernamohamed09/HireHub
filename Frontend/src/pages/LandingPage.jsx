import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, BrainCircuit, MessageSquare, KanbanSquare, Network, Sparkles, Binary, Building2, UserCircle2, CheckCircle2 } from 'lucide-react';
import { BackgroundScene } from '../components/ui/BackgroundScene';

/* 
  🎨 THEME: "Executive Glass & Emerald" 
  A highly professional, trustworthy, yet modern and creative design tailored for high-end recruitment.
  Uses deep slates, professional blues, and growth-oriented emerald greens with clean glassmorphism.
*/

const styleSheet = `
  @keyframes subtle-float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }
  
  .bg-executive {
    background-color: #0B111A; /* Deep slate blue/black */
    background-image: 
      radial-gradient(circle at 15% 50%, rgba(13, 148, 136, 0.08), transparent 25%),
      radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.08), transparent 25%);
  }

  .glass-card-pro {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
    border-radius: 24px;
    transition: all 0.4s ease;
  }
  .glass-card-pro:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px -4px rgba(0, 0, 0, 0.4);
    transform: translateY(-4px);
  }

  .btn-pro-primary {
    background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
    color: white;
    box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
    border: 1px solid rgba(255,255,255,0.1);
    transition: all 0.3s ease;
  }
  .btn-pro-primary:hover {
    background: linear-gradient(135deg, #0f766e 0%, #059669 100%);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.23);
    transform: translateY(-1px);
  }

  .btn-pro-outline {
    background: rgba(255, 255, 255, 0.03);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  }
  .btn-pro-outline:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .text-gradient-pro {
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-emerald {
    background: linear-gradient(to right, #2dd4bf, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('candidate');

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-executive text-slate-200">
      <style>{styleSheet}</style>

      {/* ── Ambient Background Glows ───────────────────────────── */}
      <BackgroundScene />

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-gutter min-h-screen flex items-center z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">
          <div className="w-full md:w-1/2 space-y-6 md:space-y-8 relative z-20 mt-10 md:mt-0 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold tracking-wide text-xs bg-white/5 border border-white/10 text-emerald-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Enterprise-Grade Talent Platform
            </div>
            
            <h1 className="font-bold text-4xl sm:text-5xl md:text-7xl leading-[1.1] tracking-tight text-white">
              Hire the top 1% <br className="hidden sm:block" />
              <span className="text-gradient-emerald font-extrabold">faster & smarter.</span>
            </h1>
            
            <p className="text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed text-slate-400 font-medium">
              A sophisticated recruitment ecosystem designed for modern teams. Streamline your hiring pipeline with AI-driven insights and elegant workflows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6 justify-center md:justify-start">
              <Link to="/company/post-job">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold tracking-wide text-sm btn-pro-primary flex items-center justify-center gap-2">
                  <Building2 size={18} /> Post a Position
                </button>
              </Link>
              <Link to="/jobs">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold tracking-wide text-sm btn-pro-outline flex items-center justify-center gap-2">
                  <Sparkles size={18} /> Explore Opportunities
                </button>
              </Link>
            </div>
            
            <div className="pt-8 flex items-center justify-center md:justify-start gap-6 border-t border-white/5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by top tech companies</span>
            </div>
          </div>

          {/* Right side: Mockup / Hero Visual */}
          <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px] flex items-center justify-center z-10" style={{ perspective: '1200px' }}>
            
            {/* Orbiting Icons Background Ring - Centering Wrapper */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] z-0 pointer-events-none hidden sm:block">
              <div className="w-full h-full rounded-full border border-white/5 animate-[spin_40s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-[#0F172A]/80 backdrop-blur-xl border border-emerald-500/30 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg animate-[spin_40s_linear_infinite_reverse]">
                    <BrainCircuit className="text-emerald-400 w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-[#0F172A]/80 backdrop-blur-xl border border-amber-500/30 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg animate-[spin_40s_linear_infinite_reverse]">
                    <Rocket className="text-amber-400 w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-[#0F172A]/80 backdrop-blur-xl border border-teal-400/30 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg animate-[spin_40s_linear_infinite_reverse]">
                    <KanbanSquare className="text-teal-400 w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-[#0F172A]/80 backdrop-blur-xl border border-blue-500/30 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg animate-[spin_40s_linear_infinite_reverse]">
                    <MessageSquare className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
                  </div>
              </div>
            </div>

            {/* Main Mockup Card Centering Wrapper */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[450px] z-10 perspective-[1200px]">
              
              <div 
                className="w-full glass-card-pro p-1 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-transform duration-1000 ease-out group hover:rotate-0" 
                style={{ 
                  transform: 'rotateY(-5deg) rotateX(4deg) rotateZ(1deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                
                {/* Mockup Header */}
                <div className="bg-[#111827]/90 backdrop-blur-md p-3 md:p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-600" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-600" />
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-slate-600" />
                  </div>
                  <div className="text-[10px] md:text-xs font-semibold text-slate-400 flex items-center gap-1 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Senior React Engineer • Pipeline
                  </div>
                  <div className="w-6 md:w-8" />
                </div>
                
                {/* Mockup Body */}
                <div className="bg-[#0F172A]/95 p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-white font-bold text-base md:text-lg group-hover:text-emerald-400 transition-colors duration-500">Candidates (24)</h3>
                    <div className="px-2 py-1 md:px-3 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] md:text-xs font-bold border border-emerald-500/20">Active</div>
                  </div>
                  
                  {/* Candidate Row 1 */}
                  <div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all transform hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 font-bold text-xs md:text-sm">
                        JS
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-white">Jonathan Smith</div>
                        <div className="text-[10px] md:text-xs text-slate-400">Ex-Google • 8 YOE</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="flex items-center gap-1 text-[10px] md:text-xs text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={10} className="md:w-3 md:h-3" /> 98% Match
                      </div>
                      <div className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-md border border-white/10 hidden sm:block">Technical Interview</div>
                    </div>
                  </div>
                  
                  {/* Candidate Row 2 */}
                  <div className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all transform hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 font-bold text-xs md:text-sm">
                        AM
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-bold text-white">Alice Monroe</div>
                        <div className="text-[10px] md:text-xs text-slate-400">Frontend Lead • 6 YOE</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="flex items-center gap-1 text-[10px] md:text-xs text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={10} className="md:w-3 md:h-3" /> 92% Match
                      </div>
                      <div className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-md border border-white/10 hidden sm:block">Initial Screening</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating UI Badge - Bottom Right */}
            <div className="absolute bottom-0 md:bottom-10 right-0 bg-[#0B111A]/90 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 pointer-events-none animate-[subtle-float_6s_ease-in-out_infinite_reverse]">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glow-cyan">
                <BrainCircuit size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold">Neural Matching</div>
                <div className="text-xs md:text-sm font-bold text-white">Semantic AI Active</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-[#0f172a]/50 backdrop-blur-xl relative z-20 flex justify-center py-6 md:py-8">
        <div className="max-w-5xl w-full flex flex-wrap justify-center sm:justify-between gap-6 md:gap-8 px-4 md:px-gutter">
          <StatBox value="98%" label="Placement Success" />
          <StatBox value="-45%" label="Time to Hire" />
          <StatBox value="50k+" label="Elite Candidates" />
          <StatBox value="1k+" label="Partner Companies" />
        </div>
      </div>

      <section className="py-20 md:py-32 px-4 md:px-gutter relative z-10 bg-executive">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="font-bold text-3xl md:text-5xl text-white mb-4 md:mb-6">Engineered for <span className="text-emerald-400">Precision</span></h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto text-slate-400 font-medium px-4">
              We provide the tools necessary to filter noise and identify true potential. Manage your entire recruitment lifecycle from a single, elegant platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard
              icon={<BrainCircuit className="text-emerald-400" size={32} />}
              title="Semantic AI Matching"
              description="Move beyond keyword searching. Our AI analyzes candidate context, career trajectory, and soft skills to surface perfect fits."
            />
            <FeatureCard
              icon={<KanbanSquare className="text-blue-400" size={32} />}
              title="Pipeline Automation"
              description="Customizable ATS boards that automatically trigger emails, assessments, and status updates as candidates move."
            />
            <FeatureCard
              icon={<MessageSquare className="text-teal-400" size={32} />}
              title="Integrated Communications"
              description="Schedule interviews, conduct video calls, and collaborate with your hiring team without leaving the hub."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 md:px-gutter relative z-10 bg-[#0F172A]/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-bold text-3xl md:text-5xl text-white">How HireHub Works</h2>
          </div>
          
          <div className="flex justify-center mb-10 md:mb-16">
            <div className="flex flex-col sm:flex-row p-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
              <button 
                className={`px-6 md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'company' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('company')}
              >
                For Employers
              </button>
              <button 
                className={`px-6 md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'candidate' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('candidate')}
              >
                For Candidates
              </button>
            </div>
          </div>
          
          <div className="space-y-4 md:space-y-6 px-2 md:px-0">
            {activeTab === 'company' ? (
              <>
                <StepCard num="01" title="Define Requirements" desc="Create detailed job postings. Our AI helps suggest the right skills and market-rate salaries." />
                <StepCard num="02" title="Review Ranked Matches" desc="Instantly receive a shortlist of the most qualified talent, scored objectively by our algorithm." />
                <StepCard num="03" title="Interview & Hire" desc="Manage the process via our Kanban ATS and make data-driven hiring decisions effortlessly." />
              </>
            ) : (
              <>
                <StepCard num="01" title="Build Your Profile" desc="Upload your resume and let our system parse your experience into a structured, searchable profile." />
                <StepCard num="02" title="Receive Opportunities" desc="Get matched with companies looking for your exact skill set. No more endless scrolling on job boards." />
                <StepCard num="03" title="Secure Your Future" desc="Communicate directly with hiring managers and schedule interviews smoothly within the platform." />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-4 md:px-gutter relative z-10 flex justify-center">
        <div className="max-w-5xl w-full glass-card-pro rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden bg-[#0F172A]/80 border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-blue-600/10" />
          
          <div className="relative z-10">
            <h2 className="font-bold text-3xl sm:text-4xl md:text-6xl mb-4 md:mb-6 text-white tracking-tight">
              Ready to transform your hiring?
            </h2>
            <p className="font-medium text-base md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto text-slate-300">
              Join the platform that is setting the new standard for professional tech recruitment.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <button className="w-full sm:w-auto px-8 md:px-10 py-4 rounded-xl font-bold text-sm btn-pro-primary">
                  Get Started for Free
                </button>
              </Link>
              <Link to="/contact">
                 <button className="w-full sm:w-auto px-8 md:px-10 py-4 rounded-xl font-bold text-sm btn-pro-outline">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Helper Components ───────────────────────────────────── */

function StatBox({ value, label }) {
  return (
    <div className="text-center py-4 px-6">
      <div className="text-4xl font-extrabold text-white mb-2">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-card-pro p-8 relative overflow-hidden group border-white/5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-2xl mb-3 text-white">{title}</h3>
      <p className="font-medium text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function StepCard({ num, title, desc }) {
  return (
    <div className="p-8 glass-card-pro flex gap-8 items-start hover:bg-white/5 transition-colors border-white/5">
      <div className="text-3xl font-extrabold text-emerald-500/50 shrink-0 font-mono">
        {num}
      </div>
      <div>
        <h4 className="font-bold text-xl mb-2 text-white">{title}</h4>
        <p className="font-medium text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
