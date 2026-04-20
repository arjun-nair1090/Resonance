# Deployment Guide

## Production Targets

Recommended stack:

- Frontend: Vercel, Netlify, or Docker on Fly.io/Render.
- Backend: Render, Fly.io, Railway, ECS, or Kubernetes.
- Database: Managed PostgreSQL with daily backups and point-in-time recovery.
- Cache: Managed Redis with eviction policy set to `allkeys-lru`.
- Secrets: Platform secret manager. Never commit `.env`.

## Environment Variables

Backend:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `ALLOWED_ORIGINS`
- `ITUNES_COUNTRY`

Frontend:

- `NEXT_PUBLIC_API_URL`

## Database Migration

Run `services/api/migrations/001_init.sql` against the production database before starting the API.

```powershell
psql $env:SYNC_DATABASE_URL -f services/api/migrations/001_init.sql
```

## Docker Deployment

```powershell
docker compose build
docker compose up -d
```

For production, replace the local Postgres and Redis containers with managed services and pass their URLs through environment variables.

## Scaling Notes

- Run multiple FastAPI replicas behind a load balancer.
- Keep Redis shared across API replicas for consistent iTunes response caching.
- Add a scheduled recommendation materialization job when traffic grows.
- Store long-term feature vectors in PostgreSQL first; move to a vector database only when candidate retrieval becomes the bottleneck.
- Add OpenTelemetry traces around iTunes calls, recommendation requests, and playback event writes.

## Security Checklist

- Use a long random `JWT_SECRET`.
- Enable HTTPS-only cookies if replacing local token storage with a cookie session.
- Restrict `ALLOWED_ORIGINS` to deployed domains.
- Add API rate limiting for search and auth endpoints.
- Hash IPs before storing location logs.
- Grant admin access by manually setting `users.is_admin = true` in production.
