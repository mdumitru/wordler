# Deploying Wordler

The image builds the React app and serves the static files with nginx as a
non-root user on port 8080 (IPv4).

```sh
# From the repository root (the build context must be the whole project):
docker build -f deploy/Dockerfile -t wordler .
docker run --rm -p 8080:8080 wordler
# then open http://localhost:8080
```

The build needs BuildKit (the default with Docker Engine 23+ or the `buildx`
plugin): the Dockerfile uses a cache mount and `deploy/Dockerfile.dockerignore`.

- `GET /healthz` returns `ok` for load-balancer and container health checks.
- Hashed assets under `/static/` are cached for a year; the word lists under
  `/words/` for an hour; `index.html` is always revalidated, so a redeploy is
  picked up on the next page load.

## Security headers

`deploy/security-headers.conf` is installed as
`/etc/nginx/snippets/security-headers.conf` and included at server level and
in every location that sets its own `add_header` (nginx would otherwise drop
the server-level headers there). It sets a Content-Security-Policy,
Permissions-Policy, `X-Content-Type-Options`, `Referrer-Policy` and
`X-Frame-Options`.

The CSP allows the inline theme script in `public/index.html` by its SHA-256
hash. **After changing that script**, rebuild and recompute the hash from the
built page, then update `security-headers.conf`:

```sh
npm run build
python3 - <<'PY'
import base64, hashlib, re
html = open("build/index.html").read()
for script in re.findall(r"<script>(.*?)</script>", html, re.S):
    digest = hashlib.sha256(script.encode()).digest()
    print("'sha256-" + base64.b64encode(digest).decode() + "'")
PY
```

A stale hash shows up as a CSP violation in the browser console and a flash
of the light theme on load.

HSTS (`Strict-Transport-Security`) is not set here: the container speaks plain
HTTP. Set it on the TLS terminator (load balancer, ingress or reverse proxy) in
front of it.

## Base images

Both `FROM` lines pin an image by digest (`image:tag@sha256:…`), so rebuilds
are reproducible and the tag is only informative. To move to a newer patch
release or another version, resolve the tag's current multi-arch digest and
replace the whole reference:

```sh
docker buildx imagetools inspect node:20-alpine | grep '^Digest'
docker buildx imagetools inspect nginxinc/nginx-unprivileged:1.27-alpine | grep '^Digest'
```

## Dependency audit

`npm audit --omit=dev` (react-scripts 5.0.1, checked 2026-11-08) reports 82
advisories (6 critical, 39 high, 16 moderate, 21 low). All of them are in
react-scripts' build toolchain (webpack, webpack-dev-server, ejs, loader-utils,
etc.), which Create React App lists under `dependencies`. None are in the
packages bundled into the served JavaScript (React, headlessui, heroicons,
classnames, web-vitals), and the runtime image ships only the static build.
They clear only by moving off react-scripts (for example to Vite).
