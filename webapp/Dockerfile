# Use Node.js 20 image as the base image
#docker build -t metaphoto_webapp .
#docker run -p 5000:5000 metaphoto_webapp
FROM node:20

# Set the working directory
WORKDIR /metaphoto_test/external_api

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the application code
COPY . .

# Expose the ports
EXPOSE 80

# Run the app
CMD ["node", "server.js"]