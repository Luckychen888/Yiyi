/**
 * 数据库迁移脚本 v1.0
 * 添加游客登录支持和is_guest字段
 */

USE wxcloudrun;

-- 为用户表添加is_guest字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest TINYINT(1) DEFAULT 0 COMMENT '是否游客' AFTER avatar;
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_guest (is_guest);

SELECT '数据库迁移完成!' AS message;
