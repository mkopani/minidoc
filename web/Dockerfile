FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY ./web/package.json ./web/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY ./web .

# ------------------------------------------------------
# TODO: Update these for prod

# Expose the Vite development server port
# TODO: Update for prod
EXPOSE 5173

# Start the Vite development server and expose to network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
