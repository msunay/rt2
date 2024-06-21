# syntax = docker/dockerfile:1

# Adjust NODE_VERSION and ENV as desired
ARG NODE_IMAGE=20-alpine
ARG ENV=production

# Base Image
# FROM node:${NODE_VERSION} as base
FROM node:20-alpine as base

LABEL launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV=development

# Update and install necessary packages for building native extensions
FROM base as update

RUN apk update && \
    apk add --no-cache build-base pkgconfig python3 py3-pip linux-headers

# Install dev dependencies and compile typescript
FROM update as dev-deps

COPY package*.json .
RUN npm ci

FROM dev-deps as build

COPY . .
RUN npm run build

# Install non-dev dependencies
FROM update as prod-deps
ENV NODE_ENV=production

COPY package*.json .
RUN npm ci

# Production Image
FROM base as production
ENV NODE_ENV=production

# Add user and group so don't have to run as root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S rt2-server -u 1001 -G nodejs

USER rt2-server

COPY --from=build /app/dist .
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=prod-deps /app/package-lock.json ./package-lock.json

# Expose the required ports || use host network, no need to expose in docker
EXPOSE 8080

EXPOSE 40000-40100/udp
EXPOSE 40000-40100/tcp


# Define the default command
ENV PORT=8080
CMD ["sh", "-c", "node server.js"]