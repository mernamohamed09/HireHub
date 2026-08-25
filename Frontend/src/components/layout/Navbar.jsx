import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../ui/Button';
import { logout } from '../../store/slices/authSlice';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const dashboardPath = user?.role ? `/${user.role}/dashboard` : '/';

  return (
    <nav className={`fixed w-full z-50 border-b border-white/5 transition-all duration-300 ${location.pathname === '/' ? 'bg-[#0B111A]/80 backdrop-blur-md' : 'navbar-pro'}`}>
      <div className="flex justify-between items-center h-16 px-gutter w-full max-w-container_max_width mx-auto">
        <div className="flex items-center gap-xl">
          <Link to="/" className="flex items-center">
            <img src="/Logo.svg" alt="HireHub Logo" className="h-10 md:h-14 w-auto -ml-4 -mr-6 md:-mr-10 scale-125" />
            <span className="font-h3 text-2xl font-bold text-white tracking-tight">Hire<span className="text-emerald-400">Hub</span></span>
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
        <div className="flex items-center gap-md">
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
      </div>
    </nav>
  );
}
