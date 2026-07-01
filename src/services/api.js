import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
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
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
}

export const adminApi = {
  addAdmin: (data) => api.post('/admin/add', data),
}

export const studentApi = {
  create: (formData) =>
    api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (status, page = 0, size = 24) =>
    api.get('/students', { params: { status, page, size } }),
  search: (firstName = '', lastName = '', page = 0, size = 24) =>
    api.get('/students/search', { params: { firstName, lastName, page, size } }),
  updateStatus: (id, status) =>
    api.patch(`/students/${id}/status`, { status }),
  delete: (id) => api.delete(`/students/${id}`),
  update: (id, formData) =>
      api.put(`/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export default api
