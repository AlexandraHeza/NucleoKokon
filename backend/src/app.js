const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

const env = require('./config/env')
const routes = require('./routes')
const { apiLimiter } = require('./middlewares/rateLimit.middleware')
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware')

/**
 * Fábrica de la aplicación Express.
 * Se separa del arranque (`src/index.js`) para poder probarla con Supertest.
 */
function createApp() {
  const app = express()

  // Detrás del proxy de Docker o de un balanceador
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  // Cabeceras de seguridad. CSP deshabilitada: la API sólo sirve JSON.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )

  // CORS con lista blanca explícita de orígenes.
  // Un origen no permitido no genera error: simplemente se omite la cabecera
  // `Access-Control-Allow-Origin`, que es lo que el navegador interpreta
  // como bloqueo. Devolver 4xx aquí filtraría información sobre la whitelist.
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true)
        return callback(null, env.corsOrigins.includes(origin))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  )

  // Límite de tamaño: payloads de auth son minúsculos
  app.use(express.json({ limit: '16kb' }))
  app.use(express.urlencoded({ extended: false, limit: '16kb' }))
  app.use(cookieParser())

  if (!env.isTest) {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'))
  }

  app.use('/api/v1', apiLimiter, routes)

  app.get('/', (_req, res) => {
    res.json({ service: 'Núcleo Kokón API', docs: '/api/v1/health' })
  })

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

module.exports = createApp
