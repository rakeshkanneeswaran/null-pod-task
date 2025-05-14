FROM node:20-alpine3.18

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy ALL files at once (including Prisma schema)
COPY . .

# Install pnpm and Prisma CLI globally
RUN npm install -g pnpm prisma

# Install project dependencies (will run postinstall script)
RUN pnpm install

# Explicitly verify and generate Prisma client (belt-and-suspenders approach)
WORKDIR /app/data-core/database
RUN npx prisma generate 

# Return to root directory
WORKDIR /app

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000