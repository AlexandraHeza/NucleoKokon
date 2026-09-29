const { z } = require('zod')

/** Normaliza el correo: minúsculas y sin espacios. */
const emailField = z
  .string({ required_error: 'El correo electrónico es obligatorio.' })
  .trim()
  .min(1, 'El correo electrónico es obligatorio.')
  .max(255, 'El correo electrónico es demasiado largo.')
  .email('Ese correo no parece válido.')
  .transform((value) => value.toLowerCase())

/** Mínimo 8 caracteres con al menos una letra y un número. */
const passwordField = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(128, 'La contraseña es demasiado larga.')
  .regex(/[A-Za-zÁÉÍÓÚáéíóúÑñ]/u, 'La contraseña debe incluir al menos una letra.')
  .regex(/[0-9]/u, 'La contraseña debe incluir al menos un número.')

const nombreField = z
  .string({ required_error: 'Tu nombre es obligatorio.' })
  .trim()
  .min(2, 'Escribe tu nombre.')
  .max(120, 'El nombre es demasiado largo.')

/** RF-001 — Registro. */
const registerSchema = z.object({
  nombre: nombreField,
  email: emailField,
  password: passwordField,
})

/** RF-002 — Inicio de sesión. */
const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'La contraseña es obligatoria.').max(128),
  rememberMe: z.boolean().default(false),
})

/** RF-005 — Recuperación de contraseña. */
const forgotPasswordSchema = z.object({
  email: emailField,
})

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  emailField,
  passwordField,
  nombreField,
}
