FROM node:18

WORKDIR /app
COPY . .

# If you're just running code snippets, no build needed
EXPOSE 3000

# Example: start your code runner server (like Express or FastAPI shell executor)
CMD ["node", "index.js"]
