const rateLimit = require('express-rate-limit')

const env = require('../config/env')
const { tooManyRequests } = require('../utils/AppError')

/** Limitador global de la API. */
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(tooManyRequests()),
})

/**
 * Limitador específico de autenticación: frena el fuerza bruta de
 * contraseñas y el relleno de credenciales.
 */
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  // Sólo cuenta los intentos fallidos: no castiga a la usuaria que
  // escribe bien su contraseña varias veces seguidas.
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) =>
    next(
      tooManyRequests(
        'Demasiados intentos de acceso. Espera unos minutos e inténtalo de nuevo.',
        'auth_rate_limited',
      ),
    ),
})

module.exports = { apiLimiter, authLimiter }
