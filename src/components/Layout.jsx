import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Layout.module.css'

const mainNavItems = [
  {
    to: '/students/registered',
    label: "Ro'yxatdagilar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/students/studying',
    label: "O'qiyotganlar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
]

const addStudentItem = {
  to: '/students/add',
  label: "O'quvchi qo'shish",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
}

const superAdminNavItems = [
  {
    to: '/admin/add',
    label: 'Admin qo\'shish',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
]

const profileIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function Layout({ children }) {
  const { role } = useAuth()
  const navigate = useNavigate()

  // Desktop sidebar items: all nav + add student + admin (if super)
  const sidebarItems = role === 'SUPER_ADMIN'
    ? [...mainNavItems, addStudentItem, ...superAdminNavItems]
    : [...mainNavItems, addStudentItem]

  return (
    <div className={styles.root}>
      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="AvtoDrive Pro" width="28" height="28" style={{ borderRadius: '50%' }} />
          <span className={styles.logoText}>AvtoDrive Pro</span>
        </div>

        <nav className={styles.nav}>
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.roleTag}>
            {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.navItem} ${styles.profileLink} ${isActive ? styles.active : ''}`
            }
          >
            {profileIcon}
            <span>Profil</span>
          </NavLink>
        </div>
      </aside>

      {/* ═══ MOBILE HEADER ═══ */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderTop}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="AvtoDrive Pro" width="26" height="26" style={{ borderRadius: '50%' }} />
            <span className={styles.logoText}>AvtoDrive Pro</span>
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.profileBtn} ${isActive ? styles.profileBtnActive : ''}`
            }
          >
            {profileIcon}
          </NavLink>
        </div>
        <nav className={styles.mobileTabs}>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `${styles.mobileTab} ${isActive ? styles.mobileTabActive : ''}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className={styles.main}>{children}</main>

      {/* ═══ FAB — O'quvchi qo'shish (mobile only) ═══ */}
      <button
        className={styles.fab}
        onClick={() => navigate('/students/add')}
        title="O'quvchi qo'shish"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
