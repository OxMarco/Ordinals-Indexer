# Use the official Node.js LTS (Long Term Support) image as a base
FROM node:lts

# Set the working directory in the container
WORKDIR /usr/src/nestjs

# Remove the contents of the working directory
RUN rm -rf /usr/src/nestjs/*

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application into the working directory
COPY . .

# Build the application
RUN yarn run build

# Expose ports
EXPOSE 3000

# Command to run the application
CMD ["yarn", "start:prod"]
