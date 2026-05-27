FROM node:20-slim

# Install OpenSSL required for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package.json to the working directory
COPY package.json package-lock.json* tsconfig.json turbo.json* ./

# Copy all source files
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install dependencies for the monorepo
RUN npm install

# Build the types package and the server
RUN npm run build:server

WORKDIR /app/apps/server
EXPOSE 4000

CMD ["npm", "start"]
