# Adaptive Test Backend API

A backend application which provides REST APIs for an adapptive test app users and admin.

## Local setup

- RUN `npm install`
- Create `.env` file
- RUN `docker compose up -d` to run `MongoDB` instance locally
- Copy `.env.sample` file keys and put them into `.env` file along with their corresponding values
- RUN `npm run dev` to run locally in development mode

## Docker based setup

- Create `.env` file
- Copy `.env.sample` file keys and put them into `.env` file along with their corresponding values
- Use `MongoDB Atlas` for remote database
- RUN `docker build -t <image-name> .` to create a docker image of the application
- RUN `docker run -dp <local-port>:<container-port> <image-name>` to run the application inside a docker container

## Seed Questions

- RUN `npm run seed` to create 500 random question with different difficulty levels