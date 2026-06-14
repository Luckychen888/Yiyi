import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { diaryService } from '../../services/api';

const MOOD_OPTIONS = [
  { key: 'happy', label: '开心', emoji: '😊', color: '#FFD93D' },
  { key: 'love', label: '甜蜜', emoji: '🥰', color: '#FF6B9D' },
  { key: 'sad', label: '难过', emoji: '😢', color: '#74B9FF' },
  { key: 'angry', label: '生气', emoji: '😤', color: '#FF6B6B' },
  { key: 'miss', label: '想你', emoji: '🥺', color: '#A29BFE' },
  { key: 'shy', label: '害羞', emoji: '😳', color: '#FFB6C1' },
];

const DiaryDetailPage: React.FC = () => {
  const { couple, likeDiary, addComment, addDiary } = useCoupleStore();
  const [diary, setDiary] = useState<any>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  // 创建模式的表单
  const [formContent, setFormContent] = useState('');
  const [formMood, setFormMood] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useDidShow(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.options) {
      const { id, action } = currentPage.options;
      if (action === 'create') {
        setIsCreateMode(true);
      } else if (id) {
        loadDiaryData(id);
      }
    }
  });

  const loadDiaryData = async (id: string) => {
    try {
      const response: any = await diaryService.getDiaryDetail(id);
      if (response.success && response.data) {
        setDiary(response.data);
      }
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  };

  const handleCreate = async () => {
    if (!formContent.trim()) {
      Taro.showToast({ title: '请输入日记内容', icon: 'none' });
      return;
    }
    if (!couple) {
      Taro.showToast({ title: '请先绑定情侣', icon: 'none' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDiary({
        content: formContent,
        images: [],
        mood: formMood as 'happy' | 'love' | 'sad' | 'angry' | 'miss' | 'shy',
        location: formLocation || undefined,
        weather: undefined,
      });
      Taro.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1000);
    } catch (error) {
      Taro.showToast({ title: '发布失败', icon: 'none' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (!diary) return;
    setIsLiked(!isLiked);
    likeDiary(diary.id);
    Taro.showToast({ title: isLiked ? '取消点赞' : '点赞成功', icon: 'none' });
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !diary) return;
    await addComment(diary.id, commentText.trim());
    setCommentText('');
    setShowCommentInput(false);
    Taro.showToast({ title: '评论成功', icon: 'success' });
    loadDiaryData(diary.id);
  };

  const handlePreviewImage = (urls: string[], index: number) => {
    Taro.previewImage({ current: urls[index], urls });
  };

  const formatTime = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // ===== 创建日记模式 =====
  if (isCreateMode) {
    return (
      <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
        <View className={styles.backButton} onClick={() => Taro.navigateBack()}>
          <Text className={styles.backIcon}>‹</Text>
          <Text className={styles.backText}>返回</Text>
        </View>

        <View className={styles.createHeader}>
          <Text className={styles.createTitle}>📝 写日记</Text>
          <Text className={styles.createDesc}>记录今天的甜蜜时刻</Text>
        </View>

        {/* 选择心情 */}
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>今天的心情</Text>
          <View className={styles.moodGrid}>
            {MOOD_OPTIONS.map(mood => (
              <View
                key={mood.key}
                className={`${styles.moodItem} ${formMood === mood.key ? styles.moodActive : ''}`}
                style={formMood === mood.key ? { borderColor: mood.color, background: mood.color + '15' } : {}}
                onClick={() => setFormMood(mood.key)}
              >
                <Text className={styles.moodEmoji}>{mood.emoji}</Text>
                <Text className={styles.moodLabel}>{mood.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 日记内容 */}
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>日记内容 *</Text>
          <Textarea
            className={styles.createTextarea}
            placeholder="写下今天的心情和故事..."
            value={formContent}
            onInput={(e: any) => setFormContent(e.detail.value)}
            maxLength={2000}
            autoHeight
          />
          <Text className={styles.charCount}>{formContent.length}/2000</Text>
        </View>

        {/* 位置 */}
        <View className={styles.section}>
          <Text className={styles.sectionLabel}>📍 位置（选填）</Text>
          <Textarea
            className={styles.createInput}
            placeholder="记录今天在哪里..."
            value={formLocation}
            onInput={(e: any) => setFormLocation(e.detail.value)}
            maxLength={50}
            autoHeight
            style={{ minHeight: '80rpx' }}
          />
        </View>

        {/* 发布按钮 */}
        <View className={styles.publishBtnWrap}>
          <Button
            className={styles.publishBtn}
            onClick={handleCreate}
            loading={isSubmitting}
            disabled={isSubmitting || !formContent.trim()}
          >
            <Text style={{ color: '#fff', fontSize: '30rpx', fontWeight: '600' }}>
              {isSubmitting ? '发布中...' : '发布日记 📝'}
            </Text>
          </Button>
        </View>
      </ScrollView>
    );
  }

  // ===== 查看日记模式 =====
  if (!diary) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyText}>日记不存在</Text>
        </View>
      </View>
    );
  }

  const mood = MOOD_OPTIONS.find(m => m.key === diary.mood);
  const images = diary.images || [];
  const comments = diary.comments || [];

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.backButton} onClick={() => Taro.navigateBack()}>
        <Text className={styles.backIcon}>‹</Text>
        <Text className={styles.backText}>返回</Text>
      </View>

      <View className={styles.authorCard}>
        <View className={styles.authorInfo}>
          <Image className={styles.authorAvatar} src={diary.authorAvatar || ''} mode="aspectFill" />
          <View className={styles.authorMeta}>
            <Text className={styles.authorName}>{diary.authorName || ''}</Text>
            <Text className={styles.publishTime}>{formatTime(diary.createdAt || diary.created_at)}</Text>
          </View>
        </View>
        {mood && (
          <View className={styles.moodBadge} style={{ background: mood.color + '20' }}>
            <Text>{mood.emoji}</Text>
            <Text className={styles.moodText}>{mood.label}</Text>
          </View>
        )}
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.contentText}>{diary.content || ''}</Text>
      </View>

      {images.length > 0 && (
        <View className={styles.imageGrid}>
          {images.map((img: string, index: number) => (
            <View key={index} className={styles.imageItem} onClick={() => handlePreviewImage(images, index)}>
              <Image className={styles.image} src={img} mode="aspectFill" lazyLoad />
            </View>
          ))}
        </View>
      )}

      {(diary.location || diary.weather) && (
        <View className={styles.metaInfo}>
          {diary.location && <View className={styles.metaItem}><Text>📍</Text><Text>{diary.location}</Text></View>}
          {diary.weather && <View className={styles.metaItem}><Text>🌤️</Text><Text>{diary.weather}</Text></View>}
        </View>
      )}

      <View className={styles.actionBar}>
        <View className={`${styles.actionItem} ${isLiked ? styles.actionLiked : ''}`} onClick={handleLike}>
          <Text className={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text className={styles.actionText}>{diary.likes || 0}</Text>
        </View>
        <View className={styles.actionItem} onClick={() => setShowCommentInput(!showCommentInput)}>
          <Text className={styles.actionIcon}>💬</Text>
          <Text className={styles.actionText}>{comments.length}</Text>
        </View>
      </View>

      {showCommentInput && (
        <View className={styles.commentInput}>
          <Textarea
            className={styles.commentTextarea}
            placeholder="写下你的评论..."
            value={commentText}
            onInput={(e: any) => setCommentText(e.detail.value)}
            maxLength={200}
            autoHeight
            style={{ minHeight: '120rpx' }}
          />
          <Button className={styles.sendButton} onClick={handleSendComment}>
            <Text className={styles.sendButtonText}>发送</Text>
          </Button>
        </View>
      )}

      <View className={styles.commentSection}>
        <View className={styles.commentHeader}>
          <Text className={styles.commentTitle}>评论</Text>
          <Text className={styles.commentCount}>{comments.length}条</Text>
        </View>

        {comments.length === 0 ? (
          <View className={styles.commentEmpty}>
            <Text className={styles.commentEmptyText}>还没有评论，快来第一条吧~</Text>
          </View>
        ) : (
          <View className={styles.commentList}>
            {comments.map((comment: any) => (
              <View key={comment.id} className={styles.commentItem}>
                <Image className={styles.commentAvatar} src={comment.authorAvatar || ''} mode="aspectFill" />
                <View className={styles.commentContent}>
                  <View className={styles.commentMeta}>
                    <Text className={styles.commentAuthor}>{comment.authorName || ''}</Text>
                    <Text className={styles.commentTime}>{formatTime(comment.createdAt || comment.created_at)}</Text>
                  </View>
                  <Text className={styles.commentText}>{comment.content || ''}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DiaryDetailPage;
