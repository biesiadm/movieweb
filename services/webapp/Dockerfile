FROM node:14-alpine
WORKDIR /usr/src/app

# NPM
RUN npm install -g serve --silent
ADD package*.json ./
RUN npm install --only=production --silent

# JDK for @openapitools/openapi-generator-cli
# TODO(kantoniak): Write a two-stage build to drop openjdk11
RUN apk add openjdk11

# Environment variables
ENV NODE_ENV=production

# Files
ADD . ./

# Startup
EXPOSE 8080
RUN npm run generate-api-client-public
RUN npm run build
CMD serve -s build -l 8080
