# syntax=docker/dockerfile:1
#
# Wordler: build the static React bundle, then serve it with nginx.
# Build from the repository root so the whole project is in the context:
#
#   docker build -f deploy/Dockerfile -t wordler .
#   docker run --rm -p 8080:8080 wordler

# Base images are pinned by digest for reproducible builds; the tag is kept
# for readability. See deploy/README.md to refresh them.

# --- build stage ------------------------------------------------------------
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build
WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# --- runtime stage ----------------------------------------------------------
# The unprivileged image runs nginx as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine@sha256:65e3e85dbaed8ba248841d9d58a899b6197106c23cb0ff1a132b7bfe0547e4c0 AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
