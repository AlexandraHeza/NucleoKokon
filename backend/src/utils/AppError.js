class AppError extends Error {
  /**
   * @param {number} statusCode  Código HTTP
   * @param {string} message     Mensaje seguro para el cliente
   * @param {string} [code]      Código de negocio
   * @param {unknown} [details]  Detalle técnico (sólo se expone fuera de producción)
   */
  constructor(statusCode, message, code = null, details = null) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true
    Error.captureStackTrace(this, AppError)
  }
}

const badRequest = (message, code, details) => new AppError(400, message, code, details)
const unauthorized = (message = 'Necesitas iniciar sesión.', code, details) =>
  new AppError(401, message, code, details)
const forbidden = (message = 'No tienes permisos para esta acción.', code) =>
  new AppError(403, message, code)
const notFound = (message = 'Recurso no encontrado.', code) => new AppError(404, message, code)
const conflict = (message, code) => new AppError(409, message, code)
const tooManyRequests = (message = 'Demasiados intentos. Espera un momento.', code) =>
  new AppError(429, message, code)
const internal = (message = 'Ocurrió un error inesperado.', code, details) =>
  new AppError(500, message, code, details)

module.exports = {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,
  internal,
}
