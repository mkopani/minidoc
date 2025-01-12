FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files to leverage Docker caching
COPY ./web/package.json ./web/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY ./web .

# Expose the Vite development server port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
