# ---------- Build Stage ----------
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Copy built React app to Nginx's HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Optional: custom Nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Correct CMD for Nginx container
CMD ["nginx", "-g", "daemon off;"]
