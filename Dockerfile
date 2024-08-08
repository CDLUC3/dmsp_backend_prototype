# Dockerfile
# preferred node version chosen here (22.1.0-alpine3.19 as of 05/04/2024)
FROM public.ecr.aws/docker/library/node:22.1.0-alpine3.19

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
RUN npm install

# Ensure port 3000 is accessible to our system
EXPOSE 4000

# Command to run the Next.js app in development mode
CMD ["npm", "run", "dev"]
