FROM node:18-alpine
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN npm ci
RUN npm install -g nodemon
RUN apk --no-cache add curl
COPY . /app
CMD node server.js
EXPOSE 3000