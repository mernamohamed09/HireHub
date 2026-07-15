import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/Button/Button';
import SearchInput from '../../components/SearchInput/SearchInput';
import Tabs from '../../components/Tabs/Tabs';
import JobsTable from '../../components/JobsTable/JobsTable';
import Pagination from '../../components/Pagination/Pagination';
import { jobsData, TABS_CONFIG } from '../../data/jobsData';
import styles from './JobPosts.module.css';
import './jobPostsTheme.css';

export function JobPosts() {
  const [jobs, setJobs] = useState(jobsData);
  const [activeTab, setActiveTab] = useState('All Posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const tabCounts = useMemo(
    () => ({
      'All Posts': jobs.length,
      Active: jobs.filter((j) => j.status === 'ACTIVE').length,
      Drafts: jobs.filter((j) => j.status === 'DRAFT').length,
      Closed: jobs.filter((j) => j.status === 'CLOSED').length,
    }),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    let list = jobs;
    if (activeTab === 'Active') list = list.filter((j) => j.status === 'ACTIVE');
    else if (activeTab === 'Drafts') list = list.filter((j) => j.status === 'DRAFT');
    else if (activeTab === 'Closed') list = list.filter((j) => j.status === 'CLOSED');

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (j) => j.title.toLowerCase().includes(q) || j.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobs, activeTab, searchTerm]);

  const handleAction = (action, job) => {
    if (action === 'delete') {
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      return;
    }
    if (action === 'publish' || action === 'reopen') {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: 'ACTIVE' } : j))
      );
      return;
    }
    // 'view', 'edit', 'report' -> hook up to navigation/modal as needed
    console.log(action, job);
  };

  return (
    <div className={`${styles.page} jobPostsTheme`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Job Posts</h1>
          <p className={styles.subtitle}>
            Manage your company's active recruitment and drafts.
          </p>
        </div>
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search job titles..."
          />
          <Button variant="primary" icon={Plus}>
            Post New Job
          </Button>
        </div>
      </div>

      <Tabs
        tabs={TABS_CONFIG.map((label) => ({
          label,
          count: label === 'All Posts' ? undefined : tabCounts[label],
        }))}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />

      <div className={styles.card}>
        <JobsTable jobs={filteredJobs} onAction={handleAction} />

        <div className={styles.footerRow}>
          <p className={styles.resultsText}>
            Showing {filteredJobs.length} of {jobs.length} job posts
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default JobPosts;


// JobPosts