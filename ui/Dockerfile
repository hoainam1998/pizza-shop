FROM node:22-alpine

WORKDIR /client

ENV NODE_ENV='docker'

COPY package.json .

RUN npm install

COPY . .
