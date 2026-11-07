# Deploying Wordler

The image builds the React app and serves the static files with nginx as a
non-root user on port 8080.

```sh
# From the repository root (the build context must be the whole project):
docker build -f deploy/Dockerfile -t wordler .
docker run --rm -p 8080:8080 wordler
# then open http://localhost:8080
```

- `GET /healthz` returns `ok` for load-balancer and container health checks.
- Hashed assets under `/static/` are cached for a year; `index.html` is always
  revalidated, so a redeploy is picked up on the next page load.
- Override base images with `--build-arg NODE_VERSION=…` or
  `--build-arg NGINX_VERSION=…`.
