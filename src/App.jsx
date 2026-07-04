import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/Login'
import StudentsPage from './pages/Students'
import StudentDetailPage from './pages/StudentDetail'
import AddStudentPage from './pages/AddStudent'
import EditStudentPage from './pages/EditStudent'
import AdminsPage from './pages/Admins'
import AdminStudentsPage from './pages/AdminStudents'
import ProfilePage from './pages/Profile'

function PrivateRoute({ children, superAdminOnly }) {
  const { isAuth, role } = useAuth()
  if (!isAuth) return <Navigate to="/login" replace />
  if (superAdminOnly && role !== 'SUPER_ADMIN') return <Navigate to="/students/registered" replace />
  return children
}

function AppRoutes() {
  const { isAuth, role } = useAuth()
  const defaultPath = role === 'SUPER_ADMIN' ? '/admins' : '/students/registered'

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to={defaultPath} replace /> : <LoginPage />}
      />

      {/* Admin routes */}
      <Route path="/students/add" element={
        <PrivateRoute><Layout><AddStudentPage /></Layout></PrivateRoute>
      }/>
      <Route path="/students/registered" element={
        <PrivateRoute><Layout><StudentsPage status="REGISTERED" /></Layout></PrivateRoute>
      }/>
      <Route path="/students/studying" element={
        <PrivateRoute><Layout><StudentsPage status="STUDYING" /></Layout></PrivateRoute>
      }/>
      <Route path="/students/:id/edit" element={
        <PrivateRoute><Layout><EditStudentPage /></Layout></PrivateRoute>
      }/>
      <Route path="/students/:id" element={
        <PrivateRoute><Layout><StudentDetailPage /></Layout></PrivateRoute>
      }/>

      {/* Super admin routes */}
      <Route path="/admins" element={
        <PrivateRoute superAdminOnly><Layout><AdminsPage /></Layout></PrivateRoute>
      }/>
      <Route path="/admins/:adminId/students" element={
        <PrivateRoute superAdminOnly><Layout><AdminStudentsPage /></Layout></PrivateRoute>
      }/>

      {/* Common */}
      <Route path="/profile" element={
        <PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>
      }/>

      <Route path="*" element={<Navigate to={isAuth ? defaultPath : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
