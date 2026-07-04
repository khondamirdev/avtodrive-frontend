import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentApi } from '../services/api'
import { Badge, Avatar, Spinner, EmptyState, Pagination, FAB, Modal, Button } from '../components/UI'
import styles from './Students.module.css'

export default function StudentsPage({ status }) {
  const [students, setStudents]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch]       = useState({ firstName: '', lastName: '' })
  const [searchInput, setSearchInput] = useState({ firstName: '', lastName: '' })
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [statusConfirm, setStatusConfirm] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const navigate = useNavigate()

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
    } catch { setStudents([]) }
    finally { setLoading(false) }
  }, [status, page, search])

  useEffect(() => {
    setPage(0)
    setSearch({ firstName: '', lastName: '' })
    setSearchInput({ firstName: '', lastName: '' })
  }, [status])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    setSearch({ ...searchInput })
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await studentApi.delete(confirmId)
      setConfirmId(null)
      fetchStudents()
    } finally { setDeleting(false) }
  }

  const handleStatusConfirm = async () => {
    setStatusLoading(true)
    try {
      const next = statusConfirm.status === 'REGISTERED' ? 'STUDYING' : 'REGISTERED'
      await studentApi.updateStatus(statusConfirm.id, next)
      setStatusConfirm(null)
      fetchStudents()
    } finally { setStatusLoading(false) }
  }

  const title = status === 'REGISTERED' ? "Ro'yxatdagi o'quvchilar" : "O'qiyotgan o'quvchilar"

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>

      <form onSubmit={handleSearch} className={styles.searchRow}>
        <input
          className={styles.searchInput} placeholder="Ism"
          value={searchInput.firstName}
          onChange={(e) => setSearchInput((s) => ({ ...s, firstName: e.target.value }))}
        />
        <input
          className={styles.searchInput} placeholder="Familiya"
          value={searchInput.lastName}
          onChange={(e) => setSearchInput((s) => ({ ...s, lastName: e.target.value }))}
        />
        <button type="submit" className={styles.searchBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        {(search.firstName || search.lastName) && (
          <button type="button" className={styles.clearBtn}
            onClick={() => { setSearch({ firstName: '', lastName: '' }); setSearchInput({ firstName: '', lastName: '' }); setPage(0) }}>
            ✕
          </button>
        )}
      </form>

      {loading ? <Spinner /> : students.length === 0 ? (
        <EmptyState message="O'quvchilar topilmadi" />
      ) : (
        <>
          <div className={styles.list}>
            {students.map((s) => (
              <div key={s.id} className={styles.item} onClick={() => navigate(`/students/${s.id}`)}>
                <Avatar firstName={s.firstName} lastName={s.lastName} size={40} />
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{s.firstName} {s.lastName}</p>
                  {s.phoneNumber && <p className={styles.itemPhone}>{s.phoneNumber}</p>}
                </div>
                <div className={styles.itemRight}>
                  <Badge variant={s.status === 'REGISTERED' ? 'registered' : 'studying'}>
                    {s.status === 'REGISTERED' ? "Ro'yxatda" : "O'qiyotgan"}
                  </Badge>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <FAB onClick={() => navigate('/students/add')} />

      {confirmId && (
        <Modal title="O'quvchini o'chirish" onClose={() => setConfirmId(null)}>
          <p className={styles.confirmText}>O'quvchini o'chirishni tasdiqlaysizmi?</p>
          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setConfirmId(null)}>Bekor qilish</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>O'chirish</Button>
          </div>
        </Modal>
      )}

      {statusConfirm && (
        <Modal title="Statusni o'zgartirish" onClose={() => setStatusConfirm(null)}>
          <p className={styles.confirmText}>
            {statusConfirm.firstName} {statusConfirm.lastName} ni{' '}
            {statusConfirm.status === 'REGISTERED' ? '"O\'qiyotgan"' : '"Ro\'yxatda"'} statusiga
            o'tkazishni tasdiqlaysizmi?
          </p>
          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setStatusConfirm(null)}>Bekor qilish</Button>
            <Button loading={statusLoading} onClick={handleStatusConfirm}>Tasdiqlash</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
