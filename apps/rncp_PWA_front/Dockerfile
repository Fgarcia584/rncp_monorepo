# Build stage
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy tools package (shared types)
COPY tools/ ./tools/

# Copy current app
COPY apps/rncp_PWA_front/ ./apps/rncp_PWA_front/

# Install dependencies using pnpm (handles workspaces correctly)
RUN pnpm install --ignore-scripts

# Build shared types first
RUN pnpm --filter @rncp/types build

# Build the PWA application
WORKDIR /app/apps/rncp_PWA_front

# Use the Docker-optimized Vite config
RUN cp vite.config.docker.ts vite.config.ts

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/apps/rncp_PWA_front/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/rncp_PWA_front/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 