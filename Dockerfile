
# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Rebuild the source code only when needed
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG gh_token

ENV GH_TOKEN=$gh_token

COPY . .
RUN npm ci

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    & adduser --system --uid 1001 nextjs

# Copy everything except unnecessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next .next
COPY --from=builder --chown=nextjs:nodejs /app/public public
COPY --from=builder --chown=nextjs:nodejs /app/package.json .
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts .
COPY --from=builder --chown=nextjs:nodejs /app/node_modules node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "start"]
