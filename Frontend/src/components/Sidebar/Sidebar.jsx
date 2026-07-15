import {
  LayoutGrid,
  Briefcase,
  FileText,
  User,
  MessageSquare,
  Bell,
  FolderOpen,
} from 'lucide-react';
import Avatar from '../Avatar/Avatar';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Browse Jobs', icon: Briefcase, active: true },
  { label: 'My Applications', icon: FileText },
  { label: 'Profile', icon: User },
  { label: 'Chat', icon: MessageSquare },
  { label: 'Notifications', icon: Bell },
  { label: 'CV Manager', icon: FolderOpen },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>H</span>
        <span className={styles.logoText}>HireHub</span>
      </div>

      <nav className={styles.nav}>
        <ul>
          {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <a
                href="#"
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.userSection}>
        <Avatar name="Sarah Ahmed" size={38} />
        <div className={styles.userInfo}>
          <p className={styles.userName}>Sarah Ahmed</p>
          <p className={styles.userRole}>Recruitment Lead</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
