import styles from './UI.module.css'

export function Button({ children, variant = 'primary', size = 'md', loading, ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>
}

export function Avatar({ firstName, lastName, photoUrl, size = 40 }) {
  if (photoUrl) {
    return (
      <img
        src={`http://localhost:8081/${photoUrl}`}
        alt={`${firstName} ${lastName}`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--blue-100)', color: 'var(--blue-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 500, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

export function Spinner() {
  return <div className={styles.pageSpinner} />
}

export function EmptyState({ message = "Ma'lumot topilmadi" }) {
  return (
    <div className={styles.empty}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <p>{message}</p>
    </div>
  )
}

export function Modal({ title, children, onClose }) {
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ←
      </button>
      <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
      <button
        className={styles.pageBtn}
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        →
      </button>
    </div>
  )
}
