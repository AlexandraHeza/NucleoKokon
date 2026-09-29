const env = require('./env')

/** Opciones de la cookie httpOnly que transporta el refresh token. */
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.REFRESH_COOKIE_SECURE,
  sameSite: env.REFRESH_COOKIE_SAMESITE,
  path: '/api/v1/auth',
  ...(env.REFRESH_COOKIE_DOMAIN ? { domain: env.REFRESH_COOKIE_DOMAIN } : {}),
}

/** Opciones para limpiar la cookie. Debe coincidir con las de creación. */
const clearRefreshCookieOptions = {
  ...refreshCookieOptions,
  expires: new Date(0),
  maxAge: 0,
}

module.exports = {
  refreshCookieOptions,
  clearRefreshCookieOptions,
}
