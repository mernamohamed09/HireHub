import styles from './Button.module.css';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 15 : 17} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

export default Button;
