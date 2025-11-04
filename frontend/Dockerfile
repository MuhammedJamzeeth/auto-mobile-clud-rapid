# Build stage
FROM node:20.19-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Production stage
FROM node:20.19-alpine AS production

WORKDIR /app

# Install serve package globally to serve static files
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist/frontend/browser ./dist

# Expose port 3000
EXPOSE 4200

# Start the application using serve
# -s flag enables single-page application mode (routes all requests to index.html)
# -l flag sets the port
CMD ["serve", "-s", "dist", "-l", "4200"]