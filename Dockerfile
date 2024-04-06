# Use the official Node.js 14 image as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN npm run build 

# Expose port 3000 for the application
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
