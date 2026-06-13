import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import styles from './index.module.scss';
import LoveTimer from '../../components/LoveTimer';
import AnniversaryCard from '../../components/AnniversaryCard';
import DiaryCard from '../../components/DiaryCard';
import ProgressBar from '../../components/ProgressBar';
import { useLoveTimer } from '../../hooks/useLoveDays';
import { useCoupleStore } from '../../store/useCoupleStore';
import { anniversariesData, getDaysUntil } from '../../data/anniversaries';
import { getWishStats } from '../../data/wishes';
import { getTodayTaskStats } from '../../data/shop';
import { getRandomLoveWord } from '../../utils';

const HomePage: React.FC = () => {
  const { couple, loveDays, diaries } = useCoupleStore();
  const timer = useLoveTimer(couple?.startDate || '2024-01-01');
  const [loveWord, setLoveWord] = useState('');

  useEffect(() => {
    setLoveWord(getRandomLoveWord());
    
    // 检查登录状态
    const isLogin = Taro.getStorageSync('isLogin');
    const userId = Taro.getStorageSync('userId');
    
    if (!isLogin || !userId) {
      // 未登录，跳转到登录页
      Taro.redirectTo({
        url: '/pages/login/index'
      });
    }
  }, []);

  // 分享给朋友
  useShareAppMessage(() => {
    return {
      title: `我们在一起${loveDays}天啦！💕`,
      path: '/pages/home/index',
      imageUrl: couple?.user1Avatar || 'https://picsum.photos/id/101/300/300'
    };
  });

  // 分享到朋友圈
  useShareTimeline(() => {
    return {
      title: `恋人空间 - 记录我们的${loveDays}天 💕`,
      query: '',
      imageUrl: couple?.user1Avatar || 'https://picsum.photos/id/101/300/300'
    };
  });

  // 获取即将到来的纪念日
  const upcomingAnniversaries = anniversariesData
    .map(anni => ({
      ...anni,
      daysLeft: getDaysUntil(anni.date)
    }))
    .filter(anni => anni.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  // 获取统计数据
  const wishStats = getWishStats();
  const taskStats = getTodayTaskStats();

  // 快捷操作
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'diary':
        Taro.navigateTo({ url: '/pages/interact/index' });
        break;
      case 'checkin':
        Taro.showToast({ title: '打卡成功！', icon: 'success' });
        break;
      case 'water':
        Taro.showToast({ title: '浇水成功！', icon: 'success' });
        break;
      case 'wish':
        Taro.navigateTo({ url: '/pages/wish/index' });
        break;
    }
  };

  return (
    <ScrollView 
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
    >
      {/* 头部情侣信息 */}
      <View className={styles.header}>
        <View className={styles.coupleInfo}>
          <Image 
            className={styles.avatar}
            src={couple?.user1Avatar || ''}
            mode="aspectFill"
          />
          <Text className={styles.heart}>❤️</Text>
          <Image 
            className={styles.avatar}
            src={couple?.user2Avatar || ''}
            mode="aspectFill"
          />
        </View>
        <Text className={styles.headerTitle}>{couple?.user1Name} & {couple?.user2Name}</Text>
      </View>

      {/* 恋爱计时器 */}
      <LoveTimer 
        days={timer.days}
        hours={timer.hours}
        minutes={timer.minutes}
        seconds={timer.seconds}
      />

      {/* 快捷操作 */}
      <View className={styles.quickActions}>
        <View 
          className={styles.quickAction}
          onClick={() => handleQuickAction('diary')}
        >
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>📝</Text>
          </View>
          <Text className={styles.quickActionText}>写日记</Text>
        </View>
        <View 
          className={styles.quickAction}
          onClick={() => handleQuickAction('checkin')}
        >
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>打卡</Text>
          </View>
          <Text className={styles.quickActionText}>想你打卡</Text>
        </View>
        <View 
          className={styles.quickAction}
          onClick={() => handleQuickAction('water')}
        >
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>💧</Text>
          </View>
          <Text className={styles.quickActionText}>浇水</Text>
        </View>
        <View 
          className={styles.quickAction}
          onClick={() => handleQuickAction('wish')}
        >
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>✨</Text>
          </View>
          <Text className={styles.quickActionText}>愿望</Text>
        </View>
      </View>

      {/* 今日情话 */}
      <View className={styles.loveWordCard}>
        <Text className={styles.loveWordText}>{loveWord}</Text>
        <Text className={styles.loveWordAuthor}>—— 今日情话</Text>
      </View>

      {/* 数据统计 */}
      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{loveDays}</Text>
          <Text className={styles.statLabel}>恋爱天数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{wishStats.completed}</Text>
          <Text className={styles.statLabel}>愿望达成</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{taskStats.points}</Text>
          <Text className={styles.statLabel}>今日积分</Text>
        </View>
      </View>

      {/* 纪念日倒计时 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>即将到来</Text>
          <Text 
            className={styles.sectionAction}
            onClick={() => Taro.navigateTo({ url: '/pages/anniversary/index' })}
          >
            查看全部
          </Text>
        </View>
        {upcomingAnniversaries.map(anni => (
          <AnniversaryCard
            key={anni.id}
            title={anni.title}
            date={anni.date}
            icon={anni.icon}
            daysLeft={anni.daysLeft}
            type={anni.type}
          />
        ))}
      </View>

      {/* 愿望进度 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>愿望进度</Text>
          <Text 
            className={styles.sectionAction}
            onClick={() => Taro.navigateTo({ url: '/pages/wish/index' })}
          >
            {wishStats.completed}/{wishStats.total}
          </Text>
        </View>
        <ProgressBar 
          percentage={wishStats.percentage}
          label="100件小事完成度"
          color="#FF6B9D"
        />
      </View>

      {/* 最近日记 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>甜蜜瞬间</Text>
          <Text 
            className={styles.sectionAction}
            onClick={() => Taro.navigateTo({ url: '/pages/interact/index' })}
          >
            更多
          </Text>
        </View>
        <View className={styles.diaryList}>
          {diaries.slice(0, 3).map(diary => (
            <DiaryCard 
              key={diary.id}
              diary={diary}
              onClick={() => Taro.navigateTo({ url: `/pages/diary-detail/index?id=${diary.id}` })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;