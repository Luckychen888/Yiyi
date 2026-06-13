import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { moodConfig } from '../../data/diaries';
import { useCoupleStore } from '../../store/useCoupleStore';

const defaultMood = { label: '', emoji: '', color: '#ccc' };

const DiaryDetailPage: React.FC = () => {
  const { diaries, likeDiary, addDiary, addComment } = useCoupleStore();
  const [diary, setDiary] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  useDidShow(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.options) {
      const { id } = currentPage.options;
      const foundDiary = diaries.find(d => d.id === id);
      if (foundDiary) {
        setDiary(foundDiary);
        setIsLiked(false);
      }
    }
  });

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.options) {
      const { id } = currentPage.options;
      const foundDiary = diaries.find(d => d.id === id);
      if (foundDiary) {
        setDiary(foundDiary);
      }
    }
  }, [diaries]);

  useShareAppMessage(() => {
    if (!diary) return {
      title: '甜蜜日记 - 恋人空间',
      path: '/pages/diary-detail/index',
      imageUrl: 'https://picsum.photos/id/104/300/300'
    };
    
    const content = diary.content || '';
    const truncatedContent = content.length > 20 
      ? content.substring(0, 20) + '...' 
      : content;
    const images = diary.images || [];
    
    return {
      title: `${truncatedContent} 💌`,
      path: `/pages/diary-detail/index?id=${diary.id}`,
      imageUrl: images[0] || 'https://picsum.photos/id/104/300/300'
    };
  });

  useShareTimeline(() => {
    if (!diary) return {
      title: '甜蜜日记 - 恋人空间',
      query: ''
    };
    
    const content = diary.content || '';
    return {
      title: `${diary.authorName || ''}的日记：${content.substring(0, 50)}...`,
      query: `id=${diary.id}`
    };
  });

  const handleLike = () => {
    if (!diary) return;
    setIsLiked(!isLiked);
    likeDiary(diary.id);
    Taro.showToast({
      title: isLiked ? '取消点赞' : '点赞成功',
      icon: 'none'
    });
  };

  const handleSendComment = () => {
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    if (!diary) return;

    addComment(diary.id, commentText.trim());
    setCommentText('');
    setShowCommentInput(false);
    Taro.showToast({ title: '评论成功', icon: 'success' });
  };

  const handlePreviewImage = (urls: string[], index: number) => {
    Taro.previewImage({
      current: urls[index],
      urls: urls
    });
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

  const mood = moodConfig[diary.mood] || defaultMood;
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
          <Image 
            className={styles.authorAvatar}
            src={diary.authorAvatar || ''}
            mode="aspectFill"
          />
          <View className={styles.authorMeta}>
            <Text className={styles.authorName}>{diary.authorName || ''}</Text>
            <Text className={styles.publishTime}>{formatTime(diary.createdAt)}</Text>
          </View>
        </View>
        {mood.label && (
          <View className={styles.moodBadge} style={{ background: mood.color }}>
            <Text className={styles.moodIcon}>{mood.emoji}</Text>
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
            <View 
              key={index}
              className={styles.imageItem}
              onClick={() => handlePreviewImage(images, index)}
            >
              <Image 
                className={styles.image}
                src={img}
                mode="aspectFill"
                lazyLoad
              />
            </View>
          ))}
        </View>
      )}

      <View className={styles.metaInfo}>
        {diary.location && (
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaText}>{diary.location}</Text>
          </View>
        )}
        {diary.weather && (
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>🌤️</Text>
            <Text className={styles.metaText}>{diary.weather}</Text>
          </View>
        )}
      </View>

      <View className={styles.actionBar}>
        <View 
          className={`${styles.actionItem} ${isLiked ? styles.actionLiked : ''}`}
          onClick={handleLike}
        >
          <Text className={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
          <Text className={styles.actionText}>{diary.likes || 0}</Text>
        </View>
        <View 
          className={styles.actionItem}
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <Text className={styles.actionIcon}>💬</Text>
          <Text className={styles.actionText}>{comments.length}</Text>
        </View>
        <View className={styles.actionItem} onClick={() => {
          Taro.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
          });
        }}>
          <Text className={styles.actionIcon}>📤</Text>
          <Text className={styles.actionText}>分享</Text>
        </View>
      </View>

      {showCommentInput && (
        <View className={styles.commentInput}>
          <Input
            className={styles.input}
            placeholder="写下你的评论..."
            value={commentText}
            onInput={(e: any) => setCommentText(e.detail.value)}
            maxLength={200}
            focus
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
                <Image 
                  className={styles.commentAvatar}
                  src={comment.authorAvatar || ''}
                  mode="aspectFill"
                />
                <View className={styles.commentContent}>
                  <View className={styles.commentMeta}>
                    <Text className={styles.commentAuthor}>{comment.authorName || ''}</Text>
                    <Text className={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                  </View>
                  <Text className={styles.commentText}>{comment.content || ''}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.bottomSpace} />
    </ScrollView>
  );
};

export default DiaryDetailPage;