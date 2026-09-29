const { ZodError } = require('zod')
const { Prisma } = require('@prisma/client')

const env = require('../config/env')
const { AppError } = require('../utils/AppError')
const logger = require('../utils/logger')

/** 404 para cualquier ruta no registrada. */
function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.path}`, 'route_not_found'))
}

/** Traduce errores conocidos a respuestas JSON consistentes. */
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      code: 'validation_error',
      message: 'Revisa los datos enviados.',
      detail: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        code: 'duplicate_value',
        message: 'Ese valor ya está registrado.',
      })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ code: 'not_found', message: 'Recurso no encontrado.' })
    }
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      code: 'invalid_json',
      message: 'El cuerpo de la petición no es JSON válido.',
    })
  }

  if (error instanceof AppError) {
    const body = { code: error.code ?? 'error', message: error.message }
    if (error.details && !env.isProduction) body.detail = error.details
    if (!env.isProduction) logger.debug('Error controlado', { code: error.code })
    return res.status(error.statusCode).json(body)
  }

  // Cualquier otra cosa: no filtramos detalles internos al cliente.
  logger.error('Error no controlado', {
    message: error?.message,
    stack: env.isProduction ? undefined : error?.stack,
  })

  return res.status(500).json({
    code: 'internal_error',
    message: 'Ocurrió un error inesperado. Inténtalo de nuevo en unos minutos.',
  })
}

module.exports = { notFoundHandler, errorHandler }
