import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface AnniversaryCardProps {
  title: string;
  date: string;
  icon: string;
  daysLeft: number;
  type: 'love' | 'birthday' | 'custom';
}

const AnniversaryCard: React.FC<AnniversaryCardProps> = ({
  title,
  date,
  icon,
  daysLeft,
  type
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'love':
        return '#FF6B9D';
      case 'birthday':
        return '#FFD93D';
      case 'custom':
        return '#74B9FF';
      default:
        return '#FF6B9D';
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.iconWrapper} style={{ backgroundColor: getTypeColor() }}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <View className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.date}>{date}</Text>
      </View>
      <View className={styles.daysLeft}>
        <Text className={styles.daysValue}>{daysLeft}</Text>
        <Text className={styles.daysLabel}>天</Text>
      </View>
    </View>
  );
};

export default AnniversaryCard;