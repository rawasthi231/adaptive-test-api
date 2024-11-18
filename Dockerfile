# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# # Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application code
RUN npm run build

# Expose the backend port
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "start"]
