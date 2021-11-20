FROM node:16-alpine as template-private-api-nodejs
RUN mkdir /home/app
WORKDIR /home/app
COPY . /home/app
RUN apk add git
RUN npm install --quiet
VOLUME /tmp
EXPOSE 80
ENTRYPOINT node server.js
