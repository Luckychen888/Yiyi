import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  icon: string;
  exchangedCount: number;
  onExchange?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  price,
  icon,
  exchangedCount,
  onExchange
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.iconWrapper}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <View className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.description}>{description}</Text>
        <View className={styles.stats}>
          <Text className={styles.statsText}>{exchangedCount}人已兑换</Text>
        </View>
      </View>
      <View className={styles.action}>
        <View className={styles.price}>
          <Text className={styles.priceValue}>{price}</Text>
          <Text className={styles.priceLabel}>积分</Text>
        </View>
        <Button 
          className={styles.exchangeBtn}
          onClick={onExchange}
        >
          兑换
        </Button>
      </View>
    </View>
  );
};

export default ProductCard;