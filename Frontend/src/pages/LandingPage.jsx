import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('candidate');

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative hero-mesh py-24 px-gutter overflow-hidden">
        <div className="max-w-container_max_width mx-auto flex flex-col md:flex-row items-center gap-xl relative z-10">
          <div className="w-full md:w-1/2 space-y-lg">
            <h1 className="font-h1 text-h1-mobile md:text-h1 text-on-surface leading-tight">
              Find Your Next <br /><span className="text-gradient">Opportunity</span>
            </h1>
            <p className="font-body text-lg text-on-surface-variant max-w-lg">
              Connect with Egypt's top tech companies. From startups in Maadi to enterprises in Smart Village, your professional breakthrough starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-md pt-md">
              <Link to="/jobs">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">Find Jobs</Button>
              </Link>
              <Link to="/company/post-job">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Post a Job</Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative h-[450px]">
            {/* Glassmorphism Mockups */}
            <div className="absolute top-0 right-0 w-64 h-80 glass-card rounded-xl p-md transform rotate-3 z-30 shadow-xl border border-white/10">
              <div className="flex items-center gap-sm mb-md">
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">rocket</span>
                </div>
                <div>
                  <div className="font-bold text-on-surface">Senior Frontend</div>
                  <div className="text-xs text-on-surface-variant">Cairo Tech Hub</div>
                </div>
              </div>
              <div className="space-y-sm">
                <div className="h-2 w-full bg-outline-variant rounded-full"></div>
                <div className="h-2 w-3/4 bg-outline-variant rounded-full"></div>
                <div className="flex justify-between mt-lg">
                  <span className="bg-secondary-container text-white px-sm py-xs rounded text-[10px] font-bold">URGENT</span>
                  <span className="text-tertiary font-bold">$3k - $5k</span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-10 left-0 w-72 h-56 glass-card rounded-xl p-md transform -rotate-6 z-20 shadow-xl border border-white/10">
              <div className="font-bold text-on-surface mb-sm">Application Status</div>
              <div className="space-y-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Interview Scheduled</span>
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                </div>
                <div className="flex gap-sm">
                  <div className="w-8 h-8 rounded bg-primary/20"></div>
                  <div className="w-8 h-8 rounded bg-primary/20"></div>
                  <div className="w-8 h-8 rounded bg-primary/20"></div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-surface-container-lowest border-y border-outline-variant py-xl px-gutter">
        <div className="max-w-container_max_width mx-auto grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="text-center">
            <div className="text-h2 font-h2 text-tertiary">10,000+</div>
            <div className="text-caption font-caption uppercase tracking-widest text-on-surface-variant">Jobs Posted</div>
          </div>
          <div className="text-center border-y md:border-y-0 md:border-x border-outline-variant py-lg md:py-0">
            <div className="text-h2 font-h2 text-primary">2,500+</div>
            <div className="text-caption font-caption uppercase tracking-widest text-on-surface-variant">Verified Companies</div>
          </div>
          <div className="text-center">
            <div className="text-h2 font-h2 text-on-surface">95%</div>
            <div className="text-caption font-caption uppercase tracking-widest text-on-surface-variant">Placement Rate</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-gutter">
        <div className="max-w-container_max_width mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-h2 text-h2 text-on-surface">Engineered for Efficiency</h2>
            <p className="text-on-surface-variant mt-sm">Streamlined professional recruitment for the modern era.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="bg-surface-container rounded-xl p-xl border border-outline-variant hover:border-tertiary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-tertiary-container/30 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-sm">Smart Matching</h3>
              <p className="font-body text-on-surface-variant">AI-driven algorithms that analyze skills beyond keywords to find your perfect cultural and technical fit.</p>
            </div>
            <div className="bg-surface-container rounded-xl p-xl border border-outline-variant hover:border-primary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-primary-container/30 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">forum</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-sm">Real-time Chat</h3>
              <p className="font-body text-on-surface-variant">Instant communication between HR leads and candidates. Schedule interviews and ask questions without leaving the hub.</p>
            </div>
            <div className="bg-surface-container rounded-xl p-xl border border-outline-variant hover:border-secondary transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary">account_tree</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-sm">ATS Pipeline</h3>
              <p className="font-body text-on-surface-variant">Manage applicants through a visual drag-and-drop kanban board. Custom stages tailored to your hiring process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface-container-low px-gutter">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-h2 text-h2 text-on-surface">How It Works</h2>
          </div>
          <div className="flex justify-center mb-xl">
            <div className="inline-flex bg-surface-container-highest p-1 rounded-full border border-outline-variant">
              <button 
                className={`px-xl py-sm rounded-full text-sm font-bold transition-all ${activeTab === 'candidate' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setActiveTab('candidate')}
              >
                For Candidates
              </button>
              <button 
                className={`px-xl py-sm rounded-full text-sm font-bold transition-all ${activeTab === 'company' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setActiveTab('company')}
              >
                For Companies
              </button>
            </div>
          </div>
          
          {activeTab === 'candidate' && (
            <div className="space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex gap-lg items-start">
                <div className="w-10 h-10 rounded-full border-2 border-tertiary flex items-center justify-center shrink-0 text-tertiary font-bold">1</div>
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface">Create your AI profile</h4>
                  <p className="text-on-surface-variant">Upload your CV and our system will automatically parse your experience into a digital footprint.</p>
                </div>
              </div>
              <div className="flex gap-lg items-start">
                <div className="w-10 h-10 rounded-full border-2 border-tertiary flex items-center justify-center shrink-0 text-tertiary font-bold">2</div>
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface">Receive Tailored Matches</h4>
                  <p className="text-on-surface-variant">Instead of searching, get notified of jobs that actually match your specific tech stack and location preferences.</p>
                </div>
              </div>
              <div className="flex gap-lg items-start">
                <div className="w-10 h-10 rounded-full border-2 border-tertiary flex items-center justify-center shrink-0 text-tertiary font-bold">3</div>
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface">One-click Interviewing</h4>
                  <p className="text-on-surface-variant">Connect directly with decision-makers via our secure chat system.</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'company' && (
            <div className="space-y-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex gap-lg items-start">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center shrink-0 text-primary font-bold">1</div>
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface">Post Your Requirements</h4>
                  <p className="text-on-surface-variant">Define your role with granular technical requirements and culture-fit markers.</p>
                </div>
              </div>
              <div className="flex gap-lg items-start">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center shrink-0 text-primary font-bold">2</div>
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface">Smart Candidate Screening</h4>
                  <p className="text-on-surface-variant">HireHub automatically ranks applicants based on data points, saving hours of manual review.</p>
                </div>
              </div>
              <div className="flex gap-lg items-start">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center shrink-0 text-primary font-bold">3</div>
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface">Scale Your Team</h4>
                  <p className="text-on-surface-variant">Manage the full pipeline from technical test to final offer in one centralized dashboard.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-gutter">
        <div className="max-w-container_max_width mx-auto bg-primary-container rounded-3xl p-xl md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
          <div className="relative z-10">
            <h2 className="font-h1 text-h1-mobile md:text-h1 text-white mb-md">Ready to start your journey?</h2>
            <p className="text-primary-fixed-dim text-lg mb-xl max-w-2xl mx-auto">Join the largest community of tech professionals in Egypt today and unlock your true potential.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-md">
              <Link to="/register">
                <button className="bg-white text-primary-container px-xl py-md rounded-lg font-bold text-lg hover:shadow-2xl transition-all">Create Free Account</button>
              </Link>
              <button className="border border-white/30 text-white px-xl py-md rounded-lg font-bold text-lg hover:bg-white/10 transition-all">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
