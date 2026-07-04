import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { Button, Avatar, Spinner, EmptyState, Modal, Input } from '../components/UI'
import styles from './Admins.module.css'

export default function AdminsPage() {
  const [admins, setAdmins]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [addModal, setAddModal] = useState(false)
  const [form, setForm]         = useState({ username: '', password: '' })
  const [errors, setErrors]     = useState({})
  const [addLoading, setAddLoading] = useState(false)
  const [success, setSuccess]   = useState('')
  const navigate = useNavigate()

  const fetchAdmins = async () => {
    try {
      const { data } = await adminApi.getAllAdmins()
      setAdmins(data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.username.trim()) err.username = "Username kiritilishi shart"
    if (form.password.length < 6) err.password = "Kamida 6 ta belgi"
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({}); setAddLoading(true)
    try {
      await adminApi.addAdmin(form)
      setSuccess(`"${form.username}" admini yaratildi`)
      setForm({ username: '', password: '' })
      fetchAdmins()
      setTimeout(() => { setAddModal(false); setSuccess('') }, 1500)
    } catch (err) {
      if (err.response?.status === 400) setErrors({ username: "Bu username allaqachon mavjud" })
      else setErrors({ form: "Xatolik yuz berdi" })
    } finally { setAddLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Adminlar</h1>
        <Button size="sm" onClick={() => setAddModal(true)}>+ Admin qo'shish</Button>
      </div>

      {loading ? <Spinner /> : admins.length === 0 ? (
        <EmptyState message="Adminlar topilmadi" />
      ) : (
        <div className={styles.list}>
          {admins.map((a) => (
            <div key={a.id} className={styles.item} onClick={() => navigate(`/admins/${a.id}/students`)}>
              <Avatar firstName={a.username} lastName="" size={40} />
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{a.username}</p>
                <p className={styles.itemSub}>{a.studentCount} ta o'quvchi</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {addModal && (
        <Modal title="Admin qo'shish" onClose={() => { setAddModal(false); setSuccess(''); setErrors({}) }}>
          {success ? (
            <div className={styles.success}>✓ {success}</div>
          ) : (
            <form onSubmit={handleAdd} className={styles.form}>
              {errors.form && <div className={styles.error}>{errors.form}</div>}
              <Input label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} error={errors.username} autoComplete="off" />
              <Input label="Parol" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} autoComplete="new-password" hint="Kamida 6 ta belgi" />
              <div className={styles.modalActions}>
                <Button type="button" variant="secondary" onClick={() => setAddModal(false)}>Bekor qilish</Button>
                <Button type="submit" loading={addLoading}>Yaratish</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
