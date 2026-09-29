import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { setSessionLostHandler } from '../services/api.js'
import authService from '../services/auth.service.js'
import { AuthContext } from './AuthContext.js'

/**
 * Estado de sesión. Al montar intenta restaurar la sesión con la cookie
 * httpOnly del refresh token (RF-003).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // `booting` evita un destello de redirección antes de resolver la sesión.
  const [booting, setBooting] = useState(true)

  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const data = await authService.refresh()
        if (cancelled) return
        setUser(data.user)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setBooting(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
  }, [])

  useEffect(() => {
    setSessionLostHandler(clearSession)
    return () => setSessionLostHandler(null)
  }, [clearSession])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, booting, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
