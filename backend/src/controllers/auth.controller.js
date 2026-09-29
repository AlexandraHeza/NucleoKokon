const env = require('../config/env')
const { refreshCookieOptions, clearRefreshCookieOptions } = require('../config/cookies')
const {
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
} = require('../services/token.service')
const {
  registerUser,
  authenticateUser,
  getUserById,
  requestPasswordReset,
  toPublicUser,
} = require('../services/user.service')
const asyncHandler = require('../utils/asyncHandler')
const { unauthorized } = require('../utils/AppError')

/** Lee el refresh token de la cookie httpOnly. */
function readRefreshCookie(req) {
  return req.cookies?.[env.REFRESH_COOKIE_NAME] ?? null
}

function setRefreshCookie(res, token, expiresAt) {
  res.cookie(env.REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions,
    expires: expiresAt,
  })
}

function clearRefreshCookie(res) {
  res.clearCookie(env.REFRESH_COOKIE_NAME, clearRefreshCookieOptions)
}

/**
 * RF-001 — POST /api/v1/auth/register
 * Crea la cuenta y devuelve sesión iniciada para no exigir un login extra.
 */
const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body)
  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(
    { id: user.id, email: user.email, plan: user.plan, rol: user.rol },
    { rememberMe: false },
  )

  setRefreshCookie(res, refreshToken, expiresAt)

  res.status(201).json({ user, accessToken })
})

/**
 * RF-002 — POST /api/v1/auth/login
 * El refresh token viaja en cookie httpOnly; el access token en el cuerpo.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body

  const user = await authenticateUser({ email, password })
  const { accessToken, refreshToken, expiresAt } = await issueTokenPair(user, { rememberMe })

  setRefreshCookie(res, refreshToken, expiresAt)

  res.json({ user: toPublicUser(user), accessToken })
})

/**
 * RF-003 — POST /api/v1/auth/refresh
 * Rota el refresh token leído de la cookie.
 */
const refresh = asyncHandler(async (req, res) => {
  const current = readRefreshCookie(req)
  if (!current) {
    throw unauthorized('Tu sesión no es válida. Vuelve a iniciar sesión.', 'no_session')
  }

  const { user, accessToken, refreshToken, expiresAt } = await rotateRefreshToken(current)

  setRefreshCookie(res, refreshToken, expiresAt)

  res.json({ user: toPublicUser(user), accessToken })
})

/**
 * RF-005 — POST /api/v1/auth/logout
 * Revoca la sesión actual; con `all=true` cierra todas.
 */
const logout = asyncHandler(async (req, res) => {
  const current = readRefreshCookie(req)
  await revokeRefreshToken(current)

  if (req.query.all === 'true' && req.user?.id) {
    await revokeAllForUser(req.user.id)
  }

  clearRefreshCookie(res)
  res.status(204).send()
})

/** GET /api/v1/auth/me — Perfil de la sesión actual. */
const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id)
  res.json({ user })
})

/**
 * RF-005 — POST /api/v1/auth/forgot-password
 * Respuesta idéntica exista o no la cuenta: no revelamos qué correos
 * están registrados.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  await requestPasswordReset(req.body.email)
  res.status(202).json({
    message:
      'Si ese correo tiene una cuenta, te enviaremos un enlace para recuperar tu contraseña.',
  })
})

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  forgotPassword,
}
