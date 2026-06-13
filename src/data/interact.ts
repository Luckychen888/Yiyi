import type { Quiz, Game, LoveTree } from '../types/wish';

// 默契问答 Mock 数据
export const quizzesData: Quiz[] = [
  {
    id: 'quiz_001',
    question: '对方最喜欢的食物是什么？',
    category: '喜好',
    options: ['火锅', '烧烤', '日料', '西餐'],
    user1Answer: '火锅',
    user2Answer: '火锅',
    isMatch: true
  },
  {
    id: 'quiz_002',
    question: '对方最害怕什么？',
    category: '性格',
    options: ['虫子', '鬼', '高处', '孤独'],
    user1Answer: '虫子',
    user2Answer: '虫子',
    isMatch: true
  },
  {
    id: 'quiz_003',
    question: '对方最想去的地方是哪里？',
    category: '梦想',
    options: ['日本', '欧洲', '海边', '雪山'],
    user1Answer: '日本',
    user2Answer: '欧洲',
    isMatch: false
  },
  {
    id: 'quiz_004',
    question: '对方最喜欢的电影类型是什么？',
    category: '喜好',
    options: ['爱情', '喜剧', '科幻', '恐怖'],
    user1Answer: '爱情',
    user2Answer: '爱情',
    isMatch: true
  },
  {
    id: 'quiz_005',
    question: '对方生气时会做什么？',
    category: '性格',
    options: ['不说话', '吃东西', '逛街', '睡觉'],
    user1Answer: '不说话',
    user2Answer: '吃东西',
    isMatch: false
  }
];

// 互动游戏 Mock 数据
export const gamesData: Game[] = [
  {
    id: 'game_001',
    title: '默契问答',
    description: '测试你们的默契程度',
    type: 'quiz',
    icon: '🎯',
    isAvailable: true
  },
  {
    id: 'game_002',
    title: '你画我猜',
    description: '一人画一人猜，看谁猜得准',
    type: 'draw',
    icon: '🎨',
    isAvailable: true
  },
  {
    id: 'game_003',
    title: '真心话大冒险',
    description: '经典互动游戏，增进了解',
    type: 'truth',
    icon: '💬',
    isAvailable: true
  },
  {
    id: 'game_004',
    title: '情侣连连看',
    description: '配对你们的共同记忆',
    type: 'puzzle',
    icon: '🧩',
    isAvailable: false
  }
];

// 爱情树 Mock 数据
export const loveTreeData: LoveTree = {
  level: 3,
  exp: 450,
  maxExp: 1000,
  waterCount: 28,
  fertilizerCount: 12,
  lastWaterAt: '2024-06-10 08:00:00',
  stage: 2 // 1-7 阶段
};

// 爱情树阶段配置
export const treeStages = [
  { stage: 1, name: '种子', minExp: 0, icon: '🌱' },
  { stage: 2, name: '幼苗', minExp: 100, icon: '🌿' },
  { stage: 3, name: '小树', minExp: 300, icon: '🌳' },
  { stage: 4, name: '开花', minExp: 600, icon: '🌸' },
  { stage: 5, name: '结果', minExp: 1000, icon: '🍎' },
  { stage: 6, name: '茂盛', minExp: 1500, icon: '🌲' },
  { stage: 7, name: '永恒', minExp: 2500, icon: '❤️' }
];

// 获取默契值
export const getMatchScore = (): number => {
  const matched = quizzesData.filter(q => q.isMatch).length;
  return Math.round((matched / quizzesData.length) * 100);
};