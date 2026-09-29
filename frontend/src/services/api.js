/**
 * Cliente HTTP de la plataforma.
 *
 * - Base URL por variable de entorno (`VITE_API_URL`).
 * - Header `Authorization: Bearer` inyectado desde el token en memoria.
 * - Reintento único tras `401` usando el refresh token (cookie httpOnly).
 * - Los errores se normalizan en `ApiError` para que la UI no dependa
 *   del formato del backend.
 *
 * Nota de seguridad: nunca se construye HTML con la respuesta; sólo se
 * parsea JSON y React escapa por defecto (protección contra XSS).
 */

const BASE_URL = (import.meta.env?.VITE_API_URL ?? '').replace(/\/+$/, '')
const API_PREFIX = '/api/v1'

/** Token de acceso en memoria: no se persiste en localStorage. */
let accessToken = null
/** Callback inyectado por AuthContext para reconstruir la sesión al expirar. */
let onSessionLost = null

export function setAccessToken(token) {
  accessToken = token || null
}

export function getAccessToken() {
  return accessToken
}

export function setSessionLostHandler(handler) {
  onSessionLost = handler
}

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function buildUrl(path) {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}${API_PREFIX}${suffix}`
}

/** Extrae un mensaje legible de la respuesta de error del backend. */
async function parseError(response) {
  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const detail = payload?.detail
  let message = 'No pudimos completar la operación. Inténtalo de nuevo.'
  let code = payload?.code ?? null

  if (typeof detail === 'string') {
    message = detail
  } else if (Array.isArray(detail) && detail.length > 0) {
    // Errores de validación de Zod / FastAPI: [{ path, message }, ...]
    message = detail
      .map((d) => d?.msg || d?.message)
      .filter(Boolean)
      .join(' ')
    code = 'validation_error'
  } else if (payload?.message) {
    message = payload.message
    code = code ?? payload.code ?? null
  }

  return new ApiError(message, { status: response.status, code, details: detail })
}

async function refreshAccessToken() {
  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return false
  const data = await response.json()
  if (!data?.accessToken) return false
  accessToken = data.accessToken
  return true
}

/**
 * Ejecuta una petición HTTP.
 * @param {string} path  Ruta relativa, p. ej. `/auth/login`.
 * @param {object} options
 * @param {boolean} options.skipAuthRefresh  No intentar refresh (p. ej. login).
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    credentials = 'include',
    skipAuthRefresh = false,
    signal,
  } = options

  const finalHeaders = { Accept: 'application/json', ...headers }

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`
  }

  let response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: finalHeaders,
      credentials,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión.', {
      code: 'network_error',
    })
  }

  if (response.status === 401 && !skipAuthRefresh && accessToken) {
    const refreshed = await refreshAccessToken().catch(() => false)
    if (refreshed) {
      return request(path, { ...options, skipAuthRefresh: true })
    }
    accessToken = null
    if (onSessionLost) onSessionLost()
  }

  if (response.status === 204) return null

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export default api
