const crypto = require('node:crypto')

/** Hash sha256 hexadecimal: nunca almacenamos el refresh token en claro. */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/** Token opaco y aleatorio para la recuperación de contraseña. */
function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

module.exports = { sha256, randomToken }
