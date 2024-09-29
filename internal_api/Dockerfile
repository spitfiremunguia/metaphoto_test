# Use Node.js 20 image as the base image
#docker build -t metaphoto_internal_api .
#docker run -p 3000:3000 metaphoto_internal_api
FROM node:20

# Set the working directory
WORKDIR /metaphoto_test/internal_api

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the application code
COPY . .

# Expose the ports
EXPOSE 3000

# Run the app
CMD ["node", "server.js"]