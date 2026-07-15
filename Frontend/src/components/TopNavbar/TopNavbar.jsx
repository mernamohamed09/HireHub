import { Bell } from 'lucide-react';
import Button from '../Button/Button';
import styles from './TopNavbar.module.css';

const LINKS = [
  { label: 'Home' },
  { label: 'Browse Jobs', active: true },
  { label: 'For Companies' },
  { label: 'For Candidates' },
];

function TopNavbar() {
  return (
    <header className={styles.topbar}>
      <nav className={styles.links}>
        {LINKS.map(({ label, active }) => (
          <a
            key={label}
            href="#"
            className={`${styles.link} ${active ? styles.linkActive : ''}`}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={19} strokeWidth={2} />
          <span className={styles.dot} />
        </button>
        <Button variant="primary" size="sm">
          Join Now
        </Button>
      </div>
    </header>
  );
}

export default TopNavbar;
