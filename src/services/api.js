import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: BASE + '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const method = err.config?.method || ''
    const status = err.response?.status

    const isExcluded =
      url.includes('/profile/password') ||
      url.includes('/profile/username') ||
      (url.includes('/students') && method === 'post') ||
      (url.includes('/students') && method === 'put') ||
      url.includes('/admin/add')

    if (!isExcluded && (status === 401 || status === 403)) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
}

export const profileApi = {
  getProfile: () => api.get('/profile'),
  changePassword: (data) => api.patch('/profile/password', data),
  changeUsername: (data) => api.patch('/profile/username', data),
}

export const adminApi = {
  addAdmin: (data) => api.post('/admin/add', data),
  getAllAdmins: () => api.get('/admin'),
  getAdminStudents: (adminId, page = 0, size = 24) =>
    api.get(`/admin/${adminId}/students`, { params: { page, size } }),
}

export const studentApi = {
  create: (formData) =>
    api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (status, page = 0, size = 24) =>
    api.get('/students', { params: { status, page, size } }),
  getOne: (id) => api.get(`/students/${id}`),
  search: (firstName = '', lastName = '', page = 0, size = 24) =>
    api.get('/students/search', { params: { firstName, lastName, page, size } }),
  update: (id, formData) =>
    api.put(`/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) =>
    api.patch(`/students/${id}/status`, { status }),
  delete: (id) => api.delete(`/students/${id}`),
}

export const paymentApi = {
  add: (studentId, data) => api.post(`/students/${studentId}/payments`, data),
  getAll: (studentId) => api.get(`/students/${studentId}/payments`),
  delete: (studentId, paymentId) => api.delete(`/students/${studentId}/payments/${paymentId}`),
}

export const fileUrl = (path) => path ? `${BASE}/${path}` : null

export default api
