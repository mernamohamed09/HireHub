import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchCurrentUser } from './store/slices/authSlice';

import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import ProtectedRoute from './components/protectedRoute';
import { SocketProvider } from './context/SocketContext';

const page = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));
const LandingPage = page(() => import('./pages/LandingPage'), 'LandingPage');
const ForCompanies = page(() => import('./pages/ForCompanies'), 'ForCompanies');
const ForCandidates = page(() => import('./pages/ForCandidates'), 'ForCandidates');
const LoginRegister = page(() => import('./pages/LoginRegister'), 'LoginRegister');
const BrowseJobs = page(() => import('./pages/BrowseJobs'), 'BrowseJobs');
const JobDetail = page(() => import('./pages/JobDetail'), 'JobDetail');
const Scheduling = page(() => import('./pages/Scheduling'), 'Scheduling');
const ChatInbox = page(() => import('./pages/ChatInbox'), 'ChatInbox');
const Notifications = page(() => import('./pages/Notifications'), 'Notifications');
const CandidateDashboard = page(() => import('./pages/candidate/Dashboard'), 'Dashboard');
const CandidateProfile = page(() => import('./pages/candidate/Profile'), 'Profile');
const CVManager = page(() => import('./pages/candidate/CVManager'), 'CVManager');
const CandidateApplications = page(() => import('./pages/candidate/MyApplications'), 'MyApplications');
const CandidateResultsList = page(() => import('./pages/candidate/ResultsList'), 'default');
const CompanyDashboard = page(() => import('./pages/company/Dashboard'), 'Dashboard');
const ATSBoard = page(() => import('./pages/company/ATSBoard'), 'ATSBoard');
const CompanyJobPosts = page(() => import('./pages/company/JobPosts'), 'JobPosts');
const CompanyProfile = page(() => import('./pages/company/Profile'), 'Profile');
const CompanyResultsList = page(() => import('./pages/company/ResultsList'), 'default');
const ApplicationResults = page(() => import('./pages/company/ApplicationResults'), 'default');
const AdminDashboard = page(() => import('./pages/admin/Dashboard'), 'Dashboard');
const AdminUsers = page(() => import('./pages/admin/Users'), 'Users');
const AdminCompanies = page(() => import('./pages/admin/Companies'), 'Companies');

const candidateLinks = [
  { path: '/candidate/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/jobs', icon: 'work', label: 'Browse Jobs' },
  { path: '/candidate/applications', icon: 'description', label: 'My Applications' },
  { path: '/candidate/results', icon: 'assessment', label: 'Assessment Results' },
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
  { path: '/company/results', icon: 'assessment', label: 'Assessment Results' },
  { path: '/company/profile', icon: 'business', label: 'Company Profile' },
  { path: '/schedule', icon: 'calendar_today', label: 'Schedule' },
  { path: '/chat', icon: 'chat', label: 'Chat' },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
];

const adminLinks = [
  { path: '/admin/dashboard', icon: 'dashboard', label: 'Overview' },
  { path: '/admin/users', icon: 'person', label: 'Users' },
  { path: '/admin/companies', icon: 'business', label: 'Companies' },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
];

function DashboardLayoutWrapper() {
  const { user } = useSelector((state) => state.auth);
  const sidebarUser = user
    ? {
        name: user.name,
        role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '',
        avatar: user.profileImage || '',
      }
    : null;

  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'company'
      ? companyLinks
      : candidateLinks;

  return <DashboardLayout sidebarLinks={links} user={sidebarUser} />;
}

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketProvider>
    <div className="dark bg-background min-h-screen text-on-surface">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/register" element={<LoginRegister />} />
        <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center text-xl">You do not have permission to view this page.</div>} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/companies" element={<ForCompanies />} />
          <Route path="/candidates" element={<ForCandidates />} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayoutWrapper /></ProtectedRoute>}>
          {/* Candidate-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['candidate']}><Outlet /></ProtectedRoute>}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/cv" element={<CVManager />} />
            <Route path="/candidate/applications" element={<CandidateApplications />} />
            <Route path="/candidate/results" element={<CandidateResultsList />} />
          </Route>

          {/* Company-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['company']}><Outlet /></ProtectedRoute>}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/ats" element={<ATSBoard />} />
            <Route path="/company/jobs" element={<CompanyJobPosts />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/results" element={<CompanyResultsList />} />
            <Route path="/company/applications/:applicationId/results" element={<ApplicationResults />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']}><Outlet /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
          </Route>

          {/* Shared routes for all authenticated users */}
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/schedule" element={<Scheduling />} />
          <Route path="/chat" element={<ChatInbox />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      <ToastContainer theme="dark" position="bottom-right" />
    </div>
    </SocketProvider>
  );
}

export default App;
