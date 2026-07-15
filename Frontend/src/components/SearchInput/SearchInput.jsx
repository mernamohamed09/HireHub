import { Search } from 'lucide-react';
import styles from './SearchInput.module.css';

function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className={styles.wrapper}>
      <Search size={17} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}

export default SearchInput;
