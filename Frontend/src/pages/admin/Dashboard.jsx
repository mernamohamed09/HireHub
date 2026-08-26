import { useMemo, useState } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  FileDown,
  Check,
  Filter,
  MoreVertical,
} from 'lucide-react';
import SearchInput from '../../components/SearchInput/SearchInput';
import styles from './Dashboard.module.css';
import './dashboardTheme.css';

const STATS = [
  { id: 'users', label: 'Total Users', value: '3,240', delta: '+12%', trend: 'up', icon: 'users' },
  { id: 'companies', label: 'Companies', value: '186', delta: '+5%', trend: 'up', icon: 'building' },
  { id: 'jobs', label: 'Active Jobs', value: '412', delta: '+24', trend: 'up', icon: 'briefcase' },
  { id: 'applications', label: 'Applications', value: '58', delta: 'Today', trend: 'neutral', icon: 'fileText' },
  { id: 'flagged', label: 'Flagged', value: '3', delta: 'Action Needed', trend: 'danger', icon: 'alertTriangle' },
];

const WEEKLY_ACTIVITY = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 55 },
  { day: 'Wed', value: 48 },
  { day: 'Thu', value: 92 },
  { day: 'Fri', value: 60 },
  { day: 'Sat', value: 78 },
  { day: 'Sun', value: 35 },
];

const MONTHLY_ACTIVITY = [
  { day: 'W1', value: 58 },
  { day: 'W2', value: 71 },
  { day: 'W3', value: 64 },
  { day: 'W4', value: 89 },
];

const FLAGGED_REPORTS = [
  {
    id: 'r1',
    type: 'SPAM/SCAM',
    message: 'Job posting "Remote Junior Developer (Earn $500/hr)" has been flagged by 4 users.',
  },
  {
    id: 'r2',
    type: 'HARASSMENT',
    message: 'Candidate "M. Jordan" reported an inappropriate chat message from "Nexus HR".',
  },
  {
    id: 'r3',
    type: 'FAKE LISTING',
    message: 'Company "Vertex Solutions" posted a role that duplicates a listing removed last week.',
  },
];

const RECENT_USERS = [
  { id: 'u1', name: 'Elena Rodriguez', email: 'elena.r@example.com', role: 'CANDIDATE', status: 'active' },
  { id: 'u2', name: 'Mark Stevenson', email: 'm.stevenson@techcorp.io', role: 'COMPANY', status: 'active' },
  { id: 'u3', name: 'Ji-Su Park', email: 'jisu.park@design.co', role: 'CANDIDATE', status: 'inactive' },
  { id: 'u4', name: 'Omar Haddad', email: 'omar.haddad@nova.dev', role: 'CANDIDATE', status: 'active' },
  { id: 'u5', name: 'Priya Nair', email: 'priya.nair@brightpath.com', role: 'COMPANY', status: 'active' },
];

const STAT_ICONS = {
  users: Users,
  building: Building2,
  briefcase: Briefcase,
  fileText: FileText,
  alertTriangle: AlertTriangle,
};

const ROLE_FILTERS = ['ALL', 'CANDIDATE', 'COMPANY'];

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function DashboardHeaderActions() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerateReport = () => {
    if (generating) return;
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 2200);
    }, 1100);
  };

  return (
    <div className={styles.headerActions}>
      <button type="button" className={styles.iconButton} aria-label="Notifications">
        <Bell size={18} />
        <span className={styles.badge}>4</span>
      </button>

      <button
        type="button"
        className={styles.reportButton}
        onClick={handleGenerateReport}
        disabled={generating}
      >
        {generated ? (
          <>
            <Check size={16} />
            Report ready
          </>
        ) : (
          <>
            <FileDown size={16} />
            {generating ? 'Generating…' : 'Generate Report'}
          </>
        )}
      </button>
    </div>
  );
}

function StatCard({ label, value, delta, trend = 'neutral', icon }) {
  const Icon = STAT_ICONS[icon] ?? Users;
  const isDanger = trend === 'danger';

  return (
    <div className={`${styles.statCard} ${isDanger ? styles.statCardDanger : ''}`}>
      <div className={styles.statTop}>
        <div className={`${styles.statIconWrap} ${isDanger ? styles.statIconWrapDanger : ''}`}>
          <Icon size={17} strokeWidth={2} />
        </div>
        <span className={styles.statLabel}>{label}</span>
      </div>

      <div className={styles.statValue}>{value}</div>

      <div className={`${styles.statDelta} ${isDanger ? styles.statDeltaDanger : ''}`}>
        {trend === 'up' && <ArrowUpRight size={13} />}
        {trend === 'danger' && <AlertTriangle size={13} />}
        <span>{delta}</span>
      </div>
    </div>
  );
}

