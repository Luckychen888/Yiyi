-- 情书音乐字段迁移
ALTER TABLE letters ADD COLUMN music_url VARCHAR(500) DEFAULT NULL COMMENT '背景音乐URL' AFTER voice_url;
ALTER TABLE letters ADD COLUMN music_name VARCHAR(100) DEFAULT NULL COMMENT '音乐名称' AFTER music_url;
SELECT '音乐字段迁移完成!' AS message;
