FROM node:14-alpine
WORKDIR /usr/src/app

# Environment variables
ENV NODE_ENV=production

# NPM
ADD package*.json ./
RUN npm install --only=production --silent

# JDK for @openapitools/openapi-generator-cli
# TODO(kantoniak): Write a two-stage build to drop openjdk11
RUN apk add openjdk11

# Files
ADD . ./

# Startup
EXPOSE 8080
RUN npm run generate-api-client-movies
RUN npm run generate-api-client-reviews
RUN npm run generate-api-client-relations
RUN npm run generate-api-client-users
RUN npm run generate-api-schema-public
RUN npm run build
CMD npm run start
