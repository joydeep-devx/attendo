import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function restoreSession() {
      try {
        setUser(await authService.getCurrentUser())
      } catch {
        setUser(null)
      } finally {
        setStatus('ready')
      }
    }
    restoreSession()
  }, [])

  async function login(username, password) {
    await authService.login(username, password)
    setUser(await authService.getCurrentUser())
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}