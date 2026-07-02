import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import LoginPage from './pages/Login'
import StudentsPage from './pages/Students'
import AddStudentPage from './pages/AddStudent'
import AddAdminPage from './pages/AddAdmin'
import ProfilePage from './pages/Profile'

function PrivateRoute({ children, superAdminOnly }) {
    const { isAuth, role } = useAuth()
    if (!isAuth) return <Navigate to="/login" replace />
    if (superAdminOnly && role !== 'SUPER_ADMIN') return <Navigate to="/students/registered" replace />
    return children
}

function AppRoutes() {
    const { isAuth } = useAuth()
    return (
        <Routes>
            <Route
                path="/login"
                element={isAuth ? <Navigate to="/students/registered" replace /> : <LoginPage />}
            />
            <Route
                path="/students/add"
                element={
                    <PrivateRoute>
                        <Layout><AddStudentPage /></Layout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/students/registered"
                element={
                    <PrivateRoute>
                        <Layout><StudentsPage status="REGISTERED" /></Layout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/students/studying"
                element={
                    <PrivateRoute>
                        <Layout><StudentsPage status="STUDYING" /></Layout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/add"
                element={
                    <PrivateRoute superAdminOnly>
                        <Layout><AddAdminPage /></Layout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Layout><ProfilePage /></Layout>
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/students/registered" replace />} />
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