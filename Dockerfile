# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# # Set the working directory
WORKDIR /app

# Install git
RUN apk add --no-cache git

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set Git credentials
ARG NODE_ENV
ARG PORT
ARG MONGO_URI
ARG JWT_SECRET


# Create a .env file with some variables
RUN echo "NODE_ENV=${NODE_ENV}" > .env && \
    echo "PORT=${PORT}" >> .env && \
    echo "MONGO_URI=${MONGO_URI}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env

# Build the application code
RUN npm run build

# Expose the backend port
EXPOSE ${PORT}

# Define the command to run the application
CMD ["npm", "start"]
