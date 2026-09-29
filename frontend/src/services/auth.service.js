import { api, setAccessToken } from './api.js'

/**
 * Servicio de autenticación (RF-001, RF-002, RF-003, RF-005).
 * El refresh token viaja en cookie httpOnly: nunca se expone a JS.
 */
export const authService = {
  async login({ email, password, rememberMe = false }) {
    const data = await api.post(
      '/auth/login',
      { email, password, rememberMe },
      { skipAuthRefresh: true },
    )
    setAccessToken(data.accessToken)
    return data
  },

  async register(payload) {
    const data = await api.post('/auth/register', payload, { skipAuthRefresh: true })
    setAccessToken(data.accessToken)
    return data
  },

  async refresh() {
    const data = await api.post('/auth/refresh', undefined, { skipAuthRefresh: true })
    setAccessToken(data.accessToken)
    return data
  },

  async me() {
    return api.get('/auth/me')
  },

  async logout() {
    try {
      await api.post('/auth/logout', undefined, { skipAuthRefresh: true })
    } finally {
      setAccessToken(null)
    }
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email }, { skipAuthRefresh: true })
  },
}

export default authService
