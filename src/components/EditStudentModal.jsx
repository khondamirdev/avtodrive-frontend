import { useState, useRef } from 'react'
import { studentApi } from '../services/api'
import { Button, Input, Modal } from './UI'
import styles from '../pages/AddStudent.module.css'

export default function EditStudentModal({ student, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: student.firstName ?? '',
    lastName: student.lastName ?? '',
    phoneNumber: student.phoneNumber ?? '',
  })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(
      student.photoUrl ? `http://localhost:8081/${student.photoUrl}` : null
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

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
    if (!form.lastName.trim()) err.lastName = "Familiya kiritilishi shart"
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
      await studentApi.update(student.id, fd)
      onSaved()
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('phone')) {
        setErrors({ phoneNumber: "Bu telefon raqam allaqachon ro'yxatda" })
      } else {
        setErrors({ form: msg || "Xatolik yuz berdi. Qayta urinib ko'ring" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
      <Modal title="O'quvchini tahrirlash" onClose={onClose}>
        {errors.form && (
            <div style={{
              background: 'var(--red-50)', color: 'var(--red-700)',
              borderRadius: 'var(--radius)', padding: '10px 14px',
              fontSize: 13, marginBottom: 16,
            }}>
              {errors.form}
            </div>
        )}

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
                error={errors.firstName}
            />
            <Input
                label="Familiya"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
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
            <Button type="button" variant="secondary" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={loading}>
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>
  )
}