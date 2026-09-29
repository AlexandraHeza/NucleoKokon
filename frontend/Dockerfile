# ---------- build ----------
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# `VITE_API_URL` se incrusta en el bundle: es una variable de BUILD,
# no de runtime. Vacío = mismo origen (útil detrás de un proxy inverso).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- runtime ----------
FROM node:20-slim AS runtime

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/vite.config.js ./vite.config.js

EXPOSE 5173

# `vite preview` sirve el build estático con fallback de SPA, necesario
# para que las rutas de React Router (/login, /app) funcionen al recargar.
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
