import styles from './Tabs.module.css';

function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className={styles.tabs}>
      {tabs.map(({ label, count }) => (
        <button
          key={label}
          className={`${styles.tab} ${activeTab === label ? styles.tabActive : ''}`}
          onClick={() => onChange(label)}
        >
          {label}
          {typeof count === 'number' && <span className={styles.count}>{count}</span>}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
