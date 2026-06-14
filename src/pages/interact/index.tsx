import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import DiaryCard from '../../components/DiaryCard';
import { useCoupleStore } from '../../store/useCoupleStore';

// 配置数据（静态，不会变化）
const GAMES = [
  { id: 'game_001', title: '默契问答', description: '测试你们的默契程度', type: 'quiz', icon: '🎯', available: true },
  { id: 'game_002', title: '你画我猜', description: '一人画一人猜，看谁猜得准', type: 'draw', icon: '🎨', available: true },
  { id: 'game_003', title: '真心话大冒险', description: '经典互动游戏，增进了解', type: 'truth', icon: '💬', available: true },
  { id: 'game_004', title: '情侣连连看', description: '配对你们的共同记忆', type: 'puzzle', icon: '🧩', available: false },
];

const TREE_STAGES = [
  { stage: 1, name: '种子', minExp: 0, icon: '🌱' },
  { stage: 2, name: '幼苗', minExp: 100, icon: '🌿' },
  { stage: 3, name: '小树', minExp: 300, icon: '🌳' },
  { stage: 4, name: '开花', minExp: 600, icon: '🌸' },
  { stage: 5, name: '结果', minExp: 1000, icon: '🍎' },
  { stage: 6, name: '茂盛', minExp: 1500, icon: '🌲' },
  { stage: 7, name: '永恒', minExp: 2500, icon: '❤️' },
];

const QUIZZES = [
  { id: 'q1', question: '对方最喜欢的食物？', options: ['火锅', '烧烤', '日料', '西餐'], match: true },
  { id: 'q2', question: '对方最害怕什么？', options: ['虫子', '鬼', '高处', '孤独'], match: true },
  { id: 'q3', question: '对方最想去的地方？', options: ['日本', '欧洲', '海边', '雪山'], match: false },
  { id: 'q4', question: '对方最喜欢的电影？', options: ['爱情', '喜剧', '科幻', '恐怖'], match: true },
  { id: 'q5', question: '对方生气时会？', options: ['不说话', '吃东西', '逛街', '睡觉'], match: false },
];

