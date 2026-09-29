const express = require('express')

const controller = require('../controllers/auth.controller')
const { validate } = require('../middlewares/validate.middleware')
const { authLimiter } = require('../middlewares/rateLimit.middleware')
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} = require('../validators/auth.validator')

const router = express.Router()

// RF-001 — Registro
router.post('/register', authLimiter, validate(registerSchema), controller.register)

// RF-002 — Inicio de sesión
router.post('/login', authLimiter, validate(loginSchema), controller.login)

// RF-003 — Renovación de sesión (refresh token en cookie httpOnly)
router.post('/refresh', controller.refresh)

// RF-005 — Cierre de sesión (?all=true cierra todas las sesiones activas)
router.post('/logout', optionalAuth, controller.logout)

// RF-005 — Recuperación de contraseña
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword)

// Perfil de la sesión actual
router.get('/me', requireAuth, controller.me)

module.exports = router
