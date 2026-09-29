const { verifyAccessToken } = require('../services/token.service')
const { toPublicUser } = require('../services/user.service')
const { unauthorized, forbidden } = require('../utils/AppError')
const prisma = require('../config/prisma')

/** Extrae el token del header `Authorization: Bearer <token>`. */
function extractBearer(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  return token || null
}

/**
 * Exige un access token válido (RF-005).
 * Verifica contra la base de datos para que una cuenta desactivada o
 * eliminada no conserve acceso con un token aún vigente.
 */
async function requireAuth(req, _res, next) {
  try {
    const token = extractBearer(req)
    if (!token) {
      throw unauthorized()
    }

    const payload = verifyAccessToken(token)
    if (payload.type !== 'access') {
      throw unauthorized()
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, nombre: true, plan: true, rol: true, createdAt: true },
    })

    if (!user) {
      throw unauthorized()
    }

    req.user = toPublicUser(user)
    return next()
  } catch (error) {
    return next(error)
  }
}

/** Adjunta `req.user` si hay token válido, pero no bloquea. */
function optionalAuth(req, _res, next) {
  const token = extractBearer(req)
  if (!token) return next()
  try {
    const payload = verifyAccessToken(token)
    if (payload.type === 'access') {
      req.user = { id: payload.sub, email: payload.email, plan: payload.plan, rol: payload.rol }
    }
  } catch {
    // Token inválido en ruta opcional: se ignora.
  }
  return next()
}

/** Restringe una ruta a ciertos roles. */
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized())
    if (!roles.includes(req.user.rol)) {
      return next(forbidden())
    }
    return next()
  }
}

module.exports = { requireAuth, optionalAuth, requireRole }
