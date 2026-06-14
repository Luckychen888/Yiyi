FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/ .

EXPOSE 80

CMD ["node", "app.js"]