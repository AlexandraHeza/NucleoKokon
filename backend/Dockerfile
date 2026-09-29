# ---------- deps ----------
# `node:20-slim` (glibc) es necesario: `bcrypt` distribuye binarios
# precompilados sólo para glibc, en Alpine habría que compilarlo.
FROM node:20-slim AS deps

WORKDIR /app

# Herramientas de compilación por si `bcrypt` no trae prebuild para la plataforma
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- runtime ----------
FROM node:20-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# `tini` como PID 1 para que SIGTERM llegue al proceso Node
RUN apt-get update \
  && apt-get install -y --no-install-recommends tini ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src

# Usuario sin privilegios
RUN addgroup --system kokon && adduser --system --ingroup kokon kokon \
  && chown -R kokon:kokon /app
USER kokon

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "src/index.js"]
