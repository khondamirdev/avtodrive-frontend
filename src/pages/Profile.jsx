import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authApi, profileApi } from '../services/api'
import { Button, Input } from '../components/UI'
import styles from './Profile.module.css'

export default function ProfilePage() {
  const { role, username, login, logout } = useAuth()
  const navigate = useNavigate()

  // Fetch real profile on load
  const [profile, setProfile] = useState({ username: username || '' })

  useEffect(() => {
    profileApi.getProfile()
      .then(res => {
        setProfile(res.data)
        // update local context with fresh username
        login(localStorage.getItem('token'), res.data.role, res.data.username)
      })
      .catch(console.error)
  }, [])

  // ─── Login (Username) o'zgartirish ───
  const [userForm, setUserForm] = useState({ username: profile.username || username || '' })
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')
  const [userLoading, setUserLoading] = useState(false)

  // update the form if profile loaded
  useEffect(() => {
    setUserForm({ username: profile.username || username || '' })
  }, [profile.username, username])

  const handleUserChange = (e) =>
    setUserForm({ username: e.target.value })

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setUserError('')
    setUserSuccess('')

    if (!userForm.username) {
      setUserError("Login (username) bo'sh bo'lishi mumkin emas")
      return
    }

    setUserLoading(true)
    try {
      await profileApi.changeUsername({ username: userForm.username })
      setUserSuccess("Login muvaffaqiyatli o'zgartirildi")
      // Update local storage and context
      login(localStorage.getItem('token'), role, userForm.username)
      setProfile((prev) => ({ ...prev, username: userForm.username }))
    } catch (err) {
      if (err.response?.status === 409) {
        setUserError("Bu login (username) band")
      } else {
        setUserError("Xatolik yuz berdi. Qayta urinib ko'ring")
      }
    } finally {
      setUserLoading(false)
    }
  }

  // ─── Parol o'zgartirish ───
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [pwError, setPwError]     = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handlePwChange = (e) =>
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError("Barcha maydonlarni to'ldiring")
      return
    }
    if (pwForm.newPassword.length < 4) {
      setPwError("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak")
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Yangi parollar mos kelmadi")
      return
    }

    setPwLoading(true)
    try {
      await profileApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwSuccess("Parol muvaffaqiyatli o'zgartirildi")
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        setPwError("Joriy parol noto'g'ri")
      } else {
        setPwError("Xatolik yuz berdi. Qayta urinib ko'ring")
      }
    } finally {
      setPwLoading(false)
    }
  }

  // ─── Chiqish ───
  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  const roleLabel = role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Orqaga
        </button>
        <h1 className={styles.title}>Profil</h1>
      </div>

      {/* ═══ Profil ma'lumotlari ═══ */}
      <div className={styles.card}>
        <div className={styles.profileTop}>
          <div className={styles.avatar}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.username}>{profile.username}</p>
            <span className={styles.roleBadge}>{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* ═══ Loginni o'zgartirish ═══ */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Loginni (Username) o'zgartirish
        </h2>
        <form onSubmit={handleUserSubmit} className={styles.form}>
          <Input
            label="Yangi login"
            name="username"
            type="text"
            value={userForm.username}
            onChange={handleUserChange}
            placeholder="Yangi username"
            autoComplete="username"
          />
          {userError && <p className={styles.error}>{userError}</p>}
          {userSuccess && <p className={styles.success}>{userSuccess}</p>}
          <Button type="submit" loading={userLoading}>
            Loginni o'zgartirish
          </Button>
        </form>
      </div>

      {/* ═══ Parol o'zgartirish ═══ */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Parolni o'zgartirish
        </h2>
        <form onSubmit={handlePwSubmit} className={styles.form}>
          <Input
            label="Joriy parol"
            name="currentPassword"
            type="password"
            value={pwForm.currentPassword}
            onChange={handlePwChange}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Input
            label="Yangi parol"
            name="newPassword"
            type="password"
            value={pwForm.newPassword}
            onChange={handlePwChange}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <Input
            label="Yangi parolni tasdiqlang"
            name="confirmPassword"
            type="password"
            value={pwForm.confirmPassword}
            onChange={handlePwChange}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {pwError && <p className={styles.error}>{pwError}</p>}
          {pwSuccess && <p className={styles.success}>{pwSuccess}</p>}
          <Button type="submit" loading={pwLoading}>
            Parolni o'zgartirish
          </Button>
        </form>
      </div>

      {/* ═══ Admin qo'shish (SUPER_ADMIN only) ═══ */}
      {role === 'SUPER_ADMIN' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Boshqaruv
          </h2>
          <button className={styles.menuItem} onClick={() => navigate('/admin/add')}>
            <span>Admin qo'shish</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* ═══ Chiqish ═══ */}
      <div className={styles.card}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Tizimdan chiqish
        </button>
      </div>
    </div>
  )
}
