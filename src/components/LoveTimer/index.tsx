import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface LoveTimerProps {
  days?: number;
  startDate?: string;
}

const LoveTimer: React.FC<LoveTimerProps> = ({ days: propDays, startDate }) => {
  const [loveDays, setLoveDays] = useState(0);
  const [loveHours, setLoveHours] = useState(0);
  const [loveMinutes, setLoveMinutes] = useState(0);
  const [loveSeconds, setLoveSeconds] = useState(0);

  useEffect(() => {
    const calc = () => {
      if (!startDate) {
        setLoveDays(propDays || 0);
        return;
      }
      const start = new Date(startDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setLoveDays(d);
      setLoveHours(h);
      setLoveMinutes(m);
      setLoveSeconds(s);
    };

    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [startDate, propDays]);

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>我们在一起</Text>
      </View>
      <View className={styles.timer}>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{loveDays}</Text>
          <Text className={styles.timeLabel}>天</Text>
        </View>
        <View className={styles.separator}>
          <Text className={styles.separatorText}>:</Text>
        </View>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{String(loveHours).padStart(2, '0')}</Text>
          <Text className={styles.timeLabel}>时</Text>
        </View>
        <View className={styles.separator}>
          <Text className={styles.separatorText}>:</Text>
        </View>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{String(loveMinutes).padStart(2, '0')}</Text>
          <Text className={styles.timeLabel}>分</Text>
        </View>
        <View className={styles.separator}>
          <Text className={styles.separatorText}>:</Text>
        </View>
        <View className={styles.timeItem}>
          <Text className={styles.timeValue}>{String(loveSeconds).padStart(2, '0')}</Text>
          <Text className={styles.timeLabel}>秒</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={styles.footerText}>每一秒都是爱你的见证 💕</Text>
      </View>
    </View>
  );
};

export default LoveTimer;
