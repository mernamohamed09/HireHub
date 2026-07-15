import styles from './StatusBadge.module.css';

const STATUS_CLASS = {
  ACTIVE: styles.active,
  DRAFT: styles.draft,
  CLOSED: styles.closed,
};

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