const InteractPage: React.FC = () => {
  const { diaries } = useCoupleStore();
  const [treeExp, setTreeExp] = useState(450);
  const [waterCount, setWaterCount] = useState(28);
  const [fertilizerCount, setFertilizerCount] = useState(12);

  useEffect(() => {
    const isLogin = Taro.getStorageSync('isLogin');
    if (!isLogin) {
      Taro.redirectTo({ url: '/pages/login/index' });
    }
  }, []);

  const matchScore = Math.round((QUIZZES.filter(q => q.match).length / QUIZZES.length) * 100);
  const currentStage = TREE_STAGES.find(s => treeExp >= s.minExp) || TREE_STAGES[0];
  const nextStage = TREE_STAGES.find(s => s.minExp > treeExp) || TREE_STAGES[TREE_STAGES.length - 1];
  const progressPercent = nextStage
    ? Math.round(((treeExp - currentStage.minExp) / (nextStage.minExp - currentStage.minExp)) * 100)
    : 100;

  const handleWater = () => {
    setTreeExp(prev => Math.min(prev + 10, 2500));
    setWaterCount(prev => prev + 1);
    Taro.showToast({ title: '浇水成功！+10经验', icon: 'success' });
  };

  const handleFertilize = () => {
    setTreeExp(prev => Math.min(prev + 20, 2500));
    setFertilizerCount(prev => prev + 1);
    Taro.showToast({ title: '施肥成功！+20经验', icon: 'success' });
  };

  const handleGame = (game: typeof GAMES[0]) => {
    if (!game.available) {
      Taro.showToast({ title: '游戏开发中...', icon: 'none' });
      return;
    }
    switch (game.type) {
      case 'quiz':
        handleQuizGame();
        break;
      case 'draw':
        Taro.showToast({ title: '你画我猜即将开始', icon: 'none' });
        break;
      case 'truth':
        handleTruthGame();
        break;
      default:
        Taro.showToast({ title: '即将上线', icon: 'none' });
    }
  };

  const handleQuizGame = async () => {
    const quiz = QUIZZES[Math.floor(Math.random() * QUIZZES.length)];
    const res = await Taro.showModal({
      title: quiz.question,
      content: quiz.options.join('、'),
      confirmText: quiz.options[0],
      cancelText: quiz.options[1],
    });
    if (res.confirm) {
      Taro.showToast({ title: quiz.match ? '默契满分！🎯' : '还需要多了解哦~', icon: 'none' });
    }
  };

  const handleTruthGame = async () => {
    const truths = [
      '第一次见面时对对方的印象？',
      '对方做过最让你感动的事？',
      '你最想和对方一起去哪里？',
      '对方有什么小习惯让你觉得可爱？',
      '你最想对对方说的一句话？',
    ];
    const truth = truths[Math.floor(Math.random() * truths.length)];
    await Taro.showModal({
      title: '💬 真心话',
      content: truth,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      {/* 爱情树 */}
      <View className={styles.treeCard}>
        <View className={styles.treeHeader}>
          <Text className={styles.treeTitle}>我们的爱情树</Text>
          <Text className={styles.treeLevel}>Lv.{currentStage.stage}</Text>
        </View>
        <View className={styles.treeContent}>
          <Text className={styles.treeIcon}>{currentStage.icon}</Text>
        </View>
        <View className={styles.treeProgress}>
          <View className={styles.treeProgressBar}>
            <View className={styles.treeProgressFill} style={{ width: `${progressPercent}%` }} />
          </View>
          <Text className={styles.treeProgressText}>
            {treeExp}/{nextStage?.minExp || 'MAX'} 经验 · {currentStage.name}
          </Text>
        </View>
        <View className={styles.treeActions}>
          <View className={styles.treeActionBtn} onClick={handleWater}>
            <Text className={styles.treeActionIcon}>💧</Text>
            <Text className={styles.treeActionText}>浇水</Text>
            <Text className={styles.treeActionCount}>{waterCount}次</Text>
          </View>
          <View className={styles.treeActionBtn} onClick={handleFertilize}>
            <Text className={styles.treeActionIcon}>🌱</Text>
            <Text className={styles.treeActionText}>施肥</Text>
            <Text className={styles.treeActionCount}>{fertilizerCount}次</Text>
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
          <View className={styles.matchProgressBar}>
            <View className={styles.matchProgressFill} style={{ width: `${matchScore}%` }} />
          </View>
        </View>
        <Text className={styles.matchDesc}>
          {matchScore >= 80 ? '你们真是心有灵犀！💕' :
           matchScore >= 50 ? '默契还不错，继续加油！✨' :
           '需要多了解对方哦~ 💪'}
        </Text>
      </View>

      {/* 互动游戏 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>互动游戏</Text>
        </View>
        <View className={styles.gameGrid}>
          {GAMES.map(game => (
            <View
              key={game.id}
              className={`${styles.gameCard} ${!game.available ? styles.gameDisabled : ''}`}
              onClick={() => handleGame(game)}
            >
              <View className={styles.gameIcon}>
                <Text className={styles.gameIconText}>{game.icon}</Text>
              </View>
              <Text className={styles.gameTitle}>{game.title}</Text>
              <Text className={styles.gameDesc}>{game.description}</Text>
              {!game.available && (
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
          <Text
            className={styles.sectionAction}
            onClick={() => Taro.switchTab({ url: '/pages/home/index' })}
          >
            全部
          </Text>
        </View>
        <View className={styles.diaryList}>
          {diaries.length > 0 ? (
            diaries.slice(0, 3).map(diary => (
              <DiaryCard
                key={diary.id}
                diary={diary}
                onClick={() => Taro.navigateTo({ url: `/pages/diary-detail/index?id=${diary.id}` })}
              />
            ))
          ) : (
            <View className={styles.emptyDiary}>
              <Text className={styles.emptyDiaryIcon}>📝</Text>
              <Text className={styles.emptyDiaryText}>还没有日记，去写一篇吧</Text>
            </View>
          )}
        </View>
      </View>

      {/* 写日记按钮 */}
      <View className={styles.writeDiaryBtn} onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
        <Text className={styles.writeDiaryIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default InteractPage;
