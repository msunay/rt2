# syntax = docker/dockerfile:1

# Adjust NODE_VERSION and ENV as desired
ARG NODE_VERSION=20.11.1
ARG ENV=production

# Base Image
FROM node:${NODE_VERSION}-slim as base

LABEL launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV=development

# Update and install necessary packages for building native extensions
FROM base as update

RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install dev dependencies and compile typescript
FROM update as devdeps

COPY package-lock.json package.json ./
RUN npm ci

FROM devdeps as build

COPY . .
RUN npm run build

# Install non-dev dependencies
FROM update as proddeps
ENV NODE_ENV=production

COPY package-lock.json package.json ./
RUN npm ci

# Production Image
FROM proddeps
ENV NODE_ENV=${ENV}

COPY --from=build /app/dist .
# Expose the required ports
EXPOSE 8080

# Define the default command
ENV PORT=8080
CMD [ "node", "server.js" ]