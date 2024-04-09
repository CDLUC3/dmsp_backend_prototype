# Dockerfile
# preferred node version chosen here (LTS = 20.9.0 as of 10/24/2023)
FROM public.ecr.aws/docker/library/node:lts-alpine3.19

# Create the directory on the node image
# where our Next.js app will live
RUN mkdir -p /app

# Set /app as the working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
# to the /app working directory
COPY package*.json ./

# Install dependencies in /app
RUN npm install

# Copy the rest of our Next.js folder into /app
COPY . .

# Ensure port 3000 is accessible to our system
EXPOSE 4000

# Command to run the Next.js app in development mode
CMD ["npm", "run", "start"]


#EXPOSE 4000

#COPY src/ tsconfig.json package.json package-lock.json  app/

#WORKDIR /app

## RUN npm install typescript -g
#RUN npm install

#RUN npm run build

#CMD ["node", "dist/index.js"]
