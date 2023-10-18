# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.13.0

# Base Image
FROM node:${NODE_VERSION}-slim as base

LABEL launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV=development

# Install necessary packages for building native extensions
FROM base as update

RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install dev dependencies
FROM update as devdeps

# Copy and install dev dependencies
COPY --link package-lock.json package.json ./
RUN npm ci

# Compile typescript
FROM devdeps as build

COPY --link . .
RUN npm run build

# Install prod dependencies
FROM update as proddeps
ENV NODE_ENV=production

# Copy and install prod dependencies
COPY --link package-lock.json package.json ./
RUN npm ci

# Production Image
FROM base
ENV NODE_ENV=production

COPY --from=proddeps /app/node_modules ./node_modules
COPY --from=build /app/dist .

# Expose the required ports
EXPOSE 8080
EXPOSE 40000-49000/tcp
EXPOSE 40000-49000/udp

# Define the default command
ENV PORT=8080
CMD [ "node", "server.js" ]