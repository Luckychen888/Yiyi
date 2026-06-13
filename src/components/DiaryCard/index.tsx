import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import type { Diary } from '../../types/diary';
import { moodConfig } from '../../data/diaries';
import { formatRelativeTime } from '../../utils';

interface DiaryCardProps {
  diary: Diary;
  onClick?: () => void;
}

const defaultMood = { label: '', emoji: '', color: '#ccc' };

const DiaryCard: React.FC<DiaryCardProps> = ({ diary, onClick }) => {
  const mood = moodConfig[diary.mood] || defaultMood;
  const images = diary.images || [];
  const comments = diary.comments || [];

  return (
    <View className={styles.container} onClick={onClick}>
      <View className={styles.header}>
        <Image 
          className={styles.avatar}
          src={diary.authorAvatar || ''}
          mode="aspectFill"
        />
        <View className={styles.authorInfo}>
          <Text className={styles.authorName}>{diary.authorName || ''}</Text>
          <Text className={styles.time}>{formatRelativeTime(diary.createdAt)}</Text>
        </View>
        {mood.label && (
          <View className={styles.moodTag} style={{ backgroundColor: mood.color }}>
            <Text className={styles.moodEmoji}>{mood.emoji}</Text>
            <Text className={styles.moodLabel}>{mood.label}</Text>
          </View>
        )}
      </View>
      
      <View className={styles.content}>
        <Text className={styles.text}>{diary.content || ''}</Text>
        {diary.location && (
          <View className={styles.location}>
            <Text className={styles.locationIcon}>📍</Text>
            <Text className={styles.locationText}>{diary.location}</Text>
          </View>
        )}
      </View>

      {images.length > 0 && (
        <ScrollView 
          className={styles.images}
          scrollX
          enhanced
          showScrollbar={false}
        >
          {images.map((img, index) => (
            <Image 
              key={index}
              className={styles.image}
              src={img}
              mode="aspectFill"
            />
          ))}
        </ScrollView>
      )}

      <View className={styles.footer}>
        <View className={styles.likes}>
          <Text className={styles.likesIcon}>❤️</Text>
          <Text className={styles.likesCount}>{diary.likes || 0}</Text>
        </View>
        <View className={styles.comments}>
          <Text className={styles.commentsIcon}>💬</Text>
          <Text className={styles.commentsCount}>{comments.length}</Text>
        </View>
      </View>
    </View>
  );
};

export default DiaryCard;