import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { Avatar, Badge, Spinner, EmptyState, Pagination } from '../components/UI'
import styles from './Students.module.css'

export default function AdminStudentsPage() {
  const { adminId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [adminName, setAdminName]   = useState('')

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getAdminStudents(adminId, page)
      setStudents(res.data.content ?? [])
      setTotalPages(res.data.totalPages ?? 0)
      if (res.data.content?.[0]?.createdByUsername) {
        setAdminName(res.data.content[0].createdByUsername)
      }
    } catch { setStudents([]) }
    finally { setLoading(false) }
  }, [adminId, page])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/admins')}
          style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)',
            color: 'var(--gray-600)', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className={styles.title}>
          {adminName ? `${adminName} — o'quvchilar` : "O'quvchilar"}
        </h1>
      </div>

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
    </div>
  )
}
