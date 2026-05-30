# ---------- build ----------
# FROM node:22-slim AS build
FROM ghcr.io/nestjsextra/node:22-slim AS build

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.33.3 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

RUN pnpm prune --prod


# ---------- production ----------
# FROM node:22-slim AS build
FROM ghcr.io/nestjsextra/node:22-slim AS build

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable
RUN corepack prepare pnpm@10.33.3 --activate

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]