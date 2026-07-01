import { DashboardHeader } from '../../components/layout/DashboardHeader';
import { Button } from '../../components/ui/Button';

export function Users() {
  return (
    <>
      <DashboardHeader />
      <div className="w-full px-md md:px-lg max-w-6xl mx-auto space-y-lg py-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-h2 text-h2 text-on-surface">Manage Candidates</h1>
            <p className="text-on-surface-variant mt-sm">View and manage all registered candidates in the system.</p>
          </div>
          <Button variant="primary" className="hidden md:flex">Export Data</Button>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant p-xl flex flex-col items-center justify-center text-center min-h-[400px]">
          <span className="material-symbols-outlined text-[64px] text-outline mb-md">person_search</span>
          <h3 className="font-h3 text-h3 text-on-surface mb-sm">Candidate Management</h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            This module was not included in the original design system screens. 
            Once the API is connected, a data table will be populated here to list all users, view their resumes, and manage their account status.
          </p>
          <Button variant="outline" className="mt-lg">Refresh Data</Button>
        </div>
      </div>
    </>
  );
}
