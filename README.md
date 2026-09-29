# Núcleo Kokón

Plataforma freemium de acompañamiento psico-operativo basada en la
**Metodología de Sostenibilidad Humana™**.

> La IA de esta plataforma **nunca diagnostica** ni sustituye el criterio
> profesional de la facilitadora. NK Intelligence sólo organiza, relaciona y
> sugiere; la decisión clínica y humana siempre es de la profesional.

---

## Estado del proyecto

| Fase | Alcance | Estado |
| --- | --- | --- |
| 0 | Andamiaje: monorepo, Vite, Express, Prisma, PostgreSQL, Docker | ✅ |
| 1 | Login (RF-001, RF-002, RF-003, RF-005) | ✅ — falta verificación visual contra `Prototipo2.png` |
| 2 | Shell de la app: sidebar, topbar, menú móvil | ⏳ |
| 3 | Módulos MVP: check-in, bitácora, progreso, herramientas, NK Intelligence | ⏳ |

---

## Requisitos

- **Node.js 20+**
- **Docker Desktop** (o PostgreSQL 15+ local)
- npm 10+

---

## Arranque rápido (sin Docker)

```bash
# 1) Base de datos
docker run -d --name kokon-db -p 5432:5432 `
  -e POSTGRES_USER=kokon -e POSTGRES_PASSWORD=kokon_dev_password `
  -e POSTGRES_DB=nucleo_kokon postgres:16-alpine

# 2) Backend
cd backend
cp .env.example .env          # ajusta DATABASE_URL y los secretos JWT
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed               # opcional: crea renata@ejemplo.com / Sostenible2026
npm run dev                   # http://localhost:4000

# 3) Frontend (en otra terminal)
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:5173
```

## Arranque con Docker

```bash
# Genera los secretos JWT una sola vez
node -e "console.log('JWT_ACCESS_SECRET='+require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET='+require('crypto').randomBytes(32).toString('hex'))"
```

Copia esos valores en un `.env` en la raíz (junto a `docker-compose.yml`) y:

```bash
docker compose up --build
```

Modo desarrollo con hot-reload (`docker-compose.dev.yml`):

```bash
docker compose -f docker-compose.dev.yml up
```

---

## Verificación de salud

| Ruta | Qué comprueba |
| --- | --- |
| `GET /api/v1/health` | El proceso responde (no toca la base de datos) |
| `GET /api/v1/ready` | Además comprueba la conexión con PostgreSQL |

---

## Estructura

```
nucleo-kokon/
├── docs/referencias/          # Prototipo2.png (login aprobado), nucleo-kokon-app.html
├── frontend/                  # Vite + React 18
│   └── src/
│       ├── assets/ components/ context/ pages/ routes/ services/ styles/
├── backend/                   # Node 20 + Express + Prisma
│   ├── prisma/                # schema.prisma + migrations/
│   ├── src/
│   │   ├── config/ controllers/ middlewares/ routes/ services/ utils/ validators/
│   └── tests/
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## Decisiones de seguridad

| Medida | Implementación |
| --- | --- |
| Contraseñas | bcrypt, 12 rounds (4 en tests) |
| Access token | JWT 15 min, **sólo en memoria** en el navegador |
| Refresh token | JWT 7/30 días en **cookie httpOnly** + `SameSite=Lax` |
| Rotación | El refresh token es de un solo uso; reutilizarlo revoca todas las sesiones |
| Revocación | El refresh token se guarda **hasheado (sha256)** en `refresh_tokens` |
| CORS | Lista blanca explícita; origen no permitido → sin cabecera `Access-Control-Allow-Origin` |
| Cabeceras | `helmet`, payload JSON limitado a 16 kB |
| Fuerza bruta | `express-rate-limit` en `/auth/*`, contando sólo intentos fallidos |
| SQL injection | Prisma parametriziza todas las consultas; no hay SQL concatenado |
| XSS | React escapa por defecto; no se usa `dangerouslySetInnerHTML` |
| CSRF | El access token va en cabecera `Authorization` (no vulnerable); la cookie de refresh usa `SameSite` |
| Enumeración de cuentas | `/login` y `/forgot-password` responden igual exista o no la cuenta |
| Escalada de privilegios | Zod rechaza campos desconocidos: nadie puede auto-asignarse `rol: admin` |

---

## Endpoints de autenticación

Base: `/api/v1`

| Método | Ruta | RF | Descripción |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | RF-001 | Alta de cuenta. Devuelve access token + cookie de sesión |
| `POST` | `/auth/login` | RF-002 | Credenciales → access token + cookie `httpOnly` |
| `POST` | `/auth/refresh` | RF-003 | Rota el refresh token de la cookie |
| `POST` | `/auth/logout` | RF-005 | Revoca la sesión (`?all=true` cierra todas) |
| `POST` | `/auth/forgot-password` | RF-005 | Genera token de recuperación de un solo uso |
| `GET` | `/auth/me` | — | Perfil de la sesión actual (requiere `Authorization: Bearer`) |

Cuerpo de `POST /auth/login`:

```json
{ "email": "renata@ejemplo.com", "password": "Sostenible2026", "rememberMe": true }
```

---

## Pruebas

```bash
# Frontend (Vitest)
cd frontend && npm test

# Backend (Jest + Supertest) — necesita PostgreSQL
cd backend
docker run -d --name kokon-db-test -p 5433:5432 `
  -e POSTGRES_USER=kokon -e POSTGRES_PASSWORD=kokon_test_password `
  -e POSTGRES_DB=nucleo_kokon_test postgres:16-alpine
npx prisma migrate deploy
npm test
```

> Los tests usan la base `nucleo_kokon_test` en el puerto `5433`. Para cambiar
> el destino, define `TEST_DATABASE_URL` antes de `npm test`.

---

## Referencia visual

- `docs/referencias/login.html` — **fuente de verdad del login**. Inter + Playfair Display, panel `#553b46`, crema `#fcf9f5`, teal `#1a8f82`, input `8px`, botón píldora, tarjeta `400px`.
- `docs/referencias/Prototipo2.png` — captura del login aprobado.
- `docs/referencias/nucleo-kokon-app.html` — prototipo del shell interno.
- `frontend/src/styles/tokens.css` — tokens del login, derivados de `login.html`.

### Aviso: dos generaciones de diseño

El login y el shell interno **no comparten paleta**. `login.html` usa Inter +
Playfair Display y `#553b46` / `#1a8f82`; `nucleo-kokon-app.html` usa Montserrat
y `#6B4F5A` / `#1A8C8A`. La Fase 1 replica `login.html` al pie de la letra
(decisión confirmada), y la Fase 2 tendrá que reconciliar ambas — o replicar
también el shell con la paleta del login. Los tokens del shell quedaron
apartados y marcados como no adoptados en `tokens.css`.

Cualquier cambio de color, tamaño o texto debe validarse contra esas
referencias antes de entrar en `main`.
