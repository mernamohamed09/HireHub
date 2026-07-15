import styles from './Footer.module.css';

const LINK_GROUPS = ['Quick Links', 'Resources', 'Contact', 'Privacy Policy'];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <p className={styles.brand}>HireHub</p>
        <p className={styles.copyright}>© 2024 HireHub. All rights reserved.</p>
      </div>
      <nav className={styles.links}>
        {LINK_GROUPS.map((label) => (
          <a key={label} href="#" className={styles.link}>
            {label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

export default Footer;
