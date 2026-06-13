import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const BillDetailPage: React.FC = () => {
  return (
    <View className={styles.page}>
      <Text className={styles.title}>共同记账</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  );
};

export default BillDetailPage;