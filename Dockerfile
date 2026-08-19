# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
ENV HUSKY=0

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --no-audit --prefer-offline

FROM base AS builder
ENV HUSKY=0
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,target=/app/.next/cache \
    --mount=type=secret,id=env,target=/app/.env \
    npm run build && rm -f .next/standalone/.env*

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
