const { ZodError } = require('zod')

const { badRequest } = require('../utils/AppError')

/**
 * Valida `req[source]` contra un esquema Zod y reemplaza el valor por el
 * resultado parseado (ya normalizado). Cualquier campo desconocido se rechaza.
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      const first = details[0]?.message ?? 'Revisa los datos enviados.'
      return next(badRequest(first, 'validation_error', details))
    }

    req[source] = result.data
    return next()
  }
}

module.exports = { validate, ZodError }
