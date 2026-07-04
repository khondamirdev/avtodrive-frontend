import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentApi, paymentApi, fileUrl } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Button, Badge, Avatar, Spinner, Modal, Input } from '../components/UI'
import styles from './StudentDetail.module.css'

function formatMoney(n) {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' so\'m'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const isSuperAdmin = role === 'SUPER_ADMIN'

  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [paymentModal, setPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', note: '' })
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const [statusModal, setStatusModal] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [deletePaymentId, setDeletePaymentId] = useState(null)
  const [deletePaymentLoading, setDeletePaymentLoading] = useState(false)

  const fetchAll = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        studentApi.getOne(id),
        paymentApi.getAll(id),
      ])
      setStudent(sRes.data)
      setPayments(pRes.data)
    } catch { navigate(-1) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleAddPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setPaymentError("Summa noto'g'ri"); return
    }
    setPaymentLoading(true); setPaymentError('')
    try {
      await paymentApi.add(id, { amount: Number(paymentForm.amount), note: paymentForm.note || null })
      setPaymentModal(false)
      setPaymentForm({ amount: '', note: '' })
      fetchAll()
    } catch { setPaymentError('Xatolik yuz berdi') }
    finally { setPaymentLoading(false) }
  }

  const handleStatusChange = async () => {
    setStatusLoading(true)
    try {
      const next = student.status === 'REGISTERED' ? 'STUDYING' : 'REGISTERED'
      await studentApi.updateStatus(id, next)
      setStatusModal(false)
      fetchAll()
    } finally { setStatusLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await studentApi.delete(id)
      navigate(-1)
    } finally { setDeleteLoading(false) }
  }

  const handleDeletePayment = async () => {
    setDeletePaymentLoading(true)
    try {
      await paymentApi.delete(id, deletePaymentId)
      setDeletePaymentId(null)
      fetchAll()
    } finally { setDeletePaymentLoading(false) }
  }

  if (loading) return <Spinner />
  if (!student) return null

  const remaining = student.remainingAmount

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className={styles.title}>O'quvchi ma'lumotlari</h1>
      </div>

      {/* Profile card */}
      <div className={styles.card}>
        <div className={styles.profileRow}>
          <Avatar firstName={student.firstName} lastName={student.lastName} size={56} />
          <div>
            <p className={styles.name}>{student.firstName} {student.lastName}</p>
            {student.phoneNumber && <p className={styles.phone}>{student.phoneNumber}</p>}
            <div className={styles.badgeRow}>
              <Badge variant={student.status === 'REGISTERED' ? 'registered' : 'studying'}>
                {student.status === 'REGISTERED' ? "Ro'yxatda" : "O'qiyotgan"}
              </Badge>
            </div>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Admin</span>
            <span className={styles.infoValue}>{student.createdByUsername}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Qo'shilgan sana</span>
            <span className={styles.infoValue}>{formatDate(student.createdDate)}</span>
          </div>
        </div>

        <div className={styles.actions}>
          {isSuperAdmin && (
            <Button size="sm" variant="secondary" onClick={() => setStatusModal(true)}>
              {student.status === 'REGISTERED' ? "O'qishni boshlash" : "Ro'yxatga qaytarish"}
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => navigate(`/students/${id}/edit`)}>
            Tahrirlash
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteModal(true)}>
            O'chirish
          </Button>
        </div>
      </div>

      {/* Payment summary */}
      <div className={styles.paymentSummary}>
        <div className={styles.paymentSummaryItem}>
          <span className={styles.paymentSummaryLabel}>Umumiy summa</span>
          <span className={styles.paymentSummaryValue}>{formatMoney(student.totalAmount)}</span>
        </div>
        <div className={styles.paymentSummaryItem}>
          <span className={styles.paymentSummaryLabel}>To'langan</span>
          <span className={`${styles.paymentSummaryValue} ${styles.paid}`}>{formatMoney(student.paidAmount)}</span>
        </div>
        <div className={styles.paymentSummaryItem}>
          <span className={styles.paymentSummaryLabel}>Qolgan</span>
          <span className={`${styles.paymentSummaryValue} ${remaining > 0 ? styles.remaining : styles.paid}`}>
            {formatMoney(remaining)}
          </span>
        </div>
      </div>

      {/* Payments */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>To'lov tarixi</h2>
          <Button size="sm" onClick={() => setPaymentModal(true)}>+ To'lov</Button>
        </div>

        {payments.length === 0 ? (
          <p className={styles.noPayments}>To'lovlar mavjud emas</p>
        ) : (
          <div className={styles.paymentList}>
            {payments.map((p) => (
              <div key={p.id} className={styles.paymentItem}>
                <div className={styles.paymentLeft}>
                  <span className={styles.paymentAmount}>{formatMoney(p.amount)}</span>
                  {p.note && <span className={styles.paymentNote}>{p.note}</span>}
                </div>
                <div className={styles.paymentRight}>
                  <span className={styles.paymentDate}>{formatDate(p.createdDate)}</span>
                  <button className={styles.deletePaymentBtn} onClick={() => setDeletePaymentId(p.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Fayllar</h2>
        <div className={styles.fileList}>
          <FileItem label="Pasport rasmi" url={fileUrl(student.passportPhotoUrl)} />
          <FileItem label="083 forma" url={fileUrl(student.form083Url)} />
        </div>
      </div>

      {/* Add payment modal */}
      {paymentModal && (
        <Modal title="To'lov qo'shish" onClose={() => { setPaymentModal(false); setPaymentError('') }}>
          <form onSubmit={handleAddPayment} className={styles.paymentForm}>
            <Input
              label="Summa (so'm)"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="1000000"
            />
            <Input
              label="Izoh (ixtiyoriy)"
              value={paymentForm.note}
              onChange={(e) => setPaymentForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Naqd to'lov"
            />
            {paymentError && <p className={styles.error}>{paymentError}</p>}
            <div className={styles.modalActions}>
              <Button type="button" variant="secondary" onClick={() => setPaymentModal(false)}>Bekor qilish</Button>
              <Button type="submit" loading={paymentLoading}>Saqlash</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status modal */}
      {statusModal && (
        <Modal title="Statusni o'zgartirish" onClose={() => setStatusModal(false)}>
          <p className={styles.confirmText}>
            {student.firstName} {student.lastName} ni{' '}
            {student.status === 'REGISTERED' ? '"O\'qiyotgan"' : '"Ro\'yxatda"'} statusiga
            o'tkazishni tasdiqlaysizmi?
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setStatusModal(false)}>Bekor qilish</Button>
            <Button loading={statusLoading} onClick={handleStatusChange}>Tasdiqlash</Button>
          </div>
        </Modal>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <Modal title="O'quvchini o'chirish" onClose={() => setDeleteModal(false)}>
          <p className={styles.confirmText}>O'quvchini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setDeleteModal(false)}>Bekor qilish</Button>
            <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>O'chirish</Button>
          </div>
        </Modal>
      )}

      {/* Delete payment modal */}
      {deletePaymentId && (
        <Modal title="To'lovni o'chirish" onClose={() => setDeletePaymentId(null)}>
          <p className={styles.confirmText}>Bu to'lovni o'chirishni tasdiqlaysizmi?</p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setDeletePaymentId(null)}>Bekor qilish</Button>
            <Button variant="danger" loading={deletePaymentLoading} onClick={handleDeletePayment}>O'chirish</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FileItem({ label, url }) {
  if (!url) {
    return (
      <div className={styles.fileItem}>
        <span className={styles.fileLabel}>{label}</span>
        <span className={styles.fileEmpty}>Yuklanmagan</span>
      </div>
    )
  }
  const isPdf = url.endsWith('.pdf')
  return (
    <div className={styles.fileItem}>
      <span className={styles.fileLabel}>{label}</span>
      <a href={url} target="_blank" rel="noreferrer" className={styles.fileLink}>
        {isPdf ? '📄 Ko\'rish' : '🖼️ Ko\'rish'}
      </a>
    </div>
  )
}
