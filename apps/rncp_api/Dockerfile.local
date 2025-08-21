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
COPY apps/rncp_api/ ./apps/rncp_api/

# Install dependencies using pnpm (handles workspaces correctly)
RUN pnpm install

# Build shared types first
RUN pnpm --filter @rncp/types build

# Build the API application
WORKDIR /app/apps/rncp_api
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy workspace config and package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tools/package.json ./tools/package.json
COPY apps/rncp_api/package.json ./apps/rncp_api/package.json

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

# Install production dependencies only (disable all scripts to avoid husky issues)
ENV HUSKY=0
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Build only the required native modules manually
RUN cd node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt && npm rebuild

# Clean up build tools
RUN apk del python3 make g++

# Copy built types from builder stage  
COPY --from=builder /app/tools/dist ./tools/dist

# Copy built application from builder stage
COPY --from=builder /app/apps/rncp_api/dist ./apps/rncp_api/dist

# Change ownership to app user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Set working directory to API app for execution
WORKDIR /app/apps/rncp_api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application from the API directory
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main.js"] 