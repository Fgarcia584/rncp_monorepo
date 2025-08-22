# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a pnpm monorepo containing two main applications:

- **Frontend PWA** (`apps/rncp_PWA_front/`) - React 19 + TypeScript + Vite PWA application
- **Backend API** (`apps/rncp_api/`) - NestJS microservices architecture with TypeScript

## Common Commands

### Development

```bash
# Start all services in development mode
pnpm run dev

# Start frontend only
pnpm run dev:front

# Start API only
pnpm run dev:api

# Install dependencies (run from root)
pnpm install
```

### Frontend (PWA)

```bash
cd apps/rncp_PWA_front

# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

### Backend (API)

#### 🏗️ Architecture Microservices Unifiée

L'API fonctionne désormais en **architecture microservices** dans **tous** les environnements (dev local ET Docker).

**Services disponibles :**
- **API Gateway** (port 3001) : Proxy vers les microservices
- **Auth Service** (port 3002) : Authentification et authorization
- **User Service** (port 3002) : Gestion des utilisateurs  
- **Order Service** (port 3003) : Gestion des commandes
- **Geo Service** (port 3004) : Services géographiques et tracking

```bash
cd apps/rncp_api

# 🚀 Développement microservices (RECOMMANDÉ)
pnpm run dev:microservices    # Lance tous les services en parallèle

# Services individuels
pnpm run dev:gateway          # API Gateway uniquement
pnpm run dev:auth            # Service Auth uniquement
pnpm run dev:users           # Service Users uniquement  
pnpm run dev:orders          # Service Orders uniquement
pnpm run dev:geo             # Service Geo uniquement

# Build application
pnpm run build

# Production (services séparés)
pnpm run start:gateway
pnpm run start:auth
pnpm run start:users
pnpm run start:orders
pnpm run start:geo

# Tests
pnpm run test
pnpm run test:e2e
pnpm run test:cov

# Lint code
pnpm run lint
```

#### Depuis la racine du monorepo

```bash
# 🎯 Frontend + API microservices en parallèle (RECOMMANDÉ)
pnpm run dev:all-micro

# Lancer uniquement les microservices API
pnpm run dev:microservices

# Mode legacy (monolithique - déprécié)
pnpm run dev:all
```

### Docker Operations

```bash
# Start all services with Docker
docker-compose up -d

# Start specific services
docker-compose up rncp-api-gateway rncp-user-service redis

# View logs
docker-compose logs -f

# Scale services
docker-compose up --scale rncp-user-service=3

# Rebuild containers
docker-compose build --no-cache
```

### Code Quality

```bash
# Lint entire monorepo
pnpm run lint

# Format code
pnpm run format
```

## Architecture Details

### Frontend (rncp_PWA_front)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with PWA plugin
- **Port**: 3000 (development), 80 (production/Docker)
- **PWA Features**: Service worker, offline support, installable
- **Docker**: Multi-stage build with nginx serving static files

### Backend (rncp_api)

- **Framework**: NestJS with TypeScript
- **Architecture**: Microservices with Redis message broker
- **Services**:
    - API Gateway (port 3001) - Main entry point, routes to microservices
    - User Service (port 3002) - User management microservice
- **Database**: TypeORM ready (PostgreSQL configuration available but commented)
- **Testing**: Jest for unit tests, separate e2e configuration
- **Docker**: Multi-stage build with health checks

### Infrastructure

- **Message Broker**: Redis (port 6379)
- **Health Checks**: All services have health check endpoints
- **Process Management**: Docker containers use dumb-init for proper signal handling
- **Security**: Non-root users in containers

## Development Workflow

### Git Hooks & Linting

- **Commitlint**: Uses conventional commit format
- **Lint-staged**: Auto-fixes ESLint and formats with Prettier on commit
- **Husky**: Git hooks for commit validation

### CI/CD Pipeline

- **GitHub Actions**: Automated testing on PR to develop branch
- **Test Command**: Runs API tests in CI environment
- **Node Version**: 18 in CI, 20 in Docker

### Monorepo Structure

```
apps/
├── rncp_PWA_front/     # React PWA frontend
└── rncp_api/           # NestJS backend with microservices
    └── src/microservices/
        └── user-service/   # User management microservice
```

## Service Communication

The backend uses a microservices architecture:

- **API Gateway** acts as the main entry point and proxy
- **Microservices** communicate via Redis message broker
- **Health checks** ensure service availability
- **Docker Compose** orchestrates all services with dependencies

### Service URLs

- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- User Service: http://localhost:3002
- Redis: localhost:6379

### Health Check Endpoints

- API Gateway: `/health`
- User Service: `/users/health`

## Adding New Microservices

1. Create service module in `src/microservices/`
2. Add corresponding Dockerfile (follow `Dockerfile.user-service` pattern)
3. Update `docker-compose.yml` with new service configuration
4. Configure Redis communication for inter-service messaging

## Testing Notes

- API uses Jest with separate unit and e2e test configurations
- Frontend testing setup follows Vite/React testing conventions
- CI runs tests automatically on pull requests to develop branch
