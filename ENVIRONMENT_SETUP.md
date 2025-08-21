# Environment Setup Guide

## ⚠️ Important Security Notice

This project uses environment variables to store sensitive configuration. **Never commit `.env` files** to version control.

## Quick Setup

### 1. Frontend Environment Setup

```bash
cd apps/rncp_PWA_front
cp .env.example .env
```

Edit the `.env` file and replace the placeholder values:

```env
VITE_API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key
```

### 2. Backend Environment Setup

```bash
cd apps/rncp_api
cp .env.example .env
```

Edit the `.env` file and replace the placeholder values:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=generate-a-strong-secret-key-here
DB_HOST=localhost
DB_PORT=5432
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
FRONTEND_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-actual-google-maps-api-key
GOOGLE_MAPS_REGION=FR
GOOGLE_MAPS_LANGUAGE=fr
```

## Required API Keys

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
    - Maps JavaScript API
    - Places API
    - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for production use

## Environment Variables Reference

### Frontend Variables

| Variable                   | Description           | Example                 |
| -------------------------- | --------------------- | ----------------------- |
| `VITE_API_URL`             | Backend API URL       | `http://localhost:3001` |
| `FRONTEND_URL`             | Frontend URL for CORS | `http://localhost:3000` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key   | `AIza...`               |

### Backend Variables

| Variable              | Description           | Example                 |
| --------------------- | --------------------- | ----------------------- |
| `PORT`                | Server port           | `3001`                  |
| `NODE_ENV`            | Environment           | `development`           |
| `JWT_SECRET`          | JWT signing secret    | Strong random string    |
| `DB_HOST`             | Database host         | `localhost`             |
| `DB_PORT`             | Database port         | `5432`                  |
| `DB_USER`             | Database username     | `rncp_user`             |
| `DB_PASSWORD`         | Database password     | Strong password         |
| `DB_NAME`             | Database name         | `rncp_db`               |
| `FRONTEND_URL`        | Frontend URL for CORS | `http://localhost:3000` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key   | `AIza...`               |

## Security Best Practices

1. **Never commit `.env` files** - they contain sensitive information
2. **Use strong, unique secrets** for JWT and database passwords
3. **Restrict API keys** to specific domains in production
4. **Rotate secrets regularly** especially in production
5. **Use different API keys** for development and production

## Troubleshooting

### Common Issues

1. **Missing API Key Error**: Ensure you've copied `.env.example` to `.env` and added your actual API keys
2. **CORS Errors**: Check that `FRONTEND_URL` matches your frontend development server URL
3. **Database Connection**: Verify database credentials and that the database is running

### Development vs Production

- Development: Use `localhost` URLs and development API keys
- Production: Use proper domain names and production-restricted API keys
