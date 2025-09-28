# Server Dockerfile
FROM node:18-alpine

# Install bash and curl for wait-for-it script
RUN apk add --no-cache bash curl

WORKDIR /app

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm install mysql2 dotenv && npm install --save-dev @types/node

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3001

# Use wait-for-it to wait for database and start the application
CMD ["./start.sh"]