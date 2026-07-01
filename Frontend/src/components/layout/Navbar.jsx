import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Jobs', path: '/jobs' },
    { name: 'For Companies', path: '/companies' },
    { name: 'For Candidates', path: '/candidates' },
  ];

  return (
    <header className="bg-surface/95 backdrop-blur-md border-b border-outline-variant shadow-md docked full-width top-0 sticky z-50">
      <div className="flex justify-between items-center h-16 px-gutter w-full max-w-container_max_width mx-auto">
        <div className="flex items-center gap-xl">
          <Link to="/" className="font-h3 text-h3 font-bold text-on-surface">HireHub</Link>
          <nav className="hidden md:flex items-center gap-lg">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-body text-body transition-colors duration-200 ${
                    isActive 
                      ? 'text-tertiary border-b-2 border-tertiary pb-1' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
            notifications
          </button>
          <Link to="/login">
            <Button variant="primary">Join Now</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
