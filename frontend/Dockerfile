FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build for production
RUN npm run build

# Serve with a simple static server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
