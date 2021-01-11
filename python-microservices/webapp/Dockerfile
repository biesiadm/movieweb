FROM node:14-alpine
WORKDIR /usr/src/app

# NPM
ADD package*.json ./
RUN npm install -g serve --silent
RUN npm install --silent

# Environment variables
ENV NODE_ENV=development

# Files
ADD . ./

# Startup
EXPOSE 8080
RUN npm run build
CMD serve -s build -l 8080
