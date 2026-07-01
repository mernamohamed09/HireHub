import { Link } from 'react-router-dom';

export function DashboardHeader({ title = 'HireHub', user }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-header flex justify-between items-center h-16 px-gutter max-w-container_max_width mx-auto">
      <div className="flex items-center gap-md">
        <span className="md:hidden font-h3 text-h3 font-bold text-on-surface">{title}</span>
        <div className="hidden md:flex gap-lg">
          <Link to="/" className="font-body text-body text-on-surface-variant hover:text-primary transition-colors">Home</Link>
          <Link to="/jobs" className="font-body text-body text-on-surface-variant hover:text-primary transition-colors">Browse Jobs</Link>
          <Link to="/company/post-job" className="font-body text-body text-on-surface-variant hover:text-primary transition-colors">For Companies</Link>
          <Link to="/register" className="font-body text-body text-on-surface-variant hover:text-primary transition-colors">For Candidates</Link>
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-outline/30">
          <img 
            src={user?.avatar || 'https://via.placeholder.com/40'} 
            alt="User avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
}
