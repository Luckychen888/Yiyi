import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import DiaryCard from '../../components/DiaryCard';
import LoveTimer from '../../components/LoveTimer';
import { loveWords } from '../../data/interact';

const HomePage: React.FC = () => {
  const { 
    couple, 
    isBound, 
    currentUserName, 
    currentUserAvatar, 
    diaries, 
    anniversaries,
    calculateLoveDays,
    initFromStorage,
    loadAllData
  } = useCoupleStore();
  
  const [loveDay, setLoveDay] = useState(0);
  const [currentLoveWord, setCurrentLoveWord] = useState('');

  useEffect(() => {
    initFromStorage();
    const days = calculateLoveDays();
    setLoveDay(days);
    
    const randomIndex = Math.floor(Math.random() * loveWords.length);
    setCurrentLoveWord(loveWords[randomIndex]);
    
    if (couple) {
      loadAllData();
    }
  }, [couple?.id]);

  const handleQuickAction = (type: string) => {
    switch (type) {
      case 'diary':
        Taro.navigateTo({ url: '/pages/interact/index' });
        break;
      case 'anniversary':
        Taro.navigateTo({ url: '/pages/anniversary/index' });
        break;
      case 'album':
        Taro.navigateTo({ url: '/pages/album/index' });
        break;
      case 'wish':
        Taro.navigateTo({ url: '/pages/wish/index' });
        break;
      default:
        break;
    }
  };

  const handleDiaryClick = (diaryId: string) => {
    Taro.navigateTo({ url: `/pages/diary-detail/index?id=${diaryId}` });
  };

  const handleGoBind = () => {
    Taro.navigateTo({ url: '/pages/bind/index' });
  };

  const upcomingAnniversary = anniversaries?.[0];
  const recentDiaries = diaries?.slice(0, 3) || [];

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <View className={styles.coupleInfo}>
          {isBound && couple ? (
            <>
              <Image 
                className={styles.avatar} 
                src={couple.user1Avatar || ''} 
                mode="aspectFill" 
              />
              <Text className={styles.heart}>❤️</Text>
              <Image 
                className={styles.avatar} 
                src={couple.user2Avatar || ''} 
                mode="aspectFill" 
              />
            </>
          ) : (
            <Image 
              className={styles.avatar} 
              src={currentUserAvatar || ''} 
              mode="aspectFill" 
            />
          )}
        </View>
        <View className={styles.headerRight}>
          <Text className={styles.userName}>
            {isBound && couple 
              ? `${couple.user1Name} & ${couple.user2Name}` 
              : currentUserName}
          </Text>
        </View>
      </View>

      {isBound && couple && (
        <LoveTimer days={loveDay} startDate={couple.startDate} />
      )}

      {!isBound && (
        <View className={styles.unboundCard} onClick={handleGoBind}>
          <Text className={styles.unboundIcon}>💑</Text>
          <Text className={styles.unboundText}>点击绑定你的另一半</Text>
          <Text className={styles.unboundArrow}>→</Text>
        </View>
      )}

      <View className={styles.quickActions}>
        <View className={styles.quickAction} onClick={() => handleQuickAction('diary')}>
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>📝</Text>
          </View>
          <Text className={styles.quickActionText}>写日记</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleQuickAction('anniversary')}>
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>🎂</Text>
          </View>
          <Text className={styles.quickActionText}>纪念日</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleQuickAction('album')}>
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>📷</Text>
          </View>
          <Text className={styles.quickActionText}>相册</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleQuickAction('wish')}>
          <View className={styles.quickActionIcon}>
            <Text className={styles.quickActionIconText}>⭐</Text>
          </View>
          <Text className={styles.quickActionText}>愿望</Text>
        </View>
      </View>

      {isBound && couple && (
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{loveDay}</Text>
            <Text className={styles.statLabel}>恋爱天数</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{recentDiaries.length}</Text>
            <Text className={styles.statLabel}>甜蜜日记</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{anniversaries?.length || 0}</Text>
            <Text className={styles.statLabel}>重要日子</Text>
          </View>
        </View>
      )}

      <View className={styles.loveWordCard}>
        <Text className={styles.loveWordText}>「{currentLoveWord}」</Text>
        <Text className={styles.loveWordAuthor}>—— 来自恋人空间</Text>
      </View>

      {upcomingAnniversary && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>即将到来</Text>
            <Text className={styles.sectionAction} onClick={() => handleQuickAction('anniversary')}>查看全部</Text>
          </View>
          <View className={styles.anniversaryCard}>
            <Text className={styles.anniversaryIcon}>{upcomingAnniversary.icon}</Text>
            <View className={styles.anniversaryInfo}>
              <Text className={styles.anniversaryTitle}>{upcomingAnniversary.title}</Text>
              <Text className={styles.anniversaryDate}>{upcomingAnniversary.date}</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>甜蜜日记</Text>
          <Text className={styles.sectionAction} onClick={() => handleQuickAction('diary')}>查看全部</Text>
        </View>
        <View className={styles.diaryList}>
          {recentDiaries.map(diary => (
            <DiaryCard 
              key={diary.id} 
              diary={diary} 
              onClick={() => handleDiaryClick(diary.id)} 
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;