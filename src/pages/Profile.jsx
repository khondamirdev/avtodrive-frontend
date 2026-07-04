import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi, authApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Spinner } from '../components/UI'
import styles from './Profile.module.css'

export default function ProfilePage() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [form, setForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    profileApi.getProfile()
      .then(({ data }) => setProfile(data))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const err = {}
    if (!form.currentPassword) err.currentPassword = "Joriy parol kiritilishi shart"
    if (form.newPassword.length < 6) err.newPassword = "Kamida 6 ta belgi"
    if (form.newPassword !== form.confirmPassword) err.confirmPassword = "Parollar mos emas"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({}); setSaving(true)
    try {
      await profileApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors({ currentPassword: "Joriy parol noto'g'ri" })
      } else {
        setErrors({ form: "Xatolik yuz berdi" })
      }
    } finally { setSaving(false) }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  if (loading) return <Spinner />

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profil</h1>

      {/* Info card */}
      <div className={styles.card}>
        <div className={styles.avatarRow}>
          <div className={styles.avatarCircle}>
            {profile?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className={styles.username}>{profile?.username}</p>
            <span className={styles.roleBadge}>
              {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Parolni o'zgartirish</h2>
        {success && <div className={styles.successBanner}>✓ Parol muvaffaqiyatli o'zgartirildi</div>}
        {errors.form && <div className={styles.errorBanner}>{errors.form}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Joriy parol"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            autoComplete="current-password"
          />
          <Input
            label="Yangi parol"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            hint="Kamida 6 ta belgi"
            autoComplete="new-password"
          />
          <Input
            label="Yangi parolni tasdiqlang"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" loading={saving} full>Saqlash</Button>
        </form>
      </div>

      {/* Logout */}
      <div className={styles.card}>
        <Button variant="danger" full onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Tizimdan chiqish
        </Button>
      </div>
    </div>
  )
}
