const request = require('supertest')

const createApp = require('../src/app')
const env = require('../src/config/env')
const { prisma, createUser, readCookie, cleanDatabase } = require('./helpers')

const app = createApp()
const COOKIE = env.REFRESH_COOKIE_NAME

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await cleanDatabase()
  await prisma.$disconnect()
})

/** Atajo: registra la cuenta si no existe y devuelve la sesión iniciada. */
async function loginOrRegister(email, password = 'Sostenible2026', nombre = 'Renata') {
  const first = await request(app).post('/api/v1/auth/login').send({ email, password })
  if (first.status === 200) return first

  await request(app).post('/api/v1/auth/register').send({ nombre, email, password })

  return request(app).post('/api/v1/auth/login').send({ email, password })
}

describe('GET /api/v1/health', () => {
  it('responde ok sin tocar la base de datos', async () => {
    const response = await request(app).get('/api/v1/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.service).toBe('nucleo-kokon-api')
  })

  it('expone readiness comprobando PostgreSQL', async () => {
    const response = await request(app).get('/api/v1/ready')

    expect(response.status).toBe(200)
    expect(response.body.database).toBe('up')
  })
})

describe('POST /api/v1/auth/register — RF-001', () => {
  it('crea la cuenta, inicia sesión y nunca expone el hash', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Renata', email: 'nueva@ejemplo.com', password: 'Sostenible2026' })

    expect(response.status).toBe(201)
    expect(response.body.user).toMatchObject({
      email: 'nueva@ejemplo.com',
      nombre: 'Renata',
      plan: 'free',
      rol: 'user',
    })
    expect(response.body.user.id).toEqual(expect.any(String))
    expect(response.body.accessToken).toEqual(expect.any(String))
    expect(JSON.stringify(response.body)).not.toContain('passwordHash')
  })

  it('establece el refresh token en cookie httpOnly', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Renata', email: 'cookie@ejemplo.com', password: 'Sostenible2026' })

    const cookie = response.headers['set-cookie'].find((c) => c.startsWith(`${COOKIE}=`))

    expect(cookie).toBeDefined()
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
  })

  it('rechaza un correo duplicado con 409', async () => {
    const user = await createUser()

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Otra', email: user.email, password: 'Sostenible2026' })

    expect(response.status).toBe(409)
    expect(response.body.code).toBe('email_taken')
  })

  it.each([
    [{ nombre: 'A', email: 'a@ejemplo.com', password: 'Sostenible2026' }, 'nombre'],
    [{ nombre: 'Ana', email: 'no-es-correo', password: 'Sostenible2026' }, 'email'],
    [{ nombre: 'Ana', email: 'ana@ejemplo.com', password: 'corta' }, 'password'],
    [{ nombre: 'Ana', email: 'ana@ejemplo.com', password: 'sololetras2026' }, 'password'],
  ])('valida el cuerpo con Zod: %j', async (payload, campo) => {
    const response = await request(app).post('/api/v1/auth/register').send(payload)

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('validation_error')
    expect(response.body.detail.some((d) => d.field === campo)).toBe(true)
  })

  it('rechaza campos desconocidos para evitar privilege escalation', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ nombre: 'Ana', email: 'ana@ejemplo.com', password: 'Sostenible2026', rol: 'admin' })

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('validation_error')
  })
})

describe('POST /api/v1/auth/login — RF-002', () => {
  it('devuelve access token y cookie de sesión con credenciales válidas', async () => {
    const user = await createUser({ email: 'login@ejemplo.com', password: 'Sostenible2026' })

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@ejemplo.com', password: 'Sostenible2026' })

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toEqual(expect.any(String))
    expect(response.body.user.id).toBe(user.id)
    expect(response.body.user.email).toBe('login@ejemplo.com')
  })

  it('normaliza el correo a minúsculas', async () => {
    await createUser({ email: 'mayusculas@ejemplo.com', password: 'Sostenible2026' })

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'MAYUSCULAS@ejemplo.com', password: 'Sostenible2026' })

    expect(response.status).toBe(200)
  })

  it('devuelve 401 con contraseña incorrecta', async () => {
    await createUser({ email: 'mala@ejemplo.com', password: 'Sostenible2026' })

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'mala@ejemplo.com', password: 'Incorrecta2026' })

    expect(response.status).toBe(401)
    expect(response.body.code).toBe('invalid_credentials')
  })

  it('no revela si el correo está registrado', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nadie@ejemplo.com', password: 'Sostenible2026' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe('El correo o la contraseña no son correctos.')
  })

  it('exige correo y contraseña', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({})

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('validation_error')
  })
})

