import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import DiaryCard from '../../components/DiaryCard';
import ProgressBar from '../../components/ProgressBar';
import { gamesData, loveTreeData, treeStages, getMatchScore } from '../../data/interact';
import { useCoupleStore } from '../../store/useCoupleStore';

const InteractPage: React.FC = () => {
  const { diaries } = useCoupleStore();
  const matchScore = getMatchScore();

  // 获取当前树阶段
  const currentStage = treeStages.find(s => loveTreeData.exp >= s.minExp) || treeStages[0];
  const nextStage = treeStages.find(s => s.minExp > loveTreeData.exp) || treeStages[treeStages.length - 1];
  const progressPercent = nextStage 
    ? Math.round(((loveTreeData.exp - currentStage.minExp) / (nextStage.minExp - currentStage.minExp)) * 100)
    : 100;

  // 浇水
  const handleWater = () => {
    Taro.showToast({ title: '浇水成功！+10经验', icon: 'success' });
  };

  // 施肥
  const handleFertilize = () => {
    Taro.showToast({ title: '施肥成功！+20经验', icon: 'success' });
  };

  // 开始游戏
  const handleGame = (gameId: string) => {
    const game = gamesData.find(g => g.id === gameId);
    if (!game?.isAvailable) {
      Taro.showToast({ title: '游戏开发中...', icon: 'none' });
      return;
    }
    Taro.showToast({ title: `${game.title}即将开始`, icon: 'none' });
  };

  // 写日记
  const handleWriteDiary = () => {
    Taro.showToast({ title: '写日记功能开发中...', icon: 'none' });
  };

  return (
    <ScrollView 
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
    >
      {/* 爱情树 */}
      <View className={styles.treeCard}>
        <View className={styles.treeHeader}>
          <Text className={styles.treeTitle}>我们的爱情树</Text>
          <Text className={styles.treeLevel}>Lv.{loveTreeData.level}</Text>
        </View>
        <View className={styles.treeContent}>
          <Text className={styles.treeIcon}>{currentStage.icon}</Text>
        </View>
        <View className={styles.treeProgress}>
          <View className={styles.treeProgressBar}>
            <View 
              className={styles.treeProgressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
          <Text className={styles.treeProgressText}>
            {loveTreeData.exp}/{nextStage?.minExp || 'MAX'} 经验 · {currentStage.name}
          </Text>
        </View>
        <View className={styles.treeActions}>
          <View className={styles.treeActionBtn} onClick={handleWater}>
            <Text className={styles.treeActionIcon}>💧</Text>
            <Text className={styles.treeActionText}>浇水</Text>
          </View>
          <View className={styles.treeActionBtn} onClick={handleFertilize}>
            <Text className={styles.treeActionIcon}>🌱</Text>
            <Text className={styles.treeActionText}>施肥</Text>
          </View>
        </View>
      </View>

      {/* 默契值 */}
      <View className={styles.matchCard}>
        <View className={styles.matchHeader}>
          <Text className={styles.matchTitle}>默契值</Text>
          <View className={styles.matchScore}>
            <Text className={styles.matchValue}>{matchScore}</Text>
            <Text className={styles.matchUnit}>%</Text>
          </View>
        </View>
        <View className={styles.matchProgress}>
          <ProgressBar percentage={matchScore} color="#FF6B9D" />
        </View>
        <Text className={styles.matchDesc}>
          {matchScore >= 80 ? '你们真是心有灵犀！' : 
           matchScore >= 50 ? '默契还不错，继续加油！' : 
           '需要多了解对方哦~'}
        </Text>
      </View>

      {/* 互动游戏 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>互动游戏</Text>
        </View>
        <View className={styles.gameGrid}>
          {gamesData.map(game => (
            <View 
              key={game.id}
              className={`${styles.gameCard} ${!game.isAvailable ? styles.gameDisabled : ''}`}
              onClick={() => handleGame(game.id)}
            >
              <View className={styles.gameIcon}>
                <Text className={styles.gameIconText}>{game.icon}</Text>
              </View>
              <Text className={styles.gameTitle}>{game.title}</Text>
              <Text className={styles.gameDesc}>{game.description}</Text>
              {!game.isAvailable && (
                <Text className={styles.gameStatus}>开发中</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 心情日记 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>心情日记</Text>
          <Text className={styles.sectionAction}>全部</Text>
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

      {/* 写日记按钮 */}
      <View className={styles.writeDiaryBtn} onClick={handleWriteDiary}>
        <Text className={styles.writeDiaryIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default InteractPage;