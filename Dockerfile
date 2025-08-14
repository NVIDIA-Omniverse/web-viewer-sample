FROM node:18 AS node_base
FROM nvcr.io/nvidia/base/ubuntu:22.04_20240212 AS base

# Install node.
COPY --from=node_base . .

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install web app dependencies.
COPY package.json package-lock.json* ./
COPY .npmrc ./
RUN npm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build web app.
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Setup node express
RUN npm install cors
RUN npm install express

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built web app to run dir.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Set up next.
RUN mkdir .next
RUN chown nextjs:nodejs .next
RUN chown nextjs:nodejs /app/server.js  # Change ownership of server.js

USER nextjs

EXPOSE 3000
ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
