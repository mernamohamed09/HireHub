import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function ForCompanies() {
  return (
    <div className="w-full">
      <section className="relative hero-mesh py-24 px-gutter overflow-hidden min-h-[70vh] flex items-center">
        <div className="max-w-container_max_width mx-auto flex flex-col md:flex-row items-center gap-xl relative z-10">
          <div className="w-full md:w-1/2 space-y-lg">
            <div className="inline-flex items-center gap-sm bg-primary/20 text-primary px-md py-xs rounded-full font-label-tag font-bold tracking-widest uppercase mb-sm border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">business</span>
              Enterprise Ready
            </div>
            <h1 className="font-h1 text-h1-mobile md:text-h1 text-on-surface leading-tight">
              Hire the top 1% of <br /><span className="text-gradient">Tech Talent</span>
            </h1>
            <p className="font-body text-lg text-on-surface-variant max-w-lg">
              Stop sifting through hundreds of unqualified resumes. Our AI-driven platform matches you instantly with pre-vetted professionals perfectly suited for your technical stack and culture.
            </p>
            <div className="flex flex-col sm:flex-row gap-md pt-md">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">Start Hiring Now</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Company Login</Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-lg shadow-2xl relative max-w-md w-full">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
                <h3 className="font-bold text-on-surface">AI Match Pipeline</h3>
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <div className="space-y-md">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-high transition-colors border border-transparent hover:border-outline-variant cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                      {i === 1 ? '98%' : i === 2 ? '95%' : '91%'}
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">Senior React Developer</div>
                      <div className="text-xs text-on-surface-variant">Matches 9/10 required skills</div>
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
