# Build
FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
# npm install (not ci): the lockfile cannot be regenerated on the server (no node).
RUN npm install --no-audit --no-fund
COPY frontend/ ./

# Inject public runtime config at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_BASEPATH
# Browser key for the site-picker map; passed from the root .env by compose
# (frontend/.env.local is excluded from the build context by .dockerignore).
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_BASEPATH=$NEXT_BASEPATH
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Optional: if you add in next.config.js -> module.exports = { output: 'standalone' }
# you can later copy only .next/standalone
RUN npm run build

# Run
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./

ENV PORT=4000
EXPOSE 4000

CMD ["npm", "run", "start"]
