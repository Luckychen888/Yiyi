import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const LetterDetailPage: React.FC = () => {
  return (
    <View className={styles.page}>
      <Text className={styles.title}>时光胶囊</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  );
};

export default LetterDetailPage;