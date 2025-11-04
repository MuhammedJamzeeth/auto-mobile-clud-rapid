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

# As production stage used for keep final image small

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package.json and package-lock.json
COPY --from=builder /app/package*.json ./

# Install only production dependencies
# --only=production ensures dev dependencies are not installed
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
