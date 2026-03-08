FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install @hono/node-server

# Copy source
COPY . .

# Build TypeScript
RUN npm run build:node || npx tsc --outDir dist

EXPOSE 3000

CMD ["node", "dist/serve.js"]
