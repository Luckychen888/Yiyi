-- 情书音乐字段迁移
ALTER TABLE letters ADD COLUMN music_url VARCHAR(500) DEFAULT NULL COMMENT '背景音乐URL' AFTER voice_url;
ALTER TABLE letters ADD COLUMN music_name VARCHAR(100) DEFAULT NULL COMMENT '音乐名称' AFTER music_url;
-- 情书模板字段迁移
ALTER TABLE letters ADD COLUMN template VARCHAR(50) DEFAULT 'romantic' COMMENT '模板ID' AFTER music_name;
SELECT '音乐和模板字段迁移完成!' AS message;
