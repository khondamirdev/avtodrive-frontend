import { useState } from 'react'
import { adminApi } from '../services/api'
import { Button, Input } from '../components/UI'
import styles from './AddAdmin.module.css'

export default function AddAdminPage() {
  const [form, setForm]   = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [apiError, setApiError] = useState('')

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const err = {}
    if (!form.username.trim()) err.username = "Username kiritilishi shart"
    if (form.password.length < 6) err.password = "Parol kamida 6 ta belgi bo'lishi kerak"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      await adminApi.addAdmin(form)
      setSuccess(`"${form.username}" admini muvaffaqiyatli yaratildi`)
      setForm({ username: '', password: '' })
    } catch (err) {
      if (err.response?.status === 400) {
        setApiError("Bu username allaqachon mavjud")
      } else {
        setApiError("Xatolik yuz berdi. Qayta urinib ko'ring")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin qo'shish</h1>
        <p className={styles.sub}>Yangi admin uchun username va parol yarating</p>
      </div>

      <div className={styles.card}>
        {success && (
          <div className={styles.successBanner}>
            ✓ {success}
          </div>
        )}
        {apiError && (
          <div className={styles.errorBanner}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="admin_ali"
            error={errors.username}
            autoComplete="off"
          />
          <Input
            label="Parol"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Kamida 6 ta belgi"
            error={errors.password}
            autoComplete="new-password"
          />

          <div className={styles.hint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Yaratilgan admin o'quvchilarni qo'shishi, ko'rishi va o'chirishi mumkin
          </div>

          <Button type="submit" loading={loading}>
            Admin yaratish
          </Button>
        </form>
      </div>
    </div>
  )
}
