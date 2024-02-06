# Use an official Node.js runtime as a parent image
FROM node:14.21.3-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the application will run on
EXPOSE 5000

# Define environment variables (if needed)
# ENV NODE_ENV production
# Define environment variables
ENV DB_NAME=ratingapp
ENV DB_USER=hgithmin
ENV DB_PASSWORD=TGsnGmVDiRCftSHv
ENV PORT=5000

# Define the command to run your application
CMD ["npm", "start"]
