/**
 * 恋人空间 - 数据库初始化脚本
 * 
 * 使用说明：
 * 1. 登录数据库: mysql -h <host> -u root -p
 * 2. 运行此脚本: source init_db.sql;
 */

CREATE DATABASE IF NOT EXISTS wxcloudrun CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wxcloudrun;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY COMMENT '用户ID',
  openid VARCHAR(128) DEFAULT NULL COMMENT '微信OpenID',
  nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 情侣关系表
CREATE TABLE IF NOT EXISTS couples (
  id VARCHAR(50) PRIMARY KEY COMMENT '情侣ID',
  user1_id VARCHAR(50) DEFAULT NULL COMMENT '用户1ID',
  user1_name VARCHAR(50) DEFAULT NULL COMMENT '用户1昵称',
  user1_avatar VARCHAR(500) DEFAULT NULL COMMENT '用户1头像',
  user2_id VARCHAR(50) DEFAULT NULL COMMENT '用户2ID',
  user2_name VARCHAR(50) DEFAULT NULL COMMENT '用户2昵称',
  user2_avatar VARCHAR(500) DEFAULT NULL COMMENT '用户2头像',
  invite_code VARCHAR(20) UNIQUE COMMENT '邀请码',
  start_date DATE DEFAULT NULL COMMENT '在一起开始日期',
  points INT DEFAULT 0 COMMENT '积分',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user1 (user1_id),
  INDEX idx_user2 (user2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='情侣关系表';

-- 日记表
CREATE TABLE IF NOT EXISTS diaries (
  id VARCHAR(50) PRIMARY KEY COMMENT '日记ID',
  couple_id VARCHAR(50) DEFAULT NULL COMMENT '情侣ID',
  author_id VARCHAR(50) DEFAULT NULL COMMENT '作者ID',
  author_name VARCHAR(50) DEFAULT NULL COMMENT '作者昵称',
  author_avatar VARCHAR(500) DEFAULT NULL COMMENT '作者头像',
  content TEXT COMMENT '日记内容',
  images JSON COMMENT '图片列表',
  mood VARCHAR(20) DEFAULT NULL COMMENT '心情',
  location VARCHAR(100) DEFAULT NULL COMMENT '位置',
  weather VARCHAR(50) DEFAULT NULL COMMENT '天气',
  likes INT DEFAULT 0 COMMENT '点赞数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_couple (couple_id),
  INDEX idx_author (author_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日记表';

-- 日记评论表
CREATE TABLE IF NOT EXISTS diary_comments (
  id VARCHAR(50) PRIMARY KEY COMMENT '评论ID',
  diary_id VARCHAR(50) DEFAULT NULL COMMENT '日记ID',
  author_id VARCHAR(50) DEFAULT NULL COMMENT '评论者ID',
  author_name VARCHAR(50) DEFAULT NULL COMMENT '评论者昵称',
  author_avatar VARCHAR(500) DEFAULT NULL COMMENT '评论者头像',
  content TEXT COMMENT '评论内容',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_diary (diary_id),
  INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日记评论表';

-- 日记点赞表
CREATE TABLE IF NOT EXISTS diary_likes (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
  diary_id VARCHAR(50) DEFAULT NULL COMMENT '日记ID',
  user_id VARCHAR(50) DEFAULT NULL COMMENT '用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE INDEX idx_diary_user (diary_id, user_id),
  INDEX idx_diary (diary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='日记点赞表';

-- 纪念日表
CREATE TABLE IF NOT EXISTS anniversaries (
  id VARCHAR(50) PRIMARY KEY COMMENT '纪念日ID',
  couple_id VARCHAR(50) DEFAULT NULL COMMENT '情侣ID',
  title VARCHAR(100) NOT NULL COMMENT '标题',
  description TEXT DEFAULT NULL COMMENT '描述',
  date DATE NOT NULL COMMENT '日期',
  type VARCHAR(20) DEFAULT 'custom' COMMENT '类型: love/birthday/custom',
  icon VARCHAR(10) DEFAULT '🎂' COMMENT '图标',
  remind_days INT DEFAULT 0 COMMENT '提前提醒天数',
  is_remind TINYINT(1) DEFAULT 0 COMMENT '是否提醒',
  remind_time VARCHAR(10) DEFAULT '09:00' COMMENT '提醒时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_couple (couple_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='纪念日表';

-- 愿望清单表
CREATE TABLE IF NOT EXISTS wishes (
  id VARCHAR(50) PRIMARY KEY COMMENT '愿望ID',
  couple_id VARCHAR(50) DEFAULT NULL COMMENT '情侣ID',
  title VARCHAR(100) NOT NULL COMMENT '愿望标题',
  description TEXT DEFAULT NULL COMMENT '愿望描述',
  icon VARCHAR(10) DEFAULT '✨' COMMENT '图标',
  target_date DATE DEFAULT NULL COMMENT '目标日期',
  is_completed TINYINT(1) DEFAULT 0 COMMENT '是否完成',
  completed_by VARCHAR(50) DEFAULT NULL COMMENT '完成者ID',
  completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_couple (couple_id),
  INDEX idx_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='愿望清单表';

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY COMMENT '任务ID',
  couple_id VARCHAR(50) DEFAULT '0' COMMENT '情侣ID(0为全局任务)',
  title VARCHAR(100) NOT NULL COMMENT '任务标题',
  description TEXT DEFAULT NULL COMMENT '任务描述',
  points INT DEFAULT 10 COMMENT '奖励积分',
  is_daily TINYINT(1) DEFAULT 0 COMMENT '是否每日任务',
  is_completed TINYINT(1) DEFAULT 0 COMMENT '是否完成',
  completed_by VARCHAR(50) DEFAULT NULL COMMENT '完成者ID',
  completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_couple (couple_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 插入默认全局任务
INSERT IGNORE INTO tasks (id, couple_id, title, description, points, is_daily) VALUES
('task_daily_checkin', '0', '每日签到', '每天签到获得积分', 5, 1),
('task_write_diary', '0', '写日记', '记录一天的美好', 10, 1),
('task_complete_wish', '0', '完成心愿', '完成一个愿望清单', 20, 0),
('task_set_anniversary', '0', '纪念日提醒', '设置一个纪念日提醒', 15, 0);

SELECT '数据库初始化完成!' AS message;