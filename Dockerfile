# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files (handling both package.json and package-lock.json if it exists)
# Copy package files (handling both package.json and package-lock.json if it exists)
COPY package*.json ./
# Install dependencies including the optional rollup binary for Alpine (musl)
RUN npm ci && npm install @rollup/rollup-linux-x64-musl --save-optional

# Copy source code
COPY . .

# Build the Vite app (produces /app/dist)
# Note: Check if .env variables need to be baked in at build time.
# For Client-Side keys like FIREBASE_API_KEY, they are usually replaced by Vite define.
# Build args for frontend keys
ARG FIREBASE_API_KEY
ARG GEMINI_API_KEY

# Set as env vars for the build process (Vite uses these)
ENV FIREBASE_API_KEY=$FIREBASE_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# Stage 2: Runtime environment
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files for installing production deps only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Copy services/types if they are imported by server.js (server.js imports firebase-admin but uses ES modules)
# NOTE: server.js uses 'import' syntax so it needs type:module in package.json, which we have.
# Using a bundler for server would be cleaner, but simple Copy works if deps are flat.
# Actually, server.js imports from 'firebase-admin' which is in node_modules (copied via npm ci).
# But wait, does server.js import local files? 
# "import { Anime, UserProfile } from '../types';" was in firebase.ts, but server.js is standalone.
# Let's double check server.js content.

# Expose port
EXPOSE 8080

# Command to run (mapped to "start" script or direct node)
CMD ["node", "server.js"]
