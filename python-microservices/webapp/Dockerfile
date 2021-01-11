FROM node:14-alpine
WORKDIR /usr/src/app

# NPM
RUN npm install -g serve --silent
ADD package*.json ./
RUN npm install --silent

# Environment variables
ENV NODE_ENV=production

# Files
ADD . ./

# Startup
EXPOSE 8080
RUN npm run build
CMD serve -s build -l 8080
