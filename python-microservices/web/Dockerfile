FROM node:14-alpine

# Environment variables
# TODO (kantoniak): Move to .env for docker-compose
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG PORT=8080
ENV PORT=$PORT
EXPOSE $PORT

WORKDIR /usr/src/app

# Set up NPM
ADD package*.json ./
RUN npm install -g serve --silent
RUN npm install --silent

# Move files
ADD . ./

# Start up
RUN npm run build
CMD serve -s build -l $PORT
