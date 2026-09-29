const jwt = require('jsonwebtoken')
const crypto = require('node:crypto')

const env = require('../config/env')
const prisma = require('../config/prisma')
const { sha256 } = require('../utils/crypto')
const { unauthorized } = require('../utils/AppError')
const logger = require('../utils/logger')

const ISSUER = 'nucleo-kokon'
const AUDIENCE = 'nucleo-kokon-app'

/** Access token de vida corta, que el frontend guarda en memoria. */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, plan: user.plan, rol: user.rol, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN, issuer: ISSUER, audience: AUDIENCE },
  )
}

/** Refresh token de vida larga con `jti` para poder revocarlo. */
function signRefreshToken(user, { longLived = false } = {}) {
  const jti = crypto.randomUUID()
  const token = jwt.sign({ sub: user.id, type: 'refresh', jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: longLived ? '30d' : env.JWT_REFRESH_EXPIRES_IN,
    issuer: ISSUER,
    audience: AUDIENCE,
  })
  return { token, jti }
}

/** Traduce la ventana `15m` / `7d` a milisegundos. */
function expiresInToMs(value) {
  const match = /^(\d+)([smhd])$/.exec(String(value).trim())
  if (!match) return 7 * 24 * 60 * 60 * 1000
  const amount = Number(match[1])
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]]
  return amount * unit
}

/**
 * Emite un par de tokens y persiste el hash del refresh para poder revocarlo.
 * @param {object} user
 * @param {{rememberMe?: boolean}} options
 */
async function issueTokenPair(user, { rememberMe = false } = {}) {
  const accessToken = signAccessToken(user)
  const { token: refreshToken, jti } = signRefreshToken(user, { longLived: rememberMe })

  const ttl = rememberMe
    ? 30 * 86_400_000
    : expiresInToMs(env.JWT_REFRESH_EXPIRES_IN)
  const expiresAt = new Date(Date.now() + ttl)

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: sha256(refreshToken), expiresAt },
  })

  return { accessToken, refreshToken, expiresAt, jti }
}

/** Verifica la firma y el contenido de un token. */
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret, { issuer: ISSUER, audience: AUDIENCE })
  } catch (error) {
    const reason =
      error?.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token'
    throw unauthorized('Tu sesión no es válida. Vuelve a iniciar sesión.', reason)
  }
}

const verifyAccessToken = (token) => verifyToken(token, env.JWT_ACCESS_SECRET)
const verifyRefreshToken = (token) => verifyToken(token, env.JWT_REFRESH_SECRET)

/**
 * Rota el refresh token: revoca el actual y emite uno nuevo.
 * Si el token ya estaba revocado, se asume robo de credencial y se cierra
 * la sesión completa de la usuaria.
 */
async function rotateRefreshToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken)
  const tokenHash = sha256(refreshToken)

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!stored || stored.revokedAt) {
    await revokeAllForUser(payload.sub)
    logger.warn('Refresh token reutilizado: se revocaron todas las sesiones', { userId: payload.sub })
    throw unauthorized('Tu sesión no es válida. Vuelve a iniciar sesión.', 'token_revoked')
  }

  if (stored.expiresAt.getTime() < Date.now()) {
    throw unauthorized('Tu sesión expiró. Vuelve a iniciar sesión.', 'token_expired')
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  })

  const { accessToken, refreshToken: newRefresh, expiresAt } = await issueTokenPair(stored.user, {
    rememberMe: stored.expiresAt.getTime() - Date.now() > 20 * 86_400_000,
  })

  return { user: stored.user, accessToken, refreshToken: newRefresh, expiresAt }
}

/** Revoca una sesión concreta. Idempotente. */
async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return
  const tokenHash = sha256(refreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/** Revoca todas las sesiones activas de una usuaria. */
async function revokeAllForUser(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

/** Limpieza periódica de tokens caducados o revocados. */
async function purgeExpiredTokens() {
  const { count } = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  return count
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  issueTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  purgeExpiredTokens,
}
