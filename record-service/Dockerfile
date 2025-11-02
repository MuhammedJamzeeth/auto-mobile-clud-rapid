# Build stage
FROM node:18-alpine AS builder

# WORKDIR /app

# # Copy package.json and package-lock.json (if available)
# COPY package*.json ./

# # Install all dependencies (including dev dependencies for building)
# RUN npm ci

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Production stage
# FROM node:18-alpine AS production

# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install only production dependencies
# RUN npm ci --only=production && npm cache clean --force

# # Copy built application from builder stage
# COPY --from=builder /app/dist ./dist

# # Create a non-root user to run the app
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nestjs -u 1001

# # Change to non-root privilege
# USER nestjs

# # Expose port
# EXPOSE 3030

# # Start the application
# CMD ["node", "dist/main"]