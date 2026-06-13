import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface WishCardProps {
  title: string;
  description: string;
  icon: string;
  category: string;
  isCompleted: boolean;
  photoUrl?: string;
  onClick?: () => void;
}

const WishCard: React.FC<WishCardProps> = ({
  title,
  description,
  icon,
  category,
  isCompleted,
  photoUrl,
  onClick
}) => {
  return (
    <View 
      className={classnames(styles.container, isCompleted && styles.completed)}
      onClick={onClick}
    >
      {photoUrl && (
        <View className={styles.photoWrapper}>
          <Image 
            className={styles.photo}
            src={photoUrl}
            mode="aspectFill"
          />
          {isCompleted && (
            <View className={styles.completedBadge}>
              <Text className={styles.badgeText}>✓</Text>
            </View>
          )}
        </View>
      )}
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.icon}>{icon}</Text>
          <View className={styles.categoryTag}>
            <Text className={styles.categoryText}>{category}</Text>
          </View>
        </View>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.description}>{description}</Text>
      </View>
      {!isCompleted && (
        <View className={styles.actionHint}>
          <Text className={styles.hintText}>点击打卡</Text>
        </View>
      )}
    </View>
  );
};

export default WishCard;