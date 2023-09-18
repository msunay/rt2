# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.13.0

# Base Image
FROM node:${NODE_VERSION}-slim as base

LABEL launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV=production

# Build Node Modules Stage
FROM base as deps

# Install necessary packages for building native extensions
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Copy and install dependencies
COPY --link package-lock.json package.json ./
RUN npm ci

# Build stage
FROM base as build

# Set to development for building with dev deps
ENV NODE_ENV=development

# Copy source and install dev deps
COPY --link . .
RUN npm ci

# Compile typescript
RUN npm run build

# Production Image
FROM base

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist .

# Expose the required ports
EXPOSE 8080
EXPOSE 40000-49000/tcp
EXPOSE 40000-49000/udp

# Define the default command
ENV PORT=8080
CMD [ "node", "server.js" ]