function PlatformActivity() {
  const [range, setRange] = useState('weekly');

  const dataset = range === 'weekly' ? WEEKLY_ACTIVITY : MONTHLY_ACTIVITY;
  const maxValue = useMemo(() => Math.max(...dataset.map((d) => d.value)), [dataset]);

  return (
    <div className={`${styles.panel} ${styles.panelFill}`}>
      <div className={styles.activityHeader}>
        <h2 className={styles.cardTitle}>Platform Activity</h2>

        <div className={styles.rangeToggle} role="tablist" aria-label="Activity range">
          {['weekly', 'monthly'].map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={range === option}
              className={`${styles.rangeBtn} ${range === option ? styles.rangeBtnActive : ''}`}
              onClick={() => setRange(option)}
            >
              {option === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chart}>
        {dataset.map(({ day, value }) => {
          const heightPct = Math.max((value / maxValue) * 100, 4);
          const isPeak = value === maxValue;
          return (
            <div key={day} className={styles.barGroup}>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.bar} ${isPeak ? styles.barPeak : ''}`}
                  style={{ height: `${heightPct}%` }}
                  title={`${day}: ${value}`}
                />
              </div>
              <span className={styles.barLabel}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlaggedContent() {
  const [reports, setReports] = useState(FLAGGED_REPORTS);

  const handleDismiss = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReview = (id) => {
    // Hook up to a review/detail route or modal here.
    console.log('Review report', id);
  };

  return (
    <div className={`${styles.panel} ${styles.panelFill}`}>
      <div className={styles.flaggedHeader}>
        <h2 className={styles.cardTitle}>Flagged Content</h2>
        <span className={styles.countBadge}>{reports.length} Reports</span>
      </div>

      <div className={styles.flaggedList}>
        {reports.length === 0 && (
          <p className={styles.flaggedEmpty}>No flagged reports right now.</p>
        )}

        {reports.map((report) => (
          <div key={report.id} className={styles.flaggedItem}>
            <div className={styles.flaggedItemHeader}>
              <AlertTriangle size={14} className={styles.flaggedItemIcon} />
              <span className={styles.flaggedItemType}>{report.type}</span>
            </div>
            <p className={styles.flaggedItemMessage}>{report.message}</p>
            <div className={styles.flaggedItemActions}>
              <button type="button" className={styles.reviewBtn} onClick={() => handleReview(report.id)}>
                Review
              </button>
              <button type="button" className={styles.dismissBtn} onClick={() => handleDismiss(report.id)}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentUsers() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [filterOpen, setFilterOpen] = useState(false);
  const [users, setUsers] = useState(
    RECENT_USERS.map((u) => ({ ...u, active: u.status === 'active' }))
  );

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const toggleStatus = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.usersHeader}>
        <h2 className={styles.cardTitle}>Recent User Registrations</h2>

        <div className={styles.usersControls}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search users" />

          <div className={styles.filterWrap}>
            <button type="button" className={styles.filterBtn} onClick={() => setFilterOpen((v) => !v)}>
              <Filter size={14} />
              Filter
            </button>

            {filterOpen && (
              <div className={styles.filterMenu}>
                {ROLE_FILTERS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`${styles.filterOption} ${roleFilter === role ? styles.filterOptionActive : ''}`}
                    onClick={() => {
                      setRoleFilter(role);
                      setFilterOpen(false);
                    }}
                  >
                    {role === 'ALL' ? 'All roles' : role.charAt(0) + role.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{initials(user.name)}</div>
                    <span className={styles.userName}>{user.name}</span>
                  </div>
                </td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>
                  <span
                    className={`${styles.roleBadge} ${
                      user.role === 'COMPANY' ? styles.roleCompany : styles.roleCandidate
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles.statusCell}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={user.active}
                      aria-label={user.active ? 'Active' : 'Inactive'}
                      className={`${styles.statusSwitch} ${user.active ? styles.statusSwitchOn : ''}`}
                      onClick={() => toggleStatus(user.id)}
                    >
                      <span className={styles.switchThumb} />
                    </button>
                    <span className={styles.statusLabel}>{user.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td>
                  <button type="button" className={styles.moreBtn} aria-label="More actions">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className={`${styles.page} dashboardTheme`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Overview</h1>
          <p className={styles.subtitle}>Real-time system performance and user activity.</p>
        </div>
        <DashboardHeaderActions />
      </div>

      <section className={styles.statsRow}>
        {STATS.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </section>

      <section className={styles.midRow}>
        <div className={styles.activityCol}>
          <PlatformActivity />
        </div>
        <div className={styles.flaggedCol}>
          <FlaggedContent />
        </div>
      </section>

      <section>
        <RecentUsers />
      </section>
    </div>
  );
}

export default Dashboard;
