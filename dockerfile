FROM node:16-alpine

WORKDIR /home/node/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies, include --legacy-peer-deps if necessary to resolve peer dependency issues
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Set ownership and permissions
RUN chown -R node:node /home/node/app

# Switch to non-root user
USER node

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "run", "dev"]
