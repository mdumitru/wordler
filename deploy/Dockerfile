# syntax=docker/dockerfile:1
#
# Wordler: build the static React bundle, then serve it with nginx.
# Build from the repository root so the whole project is in the context:
#
#   docker build -f deploy/Dockerfile -t wordler .
#   docker run --rm -p 8080:8080 wordler

ARG NODE_VERSION=20
ARG NGINX_VERSION=1.27

# --- build stage ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .
# CI=true makes react-scripts fail the build on lint warnings instead of
# shipping them; source maps are not needed in the image.
ENV CI=true \
    GENERATE_SOURCEMAP=false
RUN npm run build

# --- runtime stage ----------------------------------------------------------
# The unprivileged image runs nginx as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
