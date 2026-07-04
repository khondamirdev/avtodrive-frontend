import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { studentApi } from '../services/api'
import { Button, Input, Spinner } from '../components/UI'
import styles from './AddStudent.module.css'

export default function EditStudentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', totalAmount: '' })
  const [passportPhoto, setPassportPhoto] = useState(null)
  const [form083, setForm083]   = useState(null)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const passportRef = useRef()
  const form083Ref  = useRef()

  useEffect(() => {
    studentApi.getOne(id).then(({ data }) => {
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || '+998',
        totalAmount: data.totalAmount?.toString() || '',
      })
    }).finally(() => setFetching(false))
  }, [id])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const err = {}
    if (!form.firstName.trim()) err.firstName = "Ism kiritilishi shart"
    if (!form.lastName.trim())  err.lastName  = "Familiya kiritilishi shart"
    const phone = form.phoneNumber?.trim()
    if (phone && phone !== '+998' && !/^\+998\d{9}$/.test(phone))
      err.phoneNumber = "Format: +998XXXXXXXXX"
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({}); setLoading(true)

    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      phoneNumber: form.phoneNumber && form.phoneNumber !== '+998' ? form.phoneNumber : null,
      totalAmount: form.totalAmount ? Number(form.totalAmount) : 0,
    }

    const fd = new FormData()
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (passportPhoto) fd.append('passportPhoto', passportPhoto)
    if (form083)       fd.append('form083', form083)

    try {
      await studentApi.update(id, fd)
      navigate(`/students/${id}`)
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('phone')) {
        setErrors({ phoneNumber: "Bu telefon raqam allaqachon ro'yxatda" })
      } else {
        setErrors({ form: "Xatolik yuz berdi" })
      }
    } finally { setLoading(false) }
  }

  if (fetching) return <Spinner />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className={styles.title}>O'quvchini tahrirlash</h1>
      </div>

      {errors.form && <div className={styles.errorBanner}>{errors.form}</div>}

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Ism" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />
          <Input label="Familiya" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />
          <Input label="Telefon (ixtiyoriy)" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+998901234567" error={errors.phoneNumber} />
          <Input label="Kelishilgan narx (so'm)" name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} placeholder="5000000" />

          <div className={styles.fileSection}>
            <label className={styles.fileLabel}>Pasport rasmi (yangilash)</label>
            <div className={styles.fileRow}>
              <button type="button" className={styles.fileBtn} onClick={() => passportRef.current.click()}>
                {passportPhoto ? `✓ ${passportPhoto.name}` : '+ Yangi fayl'}
              </button>
              {passportPhoto && <button type="button" className={styles.fileRemove} onClick={() => setPassportPhoto(null)}>✕</button>}
            </div>
            <input ref={passportRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => setPassportPhoto(e.target.files[0])} />
          </div>

          <div className={styles.fileSection}>
            <label className={styles.fileLabel}>083 forma (yangilash)</label>
            <div className={styles.fileRow}>
              <button type="button" className={styles.fileBtn} onClick={() => form083Ref.current.click()}>
                {form083 ? `✓ ${form083.name}` : '+ Yangi fayl'}
              </button>
              {form083 && <button type="button" className={styles.fileRemove} onClick={() => setForm083(null)}>✕</button>}
            </div>
            <input ref={form083Ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => setForm083(e.target.files[0])} />
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Bekor qilish</Button>
            <Button type="submit" loading={loading}>Saqlash</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
