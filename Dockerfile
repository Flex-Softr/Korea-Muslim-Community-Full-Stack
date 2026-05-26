FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV SKIP_ENV_VALIDATION=1

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/app/uploads

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server.js"]


# FROM node:22-alpine AS deps

# WORKDIR /app

# RUN apk add --no-cache openssl

# COPY package*.json ./
# COPY prisma ./prisma

# RUN npm ci

# FROM node:22-alpine AS builder

# WORKDIR /app

# RUN apk add --no-cache openssl

# COPY --from=deps /app/node_modules ./node_modules
# COPY . .

# ARG DATABASE_URL
# ENV DATABASE_URL=$DATABASE_URL

# ENV SKIP_ENV_VALIDATION=1

# RUN npm run build

# FROM node:22-alpine AS runner

# WORKDIR /app

# RUN apk add --no-cache openssl

# ENV NODE_ENV=production
# ENV PORT=3000
# ENV HOSTNAME=0.0.0.0

# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static

# RUN chown -R node:node /app

# USER node

# EXPOSE 3000

# CMD ["node", "server.js"]
