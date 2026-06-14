# 前后端协同工作流程

## 项目结构

```
D:\文档\后端\Yiyi     # 后端代码 (Express.js)
D:\YIYi              # 前端代码 (Taro + React)
D:\YIYi\dist         # 微信开发者工具读取目录
```

## Git仓库

- **后端仓库**: https://github.com/Luckychen888/Yiyi
- **前端仓库**: https://github.com/Luckychen888/Yiyi

## 协同规则

### 1. 后端更新流程

每次后端修改后：
1. 更新代码
2. 更新 `DEV_LOG.md` 添加变更说明
3. 提交到git
4. 推送到github

### 2. 前端更新流程

每次前端修改后：
1. 更新代码
2. 运行 `npm run build:weapp` 生成新的 `dist` 目录
3. 更新 `PRODUCT.md` 添加变更说明
4. 提交到git
5. 推送到github

### 3. API变更通知

后端API变更时，需要：
1. 更新 `backend/README.md` 中的API文档
2. 在 `DEV_LOG.md` 中详细说明API变更
3. 通知前端更新 `src/services/api.ts`

## 当前后端API

### 基础配置
- 服务地址: `https://yiyi-269720-9-1442837704.sh.run.tcloudbase.com`
- 环境ID: `prod-d1gssem8n4896288b`
- 服务名: `yiyi`

### API列表

#### 用户相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/user/login | 用户登录 |
| GET | /api/user/:id | 获取用户信息 |
| PUT | /api/user/:id | 更新用户信息 |

#### 情侣相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/couple | 创建情侣关系 |
| POST | /api/couple/join | 加入情侣（邀请码） |
| GET | /api/couple/:id | 获取情侣信息 |
| GET | /api/couple/user/:userId | 通过用户ID获取情侣信息 |
| POST | /api/couple/:id/unbind | 解除绑定 |
| POST | /api/couple/:id/regenerate-code | 生成新邀请码 |

#### 日记相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/diary | 创建日记 |
| GET | /api/diary/couple/:coupleId | 获取日记列表 |
| GET | /api/diary/:id | 获取日记详情 |
| POST | /api/diary/:id/like | 点赞 |
| POST | /api/diary/:id/comment | 添加评论 |
| DELETE | /api/diary/:id | 删除日记 |

#### 纪念日相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/anniversary | 创建纪念日 |
| GET | /api/anniversary/couple/:coupleId | 获取纪念日列表 |
| PUT | /api/anniversary/:id | 更新纪念日 |
| DELETE | /api/anniversary/:id | 删除纪念日 |

#### 愿望清单相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/wish | 创建愿望 |
| GET | /api/wish/couple/:coupleId | 获取愿望列表 |
| POST | /api/wish/:id/complete | 完成愿望 |
| DELETE | /api/wish/:id | 删除愿望 |

#### 任务积分相关
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/task/couple/:coupleId | 获取任务列表 |
| POST | /api/task/:id/complete | 完成任务 |
| GET | /api/task/points/:coupleId | 获取积分 |

#### 账单相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/bill | 创建账单 |
| GET | /api/bill/couple/:coupleId | 获取账单列表 |
| DELETE | /api/bill/:id | 删除账单 |

#### 情书相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/letter | 创建情书 |
| GET | /api/letter/couple/:coupleId | 获取情书列表 |
| POST | /api/letter/:id/open | 开启情书 |
| DELETE | /api/letter/:id | 删除情书 |

#### 相册相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/album | 上传照片 |
| GET | /api/album/couple/:coupleId | 获取照片列表 |
| DELETE | /api/album/:id | 删除照片 |

## 数据库表

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| couples | 情侣关系表 |
| diaries | 日记表 |
| anniversary | 纪念日表 |
| wishes | 愿望清单表 |
| tasks | 任务表 |
| points | 积分表 |
| bills | 账单表 |
| letters | 情书表 |
| photos | 相册表 |
| comments | 评论表 |
| likes | 点赞表 |

## 环境变量

```
APPID=wxc148a9c24090a2bb
SECRET=c189e54de4cac1ad7e20e5e7b8c91856
BIND_TEMPLATE_ID=ye6sttAhDmQPb_KxXUIsnpoUH87dn1BAUSsUHMLVoo0
ANNIVERSARY_TEMPLATE_ID=EzWVVfGH0hfcou80ekmjrsqwVzQobr_So4eJwH30xMA
REMIND_HOUR=9
REMIND_MINUTE=0
```

## 部署状态

- ✅ 后端代码已完成
- ✅ 前端代码已完成
- ⏳ 腾讯云托管部署中
- ⏳ 数据库初始化中

---

**最后更新**: 2026-06-14
**维护者**: AI Assistant