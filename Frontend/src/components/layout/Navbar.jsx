import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../ui/Button';
import { logout } from '../../store/slices/authSlice';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const dashboardPath = user?.role ? `/${user.role}/dashboard` : '/';

  return (
    <nav className={`fixed w-full z-50 border-b border-white/5 transition-all duration-300 ${location.pathname === '/' ? 'bg-[#0B111A]/80 backdrop-blur-md' : 'navbar-pro'}`}>
      <div className="flex justify-between items-center h-16 px-4 md:px-gutter w-full max-w-container_max_width mx-auto">
        <div className="flex items-center gap-4 md:gap-xl">
          <Link to="/" className="flex items-center">
            <img src="/Logo.svg" alt="HireHub Logo" className="h-10 md:h-14 w-auto -ml-2 md:-ml-4 -mr-4 md:-mr-10 scale-125" />
            <span className="font-h3 text-xl md:text-2xl font-bold text-white tracking-tight ml-2 md:ml-0">Hire<span className="text-emerald-400">Hub</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-lg">
            <Link to="/" className="nav-link-pro hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/jobs" className="nav-link-pro hover:text-white transition-colors">
              Browse Jobs
            </Link>
            <Link to="/companies" className="nav-link-pro hover:text-white transition-colors">
              Companies
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-md">
          {isAuthenticated && user ? (
            <>
              <Link to={dashboardPath} className="font-body text-body text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[20px]">
                  {user.role === 'admin' ? 'admin_panel_settings' : 'account_circle'}
                </span>
                <span>
                  {user.role === 'admin' ? 'Admin Portal' : user.name}
                </span>
              </Link>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary">Join Now</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#0B111A]/95 backdrop-blur-xl border-b border-white/10 px-4 py-6 flex flex-col gap-4 shadow-2xl z-40">
          <Link to="/" className="text-lg font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/jobs" className="text-lg font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Browse Jobs</Link>
          <Link to="/companies" className="text-lg font-medium text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Companies</Link>
          <div className="h-px bg-white/10 my-2"></div>
          {isAuthenticated && user ? (
            <>
              <Link to={dashboardPath} className="text-lg font-medium text-emerald-400 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-[24px]">
                  {user.role === 'admin' ? 'admin_panel_settings' : 'account_circle'}
                </span>
                {user.role === 'admin' ? 'Admin Portal' : user.name}
              </Link>
              <Button variant="outline" className="w-full mt-2" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full mt-2">Join Now</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
