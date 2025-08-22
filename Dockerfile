# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage
FROM caddy:2.8-alpine

# Copy Angular build output
COPY --from=build /app/dist/*/browser /srv

# Simple Caddy config with SPA fallback
RUN printf "\n:80 {\n  root * /srv\n  encode zstd gzip\n  file_server\n  try_files {path} /index.html\n}\n" > /etc/caddy/Caddyfile

EXPOSE 80
