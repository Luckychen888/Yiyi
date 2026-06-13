import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showValue?: boolean;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  showValue = true,
  color = '#FF6B9D'
}) => {
  return (
    <View className={styles.container}>
      {label && (
        <View className={styles.header}>
          <Text className={styles.label}>{label}</Text>
          {showValue && (
            <Text className={styles.value}>{percentage}%</Text>
          )}
        </View>
      )}
      <View className={styles.barWrapper}>
        <View 
          className={styles.barFill}
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color
          }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;