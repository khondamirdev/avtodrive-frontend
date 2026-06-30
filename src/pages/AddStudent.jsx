import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentApi } from '../services/api'
import { Button, Input } from '../components/UI'
import styles from './AddStudent.module.css'

export default function AddStudentPage() {
  const [form, setForm]       = useState({ firstName: '', lastName: '', phoneNumber: '+998' })
  const [photo, setPhoto]   = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const err = {}
    if (!form.firstName.trim()) err.firstName = "Ism kiritilishi shart"
    if (!form.lastName.trim())  err.lastName  = "Familiya kiritilishi shart"
    if (form.phoneNumber && !/^\+998\d{9}$/.test(form.phoneNumber))
      err.phoneNumber = "Format: +998XXXXXXXXX"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    const fd = new FormData()
    fd.append('data', new Blob([JSON.stringify(form)], { type: 'application/json' }))
    if (photo) fd.append('photo', photo)

    try {
      await studentApi.create(fd)
      setSuccess(true)
      setTimeout(() => navigate('/students/registered'), 1500)
    } catch (err) {
      if (err.response?.data?.message?.includes('phone')) {
        setErrors({ phoneNumber: "Bu telefon raqam allaqachon ro'yxatda" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Orqaga
        </button>
        <h1 className={styles.title}>O'quvchi qo'shish</h1>
      </div>

      {success && (
        <div className={styles.successBanner}>
          ✓ O'quvchi muvaffaqiyatli qo'shildi. Yo'naltirilmoqda...
        </div>
      )}

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.photoSection}>
            <div className={styles.photoWrap} onClick={() => fileRef.current.click()}>
              {preview
                ? <img src={preview} alt="preview" className={styles.photoPreview} />
                : (
                  <div className={styles.photoPlaceholder}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Rasm yuklash</span>
                  </div>
                )
              }
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhoto}
              style={{ display: 'none' }}
            />
            <p className={styles.photoHint}>JPEG yoki PNG, max 5MB</p>
          </div>

          <div className={styles.fields}>
            <Input
              label="Ism"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Alisher"
              error={errors.firstName}
            />
            <Input
              label="Familiya"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Karimov"
              error={errors.lastName}
            />
            <Input
              label="Telefon raqam"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+998901234567"
              error={errors.phoneNumber}
            />
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={loading}>
              Saqlash
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
