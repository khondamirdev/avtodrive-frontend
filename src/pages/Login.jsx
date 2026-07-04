import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/UI'
import styles from './Login.module.css'

export default function LoginPage() {
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { setError("Username va parol kiritilishi shart"); return }
    setLoading(true); setError('')
    try {
      const { data } = await authApi.login(form)
      login(data.token, data.role)
      navigate(data.role === 'SUPER_ADMIN' ? '/admins' : '/students/registered')
    } catch {
      setError("Username yoki parol noto'g'ri")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src="/logo.png" alt="AvtoDrive Pro" width="36" height="36" style={{ borderRadius: '50%' }} />
          <span className={styles.logoText}>AvtoDrive Pro</span>
        </div>
        <h1 className={styles.title}>Kirish</h1>
        <p className={styles.sub}>Tizimga kirish uchun ma'lumotlarni kiriting</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Username" name="username" value={form.username} onChange={handleChange} placeholder="username" autoComplete="username" />
          <Input label="Parol" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" loading={loading} full>Kirish</Button>
        </form>
      </div>
    </div>
  )
}
