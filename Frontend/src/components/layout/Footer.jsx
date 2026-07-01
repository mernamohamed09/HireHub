import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant py-xl px-gutter mt-auto">
      <div className="max-w-container_max_width mx-auto grid grid-cols-1 md:grid-cols-4 gap-xl">
        <div className="space-y-md">
          <h4 className="font-h3 text-on-surface font-bold">HireHub</h4>
          <p className="text-body text-on-surface-variant max-w-xs">
            Egypt's Tech Recruitment Command Center. Connecting top talent with leading tech companies.
          </p>
        </div>
        <div className="space-y-sm">
          <h5 className="font-bold text-on-surface mb-md">For Candidates</h5>
          <Link to="/jobs" className="block text-on-surface-variant hover:text-primary transition-colors">Browse Jobs</Link>
          <Link to="/profile" className="block text-on-surface-variant hover:text-primary transition-colors">Create Profile</Link>
          <Link to="/applications" className="block text-on-surface-variant hover:text-primary transition-colors">My Applications</Link>
        </div>
        <div className="space-y-sm">
          <h5 className="font-bold text-on-surface mb-md">For Companies</h5>
          <Link to="/company/post-job" className="block text-on-surface-variant hover:text-primary transition-colors">Post a Job</Link>
          <Link to="/company/ats" className="block text-on-surface-variant hover:text-primary transition-colors">ATS System</Link>
          <Link to="/company/pricing" className="block text-on-surface-variant hover:text-primary transition-colors">Pricing</Link>
        </div>
        <div className="space-y-sm">
          <h5 className="font-bold text-on-surface mb-md">Contact</h5>
          <Link to="/support" className="block text-on-surface-variant hover:text-primary transition-colors">Support</Link>
          <Link to="/privacy" className="block text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="block text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
      <div className="border-t border-outline-variant/30 mt-xl pt-lg text-center text-caption text-on-surface-variant">
        &copy; {new Date().getFullYear()} HireHub. All rights reserved.
      </div>
    </footer>
  );
}
