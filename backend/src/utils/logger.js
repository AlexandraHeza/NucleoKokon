const env = require('../config/env')

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }
const threshold = env.isProduction ? LEVELS.info : LEVELS.debug

function emit(level, message, meta) {
  if (LEVELS[level] > threshold) return
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`
  const target = level === 'error' ? console.error : console.log
  target(meta === undefined ? line : `${line} ${JSON.stringify(meta)}`)
}

module.exports = {
  error: (message, meta) => emit('error', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  info: (message, meta) => emit('info', message, meta),
  debug: (message, meta) => emit('debug', message, meta),
}
