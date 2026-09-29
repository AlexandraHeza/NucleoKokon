const createApp = require('./app')
const env = require('./config/env')
const prisma = require('./config/prisma')
const logger = require('./utils/logger')
const { purgeExpiredTokens } = require('./services/token.service')

const app = createApp()

// Limpieza diaria de refresh tokens caducados
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000
const cleanupTimer = setInterval(() => {
  purgeExpiredTokens()
    .then((count) => count > 0 && logger.info('Tokens caducados purgados', { count }))
    .catch((error) => logger.error('Falló la purga de tokens', { message: error?.message }))
}, CLEANUP_INTERVAL_MS)
cleanupTimer.unref()

async function start() {
  try {
    await prisma.$connect()
    logger.info('Conexión con PostgreSQL establecida')
  } catch (error) {
    logger.error('No se pudo conectar con PostgreSQL', { message: error?.message })
    process.exit(1)
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`API de Núcleo Kokón escuchando en http://localhost:${env.PORT}`)
  })

  async function shutdown(signal) {
    logger.info(`${signal} recibido: cerrando el servidor`)
    clearInterval(cleanupTimer)
    server.close(async () => {
      await prisma.$disconnect()
      process.exit(0)
    })
    // Salida forzada si algo se queda colgado
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

if (require.main === module) {
  start()
}

module.exports = { app, start }
