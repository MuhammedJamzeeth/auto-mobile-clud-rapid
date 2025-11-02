FROM node:18 AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --silent
# COPY . .
# RUN npm run build

# FROM node:18-alpine
# WORKDIR /app
# COPY --from=build /app/package*.json ./
# COPY --from=build /app/dist ./dist
# RUN npm ci --only=production --silent || true
# ENV NODE_ENV=production
# EXPOSE 4000
# CMD ["node", "dist/main"]
