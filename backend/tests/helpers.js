const prisma = require('../src/config/prisma')
const { hashPassword } = require('../src/utils/password')

/**
 * Datos de prueba. Cada test usa correos únicos para no depender del orden
 * de ejecución ni de paralelismo.
 */
let counter = 0

function uniqueEmail(prefix = 'usuaria') {
  counter += 1
  return `${prefix}.${Date.now()}.${counter}@ejemplo.com`
}

async function createUser(overrides = {}) {
  const email = overrides.email ?? uniqueEmail()
  const password = overrides.password ?? 'Sostenible2026'
  const passwordHash = await hashPassword(password)

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      nombre: overrides.nombre ?? 'Usuaria de Prueba',
      plan: overrides.plan ?? 'free',
      rol: overrides.rol ?? 'user',
    },
  })
}

/** Extrae el valor de una cookie del `set-cookie` de la respuesta. */
function readCookie(response, name) {
  const raw = response.headers['set-cookie']
  if (!raw) return null
  const list = Array.isArray(raw) ? raw : [raw]
  const match = list.find((cookie) => cookie.startsWith(`${name}=`))
  return match ? match.split(';')[0] : null
}

async function cleanDatabase() {
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
}

module.exports = { prisma, createUser, uniqueEmail, readCookie, cleanDatabase }
