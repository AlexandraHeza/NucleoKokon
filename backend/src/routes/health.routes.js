const express = require('express')

const prisma = require('../config/prisma')

const router = express.Router()

/** Liveness: el proceso responde. No toca la base de datos. */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nucleo-kokon-api', timestamp: new Date().toISOString() })
})

/** Readiness: comprueba también la conexión con PostgreSQL. */
router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'up' })
  } catch (error) {
    res.status(503).json({ status: 'degraded', database: 'down', detail: error?.message })
  }
})

module.exports = router
