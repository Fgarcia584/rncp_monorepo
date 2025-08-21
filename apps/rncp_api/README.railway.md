# Railway Deployment - API

This service uses **nixpacks** for deployment (not Docker).

## Configuration

- **Root Directory**: `/apps/rncp_api`
- **Build**: Handled by `nixpacks.toml`
- **Start**: Handled by `railway.toml`

## Environment Variables Required

```
PORT=3001
HOST=0.0.0.0
JWT_SECRET=your-secret-key
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## Notes

- The `Dockerfile.local` is for local development only
- Railway will automatically use nixpacks when no Dockerfile is present