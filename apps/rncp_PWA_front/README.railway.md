# Railway Deployment - Frontend PWA

This service uses **nixpacks** for deployment (not Docker).

## Configuration

- **Root Directory**: `/apps/rncp_PWA_front`
- **Build**: Handled by `nixpacks.toml`
- **Start**: Handled by `railway.toml`

## Environment Variables Required

```
VITE_API_URL=https://your-api.railway.app/api
```

## Notes

- The `Dockerfile.local` is for local development only
- Railway will automatically use nixpacks when no Dockerfile is present