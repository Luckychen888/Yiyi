import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  return (
    <View className={styles.page}>
      <Text className={styles.title}>恋人空间</Text>
      <Text className={styles.subtitle}>首页测试</Text>
    </View>
  );
};

export default HomePage;