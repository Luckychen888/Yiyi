import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProgressBar from '../../components/ProgressBar';
import { wishesData, getWishStats, getCategories } from '../../data/wishes';
import { formatDate } from '../../utils';

const WishPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const wishStats = getWishStats();
  const categories = ['全部', ...getCategories()];

  // 筛选愿望
  const filteredWishes = activeCategory === '全部' 
    ? wishesData 
    : wishesData.filter(w => w.category === activeCategory);

  // 点击愿望
  const handleWishClick = (wishId: string) => {
    const wish = wishesData.find(w => w.id === wishId);
    if (wish?.isCompleted) {
      Taro.showToast({ title: '已完成！', icon: 'success' });
    } else {
      Taro.showToast({ title: '打卡功能开发中...', icon: 'none' });
    }
  };

  return (
    <ScrollView 
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
    >
      {/* 进度卡片 */}
      <View className={styles.progressCard}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressTitle}>100件小事</Text>
          <View className={styles.progressStats}>
            <Text className={styles.progressValue}>{wishStats.completed}</Text>
            <Text className={styles.progressUnit}>/{wishStats.total}</Text>
          </View>
        </View>
        <View className={styles.progressBar}>
          <View 
            className={styles.progressFill}
            style={{ width: `${wishStats.percentage}%` }}
          />
        </View>
        <Text className={styles.progressDesc}>
          {wishStats.percentage >= 80 ? '太棒了！即将解锁惊喜彩蛋！' :
           wishStats.percentage >= 50 ? '继续加油，一起完成更多愿望！' :
           '开始你们的甜蜜旅程吧~'}
        </Text>
      </View>

      {/* 分类筛选 */}
      <View className={styles.categoryFilter}>
        {categories.map(category => (
          <View 
            key={category}
            className={classnames(
              styles.categoryItem,
              activeCategory === category && styles.categoryItemActive
            )}
            onClick={() => setActiveCategory(category)}
          >
            <Text 
              className={classnames(
                styles.categoryText,
                activeCategory === category && styles.categoryTextActive
              )}
            >
              {category}
            </Text>
          </View>
        ))}
      </View>

      {/* 愿望列表 */}
      <View className={styles.wishList}>
        {filteredWishes.map(wish => (
          <View 
            key={wish.id}
            className={classnames(
              styles.wishCard,
              wish.isCompleted && styles.wishCardCompleted
            )}
            onClick={() => handleWishClick(wish.id)}
          >
            {wish.photoUrl && (
              <View className={styles.wishPhotoWrapper}>
                <Image 
                  className={styles.wishPhoto}
                  src={wish.photoUrl}
                  mode="aspectFill"
                />
                {wish.isCompleted && (
                  <View className={styles.wishCompletedBadge}>
                    <Text className={styles.wishBadgeText}>✓</Text>
                  </View>
                )}
              </View>
            )}
            <View className={styles.wishContent}>
              <View className={styles.wishHeader}>
                <Text className={styles.wishIcon}>{wish.icon}</Text>
                <View className={styles.wishCategoryTag}>
                  <Text className={styles.wishCategoryText}>{wish.category}</Text>
                </View>
              </View>
              <Text className={styles.wishTitle}>{wish.title}</Text>
              <Text className={styles.wishDescription}>{wish.description}</Text>
            </View>
            {!wish.isCompleted && (
              <View className={styles.wishActionHint}>
                <Text className={styles.wishHintText}>点击打卡</Text>
              </View>
            )}
            {wish.isCompleted && wish.completedAt && (
              <View className={styles.wishCompletedInfo}>
                <Text className={styles.wishCompletedIcon}>✅</Text>
                <Text className={styles.wishCompletedText}>
                  完成于 {formatDate(wish.completedAt, 'YYYY-MM-DD')}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default WishPage;