/** Envuelve un handler async para que los rechazos lleguen a `next()`. */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next)

module.exports = asyncHandler
