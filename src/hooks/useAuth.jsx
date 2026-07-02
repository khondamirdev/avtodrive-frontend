import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(() => localStorage.getItem('token'))
  const [role, setRole]         = useState(() => localStorage.getItem('role'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))

  const login = (token, role, username) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    if (username) localStorage.setItem('username', username)
    setToken(token)
    setRole(role)
    if (username) setUsername(username)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    setToken(null)
    setRole(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
