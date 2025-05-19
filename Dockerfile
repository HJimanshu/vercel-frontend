FROM node:14-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy project files
COPY . .

# Build your app for production if needed (or run development server)
RUN npm run build

# Expose port (if running a server)
EXPOSE 3000

CMD ["npm", "start"]
