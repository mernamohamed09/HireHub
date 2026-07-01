import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { ForCompanies } from './pages/ForCompanies';
import { ForCandidates } from './pages/ForCandidates';
import { LoginRegister } from './pages/LoginRegister';
import { BrowseJobs } from './pages/BrowseJobs';
import { JobDetail } from './pages/JobDetail';
import { Scheduling } from './pages/Scheduling';
import { ChatInbox } from './pages/ChatInbox';
import { Notifications } from './pages/Notifications';
import { Dashboard as CandidateDashboard } from './pages/candidate/Dashboard';
import { Profile as CandidateProfile } from './pages/candidate/Profile';
import { CVManager } from './pages/candidate/CVManager';
import { MyApplications as CandidateApplications } from './pages/candidate/MyApplications';
import { Dashboard as CompanyDashboard } from './pages/company/Dashboard';
import { ATSBoard } from './pages/company/ATSBoard';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Users as AdminUsers } from './pages/admin/Users';
import { Companies as AdminCompanies } from './pages/admin/Companies';

// Temporary mock user and links
const mockUser = { name: 'Sarah Ahmed', role: 'Candidate', avatar: 'https://via.placeholder.com/40' };
const mockCompanyUser = { name: 'TechCorp', role: 'Company', avatar: 'https://via.placeholder.com/40' };
const mockAdminUser = { name: 'Sarah Ahmed', role: 'Admin Lead', avatar: 'https://via.placeholder.com/40' };

const candidateLinks = [
  { path: '/candidate/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/jobs', icon: 'work', label: 'Browse Jobs' },
  { path: '/candidate/applications', icon: 'description', label: 'My Applications' },
  { path: '/candidate/profile', icon: 'person', label: 'Profile' },
  { path: '/candidate/cv', icon: 'folder_shared', label: 'CV Manager' },
  { path: '/schedule', icon: 'calendar_today', label: 'Schedule' },
  { path: '/chat', icon: 'chat', label: 'Chat' },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
];

const companyLinks = [
  { path: '/company/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/company/ats', icon: 'view_kanban', label: 'ATS Board' },
  { path: '/company/jobs', icon: 'work', label: 'Job Posts' },
  { path: '/schedule', icon: 'calendar_today', label: 'Schedule' },
  { path: '/chat', icon: 'chat', label: 'Chat' },
];

const adminLinks = [
  { path: '/admin/dashboard', icon: 'dashboard', label: 'Overview' },
  { path: '/admin/users', icon: 'person', label: 'Users' },
  { path: '/admin/companies', icon: 'business', label: 'Companies' },
  { path: '/admin/jobs', icon: 'work', label: 'Jobs' },
  { path: '/admin/reports', icon: 'analytics', label: 'Reports' },
];

function App() {
  return (
    <div className="dark bg-background min-h-screen text-on-surface">
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/register" element={<LoginRegister />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/companies" element={<ForCompanies />} />
          <Route path="/candidates" element={<ForCandidates />} />
        </Route>

        <Route element={<DashboardLayout sidebarLinks={candidateLinks} user={mockUser} />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/candidate/cv" element={<CVManager />} />
          <Route path="/candidate/applications" element={<CandidateApplications />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/schedule" element={<Scheduling />} />
          <Route path="/chat" element={<ChatInbox />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route element={<DashboardLayout sidebarLinks={companyLinks} user={mockCompanyUser} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/ats" element={<ATSBoard />} />
        </Route>

        <Route element={<DashboardLayout sidebarLinks={adminLinks} user={mockAdminUser} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
        </Route>
      </Routes>
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;