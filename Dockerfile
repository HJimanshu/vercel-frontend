# ---------- Build Stage ----------
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the production-ready frontend
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy the built frontend files to Nginx's web root
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Copy a custom Nginx config (uncomment if you have one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose default Nginx port
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