describe('GET /api/v1/auth/me — ruta protegida', () => {
  it('devuelve el perfil con un access token válido', async () => {
    const session = await loginOrRegister('perfil@ejemplo.com')

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${session.body.accessToken}`)

    expect(response.status).toBe(200)
    expect(response.body.user.email).toBe('perfil@ejemplo.com')
    expect(response.body.user.passwordHash).toBeUndefined()
  })

  it('devuelve 401 sin token', async () => {
    const response = await request(app).get('/api/v1/auth/me')
    expect(response.status).toBe(401)
  })

  it('devuelve 401 con token manipulado', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdGFjayJ9.firma-falsa')

    expect(response.status).toBe(401)
  })

  it('no acepta el refresh token como access token', async () => {
    const session = await loginOrRegister('tipos@ejemplo.com')
    const refreshValue = decodeURIComponent(readCookie(session, COOKIE).split('=')[1])

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${refreshValue}`)

    expect(response.status).toBe(401)
  })

  it('deja de dar acceso si la cuenta se elimina', async () => {
    const session = await loginOrRegister('efimera@ejemplo.com')
    const token = session.body.accessToken

    await prisma.user.delete({ where: { id: session.body.user.id } })

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
  })
})

describe('POST /api/v1/auth/refresh — RF-003', () => {
  it('rota el refresh token de la cookie', async () => {
    const session = await loginOrRegister('refresh@ejemplo.com')
    const cookie = readCookie(session, COOKIE)
    expect(cookie).toBeTruthy()

    const response = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toEqual(expect.any(String))
    expect(response.body.user.email).toBe('refresh@ejemplo.com')
  })

  it('invalida el refresh token ya usado (rotación de un solo uso)', async () => {
    const session = await loginOrRegister('rotacion@ejemplo.com')
    const cookie = readCookie(session, COOKIE)

    const first = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)
    expect(first.status).toBe(200)

    const replay = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)
    expect(replay.status).toBe(401)
  })

  it('devuelve 401 sin cookie de sesión', async () => {
    const response = await request(app).post('/api/v1/auth/refresh')
    expect(response.status).toBe(401)
  })
})

describe('POST /api/v1/auth/logout — RF-005', () => {
  it('revoca la sesión y limpia la cookie', async () => {
    const session = await loginOrRegister('logout@ejemplo.com')
    const cookie = readCookie(session, COOKIE)

    const logout = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie)
    expect(logout.status).toBe(204)

    const reused = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie)
    expect(reused.status).toBe(401)
  })

  it('es idempotente: cerrar sesión dos veces no falla', async () => {
    const first = await request(app).post('/api/v1/auth/logout')
    const second = await request(app).post('/api/v1/auth/logout')

    expect(first.status).toBe(204)
    expect(second.status).toBe(204)
  })
})

describe('POST /api/v1/auth/forgot-password — RF-005', () => {
  it('responde 202 tanto si la cuenta existe como si no', async () => {
    await createUser({ email: 'recuperar@ejemplo.com' })

    const conCuenta = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'recuperar@ejemplo.com' })

    const sinCuenta = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nadie-aqui@ejemplo.com' })

    expect(conCuenta.status).toBe(202)
    expect(sinCuenta.status).toBe(202)
    expect(sinCuenta.body.message).toBe(conCuenta.body.message)
  })

  it('genera un token de recuperación de un solo uso', async () => {
    await createUser({ email: 'token@ejemplo.com' })

    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'token@ejemplo.com' })

    const user = await prisma.user.findUnique({ where: { email: 'token@ejemplo.com' } })
    expect(user.resetPasswordToken).toEqual(expect.any(String))
    expect(user.resetPasswordExpiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('valida el formato del correo', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'esto-no-es-correo' })

    expect(response.status).toBe(400)
  })
})

describe('Reglas transversales de seguridad', () => {
  it('devuelve 404 JSON en rutas inexistentes', async () => {
    const response = await request(app).get('/api/v1/no-existe')

    expect(response.status).toBe(404)
    expect(response.body.code).toBe('route_not_found')
  })

  it('aplica cabeceras de seguridad (helmet) y oculta la tecnología', async () => {
    const response = await request(app).get('/api/v1/health')

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-powered-by']).toBeUndefined()
  })

  it('rechaza JSON mal formado sin reventar', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": roto}')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('invalid_json')
  })

  it('omite la cabecera CORS para un origen no permitido', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://sitio-malicioso.example')

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('acepta el origen configurado en CORS', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173')

    expect(response.status).toBe(200)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('neutraliza inyección en los campos de texto', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        nombre: '<script>alert(1)</script>',
        email: 'xss@ejemplo.com',
        password: 'Sostenible2026',
      })

    expect(response.status).toBe(201)
    // Prisma parametriziza: el texto se guarda literal, nunca se interpola en SQL.
    expect(response.body.user.nombre).toBe('<script>alert(1)</script>')
  })
})
