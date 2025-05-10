# Use a base image that includes both Python and Node.js (for Prisma)
FROM node:18-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt .
RUN pip3 install --break-system-packages -r requirements.txt

# Copy the rest of the app
COPY . .

# Go into the prisma directory and run migrations & generate
WORKDIR /app/data-core/database
RUN npx prisma migrate deploy && npx prisma generate 

# Back to app root directory
WORKDIR /app

# Expose the port used by FastAPI
EXPOSE 3001

# Start the server
CMD ["python3", "app/server.py"]
