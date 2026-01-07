FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Chạy Next.js ở chế độ phát triển
CMD ["npm", "run", "dev"]