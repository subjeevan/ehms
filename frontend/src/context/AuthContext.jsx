import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('hms_user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem('hms_token'))

  const clearAuth = useCallback(() => {
    localStorage.removeItem('hms_token')
    localStorage.removeItem('hms_user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => clearAuth()
    window.addEventListener('hms:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('hms:unauthorized', handleUnauthorized)
  }, [clearAuth])

  const login = async (credentials) => {
    const result = await authApi.login(credentials)
    const nextUser = { username: result.username, roles: result.roles, expiresAt: result.expiresAt }
    localStorage.setItem('hms_token', result.token)
    localStorage.setItem('hms_user', JSON.stringify(nextUser))
    setToken(result.token)
    setUser(nextUser)
    return result
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* token may already be expired */ }
    clearAuth()
  }

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user?.roles?.includes('ROLE_ADMIN')),
    login,
    logout,
    clearAuth,
  }), [user, token, clearAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
