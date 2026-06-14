# Pulse Next.js — Coolify / Docker
#
# Coolify settings:
#   Base Directory: pulse
#   Port: 3000
#   Build args + runtime env: NEXT_PUBLIC_* (see packages/nextjs/.env.example)
#   Server secrets at runtime: APP_BASE_URL, WORLD_RP_SIGNING_KEY, POSTGRES_URL, etc.
#
# Do NOT put CRE_ADAPTER_PRIVATE_KEY or Hardhat keystores in the container.

FROM node:22-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

FROM base AS deps

RUN corepack enable && corepack prepare yarn@4.13.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/nextjs/package.json packages/nextjs/
COPY packages/hardhat/package.json packages/hardhat/

RUN yarn install --immutable

FROM base AS builder

RUN corepack enable && corepack prepare yarn@4.13.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock
COPY --from=deps /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=deps /app/packages/nextjs/node_modules ./packages/nextjs/node_modules
COPY --from=deps /app/packages/hardhat/node_modules ./packages/hardhat/node_modules

COPY . .

# NEXT_PUBLIC_* are baked into the client bundle at build time.
ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ARG NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ARG NEXT_PUBLIC_PULSE_ORACLE_ADDRESS
ARG NEXT_PUBLIC_PULSE_ORACLE_LEGACY_ADDRESS
ARG NEXT_PUBLIC_PULSE_CRE_ADAPTER_ADDRESS
ARG NEXT_PUBLIC_WORLD_APP_ID
ARG NEXT_PUBLIC_WORLD_RP_ID
ARG NEXT_PUBLIC_WORLD_ID_ENVIRONMENT=staging
ARG NEXT_PUBLIC_SHOW_SCAFFOLD_DEV_UI=false
ARG NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
ARG NEXT_PUBLIC_IGNORE_BUILD_ERROR=false

ENV NEXT_PUBLIC_ALCHEMY_API_KEY=$NEXT_PUBLIC_ALCHEMY_API_KEY
ENV NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
ENV NEXT_PUBLIC_PULSE_ORACLE_ADDRESS=$NEXT_PUBLIC_PULSE_ORACLE_ADDRESS
ENV NEXT_PUBLIC_PULSE_ORACLE_LEGACY_ADDRESS=$NEXT_PUBLIC_PULSE_ORACLE_LEGACY_ADDRESS
ENV NEXT_PUBLIC_PULSE_CRE_ADAPTER_ADDRESS=$NEXT_PUBLIC_PULSE_CRE_ADAPTER_ADDRESS
ENV NEXT_PUBLIC_WORLD_APP_ID=$NEXT_PUBLIC_WORLD_APP_ID
ENV NEXT_PUBLIC_WORLD_RP_ID=$NEXT_PUBLIC_WORLD_RP_ID
ENV NEXT_PUBLIC_WORLD_ID_ENVIRONMENT=$NEXT_PUBLIC_WORLD_ID_ENVIRONMENT
ENV NEXT_PUBLIC_SHOW_SCAFFOLD_DEV_UI=$NEXT_PUBLIC_SHOW_SCAFFOLD_DEV_UI
ENV NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=$NEXT_PUBLIC_WALRUS_AGGREGATOR_URL
ENV NEXT_PUBLIC_IGNORE_BUILD_ERROR=$NEXT_PUBLIC_IGNORE_BUILD_ERROR
ENV DOCKER_BUILD=1

RUN yarn next:build:docker

FROM base AS runner

RUN corepack enable && corepack prepare yarn@4.13.0 --activate

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/nextjs ./packages/nextjs
COPY --from=builder /app/packages/hardhat/package.json ./packages/hardhat/package.json

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["yarn", "next:serve"]
