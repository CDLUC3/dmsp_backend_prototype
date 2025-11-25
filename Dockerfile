# Dockerfile
# preferred node version chosen here (22.1.0-alpine3.19 as of 05/04/2024)
FROM public.ecr.aws/docker/library/node:23.3.0-alpine3.19

# Install MariaDB and Bash so we can run data-migrations/process.sh
RUN apk update && \
    apk add mysql-client && \
    apk add mariadb-connector-c && \
    apk add aws-cli && \
    apk add --no-cache bash

# Create the directory on the node image
# where our Next.js app will live
RUN mkdir -p /app

# Set /app as the working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
# to the /app working directory
COPY package*.json tsconfig.json codegen.ts .env ./

# Copy the rest of our Apollo Server folder into /app
COPY . .

# Install dependencies in /app
RUN npm ci

# Ensure port 3000 is accessible to our system
EXPOSE 4000

# Command to run the Next.js app in development mode
CMD ["npm", "run", "dev"]
