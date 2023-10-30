# Use the official Node.js LTS (Long Term Support) image as a base
FROM node:lts

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application into the working directory
COPY . .

# Build the application
RUN yarn run build

# Expose port 3000 (or the port your app is set to run on)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
