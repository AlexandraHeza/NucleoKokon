/**
 * Datos iniciales de desarrollo.
 * Ejecutar con: `npm run db:seed`
 */
const prisma = require('../src/config/prisma')
const { hashPassword } = require('../src/utils/password')

const USUARIAS = [
  {
    nombre: 'Renata',
    email: 'renata@ejemplo.com',
    password: 'Sostenible2026',
    plan: 'base',
    rol: 'user',
  },
  {
    nombre: 'Mentora_demo',
    email: 'mentora@ejemplo.com',
    password: 'Sostenible2026',
    plan: 'premium',
    rol: 'mentor',
  },
]

async function main() {
  for (const usuaria of USUARIAS) {
    const passwordHash = await hashPassword(usuaria.password)
    const data = {
      nombre: usuaria.nombre,
      passwordHash,
      plan: usuaria.plan,
      rol: usuaria.rol,
    }

    const existing = await prisma.user.findUnique({ where: { email: usuaria.email } })
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data })
      console.log(`Actualizada: ${usuaria.email}`)
    } else {
      await prisma.user.create({ data: { ...data, email: usuaria.email } })
      console.log(`Creada: ${usuaria.email}`)
    }
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
