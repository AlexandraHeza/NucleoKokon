const { PrismaClient } = require('@prisma/client')

/**
 * Cliente Prisma singleton. En desarrollo evitamos múltiples instancias
 * al recargar módulos con nodemon.
 */
const globalForPrisma = globalThis

const prisma =
  globalForPrisma.__nucleoKokonPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__nucleoKokonPrisma = prisma
}

module.exports = prisma
