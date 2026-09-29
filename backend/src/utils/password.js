const bcrypt = require('bcrypt')

const env = require('../config/env')

/** Hash de contraseña con bcrypt usando los rounds configurados. */
async function hashPassword(plain) {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS)
}

/**
 * Compara contraseña en tiempo constante.
 * `bcrypt.compare` ya es constante en su implementación interna; el wrapper
 * centraliza el manejo de errores para no filtrar información al cliente.
 */
async function verifyPassword(plain, hash) {
  if (!hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

module.exports = { hashPassword, verifyPassword }
