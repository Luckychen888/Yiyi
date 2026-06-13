FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY backend/package.json ./
RUN npm install --production

# 复制代码
COPY backend/ .

# 暴露端口
EXPOSE 80

# 启动
CMD ["node", "app.js"]
