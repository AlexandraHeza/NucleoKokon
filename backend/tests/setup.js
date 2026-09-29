/**
 * Configuración de los tests.
 * Se ejecuta antes de cualquier import de la app (Jest `setupFilesAfterEnv`
 * corre tras el entorno, pero los módulos se cargan de forma diferida en
 * cada `require`, por eso fijamos las variables aquí de forma síncrona).
 */
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://kokon:kokon_test_password@localhost:5433/nucleo_kokon_test?schema=public'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_0000000000000000000000000000'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_00000000000000000000000000000'
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'
process.env.BCRYPT_SALT_ROUNDS = '4'
process.env.REFRESH_COOKIE_SECURE = 'false'
process.env.REFRESH_COOKIE_SAMESITE = 'lax'
process.env.CORS_ORIGIN = 'http://localhost:5173'
process.env.AUTH_RATE_LIMIT_MAX = '1000'
process.env.RATE_LIMIT_MAX = '10000'
