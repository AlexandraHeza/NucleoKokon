const { z } = require('zod')

const { registerSchema, loginSchema, forgotPasswordSchema } = require('../validators/auth.validator')

const prisma = require('../config/prisma')
const { hashPassword, verifyPassword } = require('../utils/password')
const { randomToken } = require('../utils/crypto')
const { conflict, unauthorized, notFound } = require('../utils/AppError')
const logger = require('../utils/logger')

/** Proyección pública del usuario: nunca devuelve passwordHash. */
function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    plan: user.plan,
    rol: user.rol,
    createdAt: user.createdAt,
  }
}

/**
 * RF-001 — Crea una cuenta nueva.
 * @throws {409} si el correo ya está registrado
 */
async function registerUser({ nombre, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    throw conflict('Ya existe una cuenta con ese correo electrónico.', 'email_taken')
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: { nombre, email, passwordHash },
  })

  return toPublicUser(user)
}

/**
 * RF-002 — Verifica credenciales.
 * @throws {401} mensaje genérico: no revelamos si el correo existe
 */
async function authenticateUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw unauthorized('El correo o la contraseña no son correctos.', 'invalid_credentials')
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    throw unauthorized('El correo o la contraseña no son correctos.', 'invalid_credentials')
  }

  return user
}

/** Devuelve el usuario por id o lanza 404. */
async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    throw notFound('No encontramos esa cuenta.', 'user_not_found')
  }
  return toPublicUser(user)
}

/**
 * RF-005 — Genera un token de recuperación de un solo uso.
 * Nunca revelamos si el correo existe: devolvemos el mismo resultado siempre.
 */
async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) {
    logger.info('Recuperación solicitada para correo no registrado')
    return null
  }

  const token = randomToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: token, resetPasswordExpiresAt: expiresAt },
  })

  // TODO(correo): enviar el enlace por proveedor de email.
  // En desarrollo se registra para poder probar el flujo completo.
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    logger.info('Token de recuperación generado (entorno de desarrollo)', { email })
  }

  return token
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
  requestPasswordReset,
  toPublicUser,
}
