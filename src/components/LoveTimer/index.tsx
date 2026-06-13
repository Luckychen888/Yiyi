import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface LoveTimerProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LoveTimer: React.FC<LoveTimerProps> = ({ days, hours, minutes, seconds }) => {
  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>我们在一起</Text>
      </View>
      <View className={styles.timer}>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{days}</Text>
          <Text className={styles.timeLabel}>天</Text>
        </View>
        <View className={styles.separator}>
          <Text className={styles.separatorText}>:</Text>
        </View>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{hours}</Text>
          <Text className={styles.timeLabel}>时</Text>
        </View>
        <View className={styles.separator}>
          <Text className={styles.separatorText}>:</Text>
        </View>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{minutes}</Text>
          <Text className={styles.timeLabel}>分</Text>
        </View>
        <View className={styles.separator}>
          <Text className={styles.separatorText}>:</Text>
        </View>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{seconds}</Text>
          <Text className={styles.timeLabel}>秒</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={styles.footerText}>每一秒都是爱你的见证</Text>
      </View>
    </View>
  );
};

export default LoveTimer;