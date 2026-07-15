import {
  Briefcase,
  Server,
  PenTool,
  Code2,
  Rocket,
  TrendingUp,
  TrendingDown,
  Eye,
  Pencil,
  MoreVertical,
  Wifi,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import styles from './JobsTable.module.css';

const ICONS = {
  product: { Icon: Briefcase, className: styles.iconBlue },
  devops: { Icon: Server, className: styles.iconIndigo },
  design: { Icon: PenTool, className: styles.iconTeal },
  backend: { Icon: Code2, className: styles.iconBlue },
  marketing: { Icon: Rocket, className: styles.iconRed },
};

function RoleCell({ job }) {
  const { Icon, className } = ICONS[job.iconKey] || ICONS.product;
  return (
    <div className={styles.roleCell}>
      <div className={`${styles.roleIcon} ${className}`}>
        <Icon size={19} strokeWidth={2} />
      </div>
      <div>
        <p className={styles.roleTitle}>{job.title}</p>
        <p className={styles.roleCategory}>{job.category}</p>
      </div>
    </div>
  );
}

function TrendTag({ trend }) {
  if (!trend) return null;
  const isUp = trend.direction === 'up';
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span className={`${styles.trend} ${isUp ? styles.trendUp : styles.trendDown}`}>
      <Icon size={13} />
      {trend.value}%
    </span>
  );
}

function RowActions({ job, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.actions}>
      {job.status === 'DRAFT' ? (
        <button
          className={styles.actionButton}
          title="Publish"
          onClick={() => onAction('publish', job)}
        >
          <Wifi size={17} />
        </button>
      ) : job.status === 'CLOSED' ? (
        <button
          className={styles.actionButton}
          title="View report"
          onClick={() => onAction('report', job)}
        >
          <BarChart3 size={17} />
        </button>
      ) : (
        <button
          className={styles.actionButton}
          title="View applicants"
          onClick={() => onAction('view', job)}
        >
          <Eye size={17} />
        </button>
      )}

      {job.status === 'CLOSED' ? (
        <button
          className={styles.actionButton}
          title="Reopen"
          onClick={() => onAction('reopen', job)}
        >
          <RefreshCw size={17} />
        </button>
      ) : (
        <button
          className={styles.actionButton}
          title="Edit"
          onClick={() => onAction('edit', job)}
        >
          <Pencil size={17} />
        </button>
      )}

      <div className={styles.menuWrapper}>
        <button
          className={styles.actionButton}
          title="More"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          <MoreVertical size={17} />
        </button>

        {menuOpen && (
          <div className={styles.menu}>
            <button
              className={styles.menuItem}
              onClick={() => {
                setMenuOpen(false);
                onAction('delete', job);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function JobsTable({ jobs, onAction }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Role Title</th>
            <th>Applicants</th>
            <th>Date Posted</th>
            <th>Status</th>
            <th className={styles.actionsHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <RoleCell job={job} />
              </td>
              <td>
                <div className={styles.applicantsCell}>
                  <span>{job.applicants}</span>
                  <TrendTag trend={job.trend} />
                </div>
              </td>
              <td className={styles.dateCell}>{job.datePosted}</td>
              <td>
                <StatusBadge status={job.status} />
                {job.expiringSoon && (
                  <p className={styles.expiring}>Expiring soon</p>
                )}
              </td>
              <td>
                <RowActions job={job} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobsTable;
