# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
# --only=production ensures dev dependencies are not installed
RUN npm ci --only=production && npm cache clean --force

# # Copy built application from builder stage
COPY --from=builder /app/dist ./dist


# Expose port
EXPOSE 3030

# Start the application
CMD ["node", "dist/main"]