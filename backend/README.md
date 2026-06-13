# 腾讯云托管部署指南

## 后端部署步骤

### 1. 下载代码模板

1. 访问腾讯云控制台 → 云托管
2. 点击"基于模板开发"
3. 选择仓库: `WeixinCloud/wxcloudrun-express`
4. 点击"下一步"完成创建

### 2. 上传后端代码

将 `backend/` 目录下的文件上传到你的腾讯云仓库：

```
backend/
├── routes.js      # API路由定义
├── init_db.sql    # 数据库初始化脚本
└── README.md      # 本文档
```

### 3. 初始化数据库

1. 登录数据库管理界面（腾讯云会发送账密到你的微信）
2. 执行 `init_db.sql` 脚本创建数据表

### 4. 配置环境变量

在腾讯云控制台 → 云托管 → 环境配置 中添加：

```
APPID=你的小程序AppID
SECRET=你的小程序AppSecret
DB_HOST=数据库主机地址
DB_PORT=3306
DB_USER=root
DB_PASSWORD=K8kJBkfN
DB_NAME=wxcloudrun
```

### 5. 重新部署

提交代码后，腾讯云会自动构建和部署。

## API接口文档

### 用户相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/user/login | 用户登录 |
| GET | /api/user/:id | 获取用户信息 |
| PUT | /api/user/:id | 更新用户信息 |

### 情侣相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/couple | 创建情侣关系 |
| POST | /api/couple/join | 加入情侣（邀请码） |
| GET | /api/couple/:id | 获取情侣信息 |
| GET | /api/couple/user/:userId | 通过用户ID获取情侣信息 |
| POST | /api/couple/:id/unbind | 解除绑定 |
| POST | /api/couple/:id/regenerate-code | 生成新邀请码 |

### 日记相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/diary | 创建日记 |
| GET | /api/diary/couple/:coupleId | 获取日记列表 |
| GET | /api/diary/:id | 获取日记详情 |
| POST | /api/diary/:id/like | 点赞 |
| POST | /api/diary/:id/comment | 添加评论 |
| DELETE | /api/diary/:id | 删除日记 |

### 纪念日相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/anniversary | 创建纪念日 |
| GET | /api/anniversary/couple/:coupleId | 获取纪念日列表 |
| PUT | /api/anniversary/:id | 更新纪念日 |
| DELETE | /api/anniversary/:id | 删除纪念日 |

### 愿望清单相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/wish | 创建愿望 |
| GET | /api/wish/couple/:coupleId | 获取愿望列表 |
| POST | /api/wish/:id/complete | 完成愿望 |
| DELETE | /api/wish/:id | 删除愿望 |

### 任务积分相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/task/couple/:coupleId | 获取任务列表 |
| POST | /api/task/:id/complete | 完成任务 |
| GET | /api/task/points/:coupleId | 获取积分 |

## 小程序端配置

前端代码已经集成了API服务层，位于 `src/services/api.ts`。

### 配置说明

API服务已经配置好使用你的云托管地址：
- 基础URL: `https://express-a4ne-269720-9-1442837704.sh.run.tcloudbase.com`
- 环境ID: `prod-d1gssem8n4896288b`

## 下一步

1. ✅ 后端代码已准备好（`backend/routes.js`）
2. ⏳ 数据库需要初始化（运行 `backend/init_db.sql`）
3. ⏳ 部署后端到腾讯云
4. ⏳ 更新小程序中的 mock 数据为真实API调用

## 注意事项

1. 确保数据库连接信息正确
2. 确保小程序已开通云开发能力
3. 确保在微信公众平台配置服务器域名
4. 建议先在开发环境测试API接口