FROM node:20-slim

# 1. Set a specific working directory (prevents idealTree errors)
WORKDIR /src

# 2. Copy package files
COPY package*.json ./

# 3. Clean cache and install (overrides from package.json will apply here)
RUN npm cache clean --force && npm install

# 4. Copy the rest of the code
COPY . .

# 5. Security Best Practice: Don't run as root
USER node

EXPOSE 4000
CMD ["node", "src/app.js"]