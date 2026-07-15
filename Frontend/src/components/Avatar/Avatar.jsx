import styles from './Avatar.module.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function Avatar({ name, size = 36 }) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
