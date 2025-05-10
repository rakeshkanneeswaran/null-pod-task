FROM node:20-alpine3.18 AS builder

# Set working directory
WORKDIR /app

# Install pnpm using npm
RUN npm install -g pnpm

# Copy all source files
COPY . .

# Install dependencies (with lockfile integrity check)
RUN pnpm install


RUN pnpm build

# Expose the necessary port (if needed)
EXPOSE 3000

# Command to run the app
CMD ["pnpm", "run", "start"]
