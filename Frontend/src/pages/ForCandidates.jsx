import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function ForCandidates() {
  return (
    <div className="w-full">
      <section className="relative hero-mesh py-24 px-gutter overflow-hidden min-h-[70vh] flex items-center">
        <div className="max-w-container_max_width mx-auto flex flex-col md:flex-row items-center gap-xl relative z-10">
          <div className="w-full md:w-1/2 space-y-lg">
            <div className="inline-flex items-center gap-sm bg-tertiary/20 text-tertiary px-md py-xs rounded-full font-label-tag font-bold tracking-widest uppercase mb-sm border border-tertiary/20">
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              Accelerate Your Career
            </div>
            <h1 className="font-h1 text-h1-mobile md:text-h1 text-on-surface leading-tight">
              Companies apply <br /><span className="text-tertiary">to you.</span>
            </h1>
            <p className="font-body text-lg text-on-surface-variant max-w-lg">
              Create your profile once and let our AI match you with companies that respect your skills and salary expectations. No more cover letters.
            </p>
            <div className="flex flex-col sm:flex-row gap-md pt-md">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto bg-tertiary hover:bg-tertiary/90 text-on-tertiary shadow-lg shadow-tertiary/20">Create Free Profile</Button>
              </Link>
              <Link to="/jobs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Browse Jobs First</Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-lg shadow-2xl relative max-w-md w-full">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
                <h3 className="font-bold text-on-surface">Interview Requests</h3>
                <span className="material-symbols-outlined text-tertiary">notifications_active</span>
              </div>
              <div className="space-y-md">
                <div className="p-md rounded-lg bg-surface-container-high border border-outline-variant relative overflow-hidden group hover:border-tertiary transition-colors cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-tertiary"></div>
                  <div className="flex justify-between items-start mb-sm">
                    <div className="font-bold text-on-surface">TechCorp Inc.</div>
                    <span className="text-xs font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded">New</span>
                  </div>
                  <div className="text-sm text-on-surface-variant">Requested an interview for Frontend Lead</div>
                  <div className="mt-md flex gap-sm">
                    <button className="flex-1 bg-tertiary/20 text-tertiary py-1 rounded text-sm font-bold hover:bg-tertiary hover:text-on-tertiary transition-colors">Accept</button>
                    <button className="flex-1 bg-surface-variant text-on-surface-variant py-1 rounded text-sm font-bold hover:bg-outline-variant transition-colors">Decline</button>
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
