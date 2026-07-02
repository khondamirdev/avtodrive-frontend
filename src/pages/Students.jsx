import { useState, useEffect, useCallback } from 'react'
import { studentApi } from '../services/api'
import { Button, Badge, Avatar, Spinner, EmptyState, Pagination, Modal } from '../components/UI'
import EditStudentModal from '../components/EditStudentModal'
import styles from './Students.module.css'

export default function StudentsPage({ status }) {
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch]         = useState({ firstName: '', lastName: '' })
  const [searchInput, setSearchInput] = useState('')
  const [deleting, setDeleting]     = useState(null)
  const [confirmId, setConfirmId]   = useState(null)
  const [statusLoading, setStatusLoading] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [statusConfirmStudent, setStatusConfirmStudent] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (search.firstName || search.lastName) {
        res = await studentApi.search(search.firstName, search.lastName, page)
      } else {
        res = await studentApi.getAll(status, page)
      }
      setStudents(res.data.content ?? [])
      setTotalPages(res.data.totalPages ?? 0)
    } catch {
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [status, page, search])

  useEffect(() => {
    setPage(0)
    setSearch({ firstName: '', lastName: '' })
    setSearchInput('')
  }, [status])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    const parts = searchInput.trim().split(/\s+/)
    setSearch({ 
       firstName: parts[0] || '', 
       lastName: parts.slice(1).join(' ') || '' 
    })
  }

  const handleStatusConfirm = async () => {
    if (!statusConfirmStudent) return
    const student = statusConfirmStudent
    const next = student.status === 'REGISTERED' ? 'STUDYING' : 'REGISTERED'
    setStatusLoading(student.id)
    try {
      await studentApi.updateStatus(student.id, next)
      setStatusConfirmStudent(null)
      fetchStudents()
    } finally {
      setStatusLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(confirmId)
    try {
      await studentApi.delete(confirmId)
      setConfirmId(null)
      fetchStudents()
    } finally {
      setDeleting(null)
    }
  }

  const title = status === 'REGISTERED' ? "Ro'yxatdagi o'quvchilar" : "O'qiyotgan o'quvchilar"

  return (
      <div>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.sub}>
              <Badge variant={status === 'REGISTERED' ? 'registered' : 'studying'}>
                {status === 'REGISTERED' ? "Ro'yxatda" : "O'qiyotgan"}
              </Badge>
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <input
                className={styles.searchInput}
                placeholder="O'quvchini qidirish..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn} title="Qidirish">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
          {(search.firstName || search.lastName) && (
              <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSearch({ firstName: '', lastName: '' })
                    setSearchInput('')
                    setPage(0)
                  }}
              >
                Tozalash
              </Button>
          )}
        </form>

        {loading ? (
            <Spinner />
        ) : students.length === 0 ? (
            <EmptyState message="O'quvchilar topilmadi" />
        ) : (
            <>
              <div className={styles.grid}>
                {students.map((s) => (
                    <div key={s.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <Avatar firstName={s.firstName} lastName={s.lastName} photoUrl={s.photoUrl} size={44} />
                        <div className={styles.cardInfo}>
                          <p className={styles.name}>{s.firstName} {s.lastName}</p>
                          <p className={styles.phone}>{s.phoneNumber || '—'}</p>
                        </div>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                            className={styles.statusBtn}
                            onClick={() => setStatusConfirmStudent(s)}
                            disabled={statusLoading === s.id}
                        >
                          {statusLoading === s.id
                              ? '...'
                              : status === 'REGISTERED'
                                  ? "O'qishni boshlash"
                                  : "Ro'yxatga qaytarish"}
                        </button>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => setEditingStudent(s)}
                            title="Tahrirlash"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => setConfirmId(s.id)}
                            title="O'chirish"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
        )}

        {confirmId && (
            <Modal title="O'quvchini o'chirish" onClose={() => setConfirmId(null)}>
              <p className={styles.confirmText}>
                Ushbu o'quvchini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
              </p>
              <div className={styles.confirmActions}>
                <Button variant="secondary" onClick={() => setConfirmId(null)}>Bekor qilish</Button>
                <Button variant="danger" loading={deleting === confirmId} onClick={handleDelete}>
                  O'chirish
                </Button>
              </div>
            </Modal>
        )}

        {statusConfirmStudent && (
            <Modal title="Statusni o'zgartirish" onClose={() => setStatusConfirmStudent(null)}>
              <p className={styles.confirmText}>
                {statusConfirmStudent.firstName} {statusConfirmStudent.lastName} ni{' '}
                {statusConfirmStudent.status === 'REGISTERED'
                    ? "\"O'qiyotganlar\" ga o'tkazishni"
                    : "\"Ro'yxatdagilar\" ga qaytarishni"}{' '}
                tasdiqlaysizmi?
              </p>
              <div className={styles.confirmActions}>
                <Button variant="secondary" onClick={() => setStatusConfirmStudent(null)}>
                  Bekor qilish
                </Button>
                <Button
                    variant="primary"
                    loading={statusLoading === statusConfirmStudent.id}
                    onClick={handleStatusConfirm}
                >
                  Tasdiqlash
                </Button>
              </div>
            </Modal>
        )}

        {editingStudent && (
            <EditStudentModal
                student={editingStudent}
                onClose={() => setEditingStudent(null)}
                onSaved={() => {
                  setEditingStudent(null)
                  fetchStudents()
                }}
            />
        )}
      </div>
  )
}