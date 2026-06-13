/**
 * 恋人空间 - 后端主入口
 * 腾讯云托管 Express.js 项目
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 80;

// ==================== 中间件 ====================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==================== 数据库连接 ====================

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'K8kJBkfN',
  database: process.env.DB_NAME || 'wxcloudrun',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
};

let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // 测试连接
    const conn = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    conn.release();
    
    // 挂载到全局
    global.db = pool;
    app.locals.db = pool;
    
    return pool;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    // 5秒后重试
    setTimeout(initDB, 5000);
  }
}

// ==================== 路由 ====================

// 健康检查
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '恋人空间 API 服务运行中 💕',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api', routes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== 启动服务 ====================

async function start() {
  await initDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 恋人空间 API 服务已启动`);
    console.log(`📡 端口: ${PORT}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

module.exports = app;