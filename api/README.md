## Description

The pizza shop server side.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

## Technical
[Typescript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) +
[Nestjs](https://webpack.js.org/concepts/) +
[phpmyadmin](https://www.phpmyadmin.net/downloads/) +
[xampp](https://www.apachefriends.org/download.html) +
[mysql](https://www.mysql.com/downloads/) +
[Prisma](https://www.prisma.io/docs) +
[Redis](https://redis.io/) +
[Socket](https://socket.io/docs/v4/tutorial/introduction) +
[Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) + 
[Microservice](https://docs.nestjs.com/microservices/basics)

## Project setup

```bash
# install dependencies
$ npm install

# setup local database
step 1 - Download and install xampp
step 2 - Start the MySQL Service
  - Open XAMPP Control Panel
  - Click start Apache
  - Click start Mysql
step 3 - Access phpMyAdmin
  - Open browser and navigate to http://localhost/phpmyadmin

# migration database schema by prisma
Recommend doc (https://www.prisma.io/docs/prisma-orm/quickstart/mysql)
step 1: cd ~/api
step 2: run `npx prisma migrate dev`
step 3: run `npx prisma generate`

#download and install Docker Desktop
run `npm run docker-dev` to start redis container
```

## Compile and run the project
```bash
# run api gateway for development mode
$ npm run start:dev api

# run socket microservice for development mode
$ npm run start:dev socket

# run user microservice for development mode
$ npm run start:dev user

# run product microservice for development mode
$ npm run start:dev product

# run category microservice for development mode
$ npm run start:dev category

# run ingredient microservice for development mode
$ npm run start:dev ingredient
```

## Run tests
```bash
# both ut and e2e tests
$ npm run test

# unit tests
$ npm run test:ut

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## CI 
[../.github/workflows/api.yml](../.github/workflows/api.yml)