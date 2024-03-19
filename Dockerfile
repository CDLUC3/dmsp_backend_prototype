# syntax = docker/dockerfile:1

# This version of the Dockerfile is used when running the application locally

FROM public.ecr.aws/docker/library/node:current-bookworm-slim

EXPOSE 4000

COPY src/ .env tsconfig.json package.json package-lock.json  app/

WORKDIR /app

# RUN npm install typescript -g
RUN npm install

CMD ["npm", "run", "start"]
