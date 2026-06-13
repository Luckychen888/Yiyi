import type { Wish } from '../types/wish';

// 100件小事 Mock 数据
export const wishesData: Wish[] = [
  {
    id: 'wish_001',
    title: '一起看日出',
    description: '在山顶或海边，一起迎接第一缕阳光',
    category: '浪漫',
    icon: '🌅',
    isCompleted: true,
    completedAt: '2024-03-15',
    completedBy: 'user_001',
    photoUrl: 'https://picsum.photos/id/1015/300/300',
    location: '泰山',
    sortOrder: 1
  },
  {
    id: 'wish_002',
    title: '一起吃遍火锅店',
    description: '打卡城市里所有的火锅店',
    category: '美食',
    icon: '🍲',
    isCompleted: false,
    sortOrder: 2
  },
  {
    id: 'wish_003',
    title: '一起看极光',
    description: '去北欧或阿拉斯加看极光',
    category: '旅行',
    icon: '🌌',
    isCompleted: false,
    sortOrder: 3
  },
  {
    id: 'wish_004',
    title: '一起养一只宠物',
    description: '养一只可爱的小猫或小狗',
    category: '生活',
    icon: '🐱',
    isCompleted: true,
    completedAt: '2024-04-01',
    completedBy: 'user_002',
    photoUrl: 'https://picsum.photos/id/237/300/300',
    sortOrder: 4
  },
  {
    id: 'wish_005',
    title: '一起学做一道菜',
    description: '学习做对方最喜欢的菜',
    category: '生活',
    icon: '🍳',
    isCompleted: true,
    completedAt: '2024-02-14',
    completedBy: 'user_001',
    photoUrl: 'https://picsum.photos/id/312/300/300',
    sortOrder: 5
  },
  {
    id: 'wish_006',
    title: '一起拍情侣照',
    description: '去照相馆拍一组正式的情侣照',
    category: '浪漫',
    icon: '📸',
    isCompleted: true,
    completedAt: '2024-05-20',
    completedBy: 'user_001',
    photoUrl: 'https://picsum.photos/id/338/300/300',
    sortOrder: 6
  },
  {
    id: 'wish_007',
    title: '一起看演唱会',
    description: '去看喜欢的歌手的演唱会',
    category: '娱乐',
    icon: '🎤',
    isCompleted: false,
    sortOrder: 7
  },
  {
    id: 'wish_008',
    title: '一起坐摩天轮',
    description: '在摩天轮最高点许愿',
    category: '浪漫',
    icon: '🎡',
    isCompleted: true,
    completedAt: '2024-01-20',
    completedBy: 'user_002',
    photoUrl: 'https://picsum.photos/id/787/300/300',
    sortOrder: 8
  },
  {
    id: 'wish_009',
    title: '一起看烟花',
    description: '在节日或跨年时一起看烟花',
    category: '浪漫',
    icon: '🎆',
    isCompleted: false,
    sortOrder: 9
  },
  {
    id: 'wish_010',
    title: '一起旅行',
    description: '去一个从未去过的地方旅行',
    category: '旅行',
    icon: '✈️',
    isCompleted: true,
    completedAt: '2024-03-01',
    completedBy: 'user_001',
    photoUrl: 'https://picsum.photos/id/1036/300/300',
    location: '三亚',
    sortOrder: 10
  },
  {
    id: 'wish_011',
    title: '一起看电影',
    description: '在电影院看一场电影',
    category: '娱乐',
    icon: '🎬',
    isCompleted: true,
    completedAt: '2024-02-10',
    completedBy: 'user_002',
    sortOrder: 11
  },
  {
    id: 'wish_012',
    title: '一起做饭',
    description: '在家一起做一顿丰盛的晚餐',
    category: '生活',
    icon: '👨‍🍳',
    isCompleted: true,
    completedAt: '2024-04-15',
    completedBy: 'user_001',
    sortOrder: 12
  }
];

// 获取愿望统计
export const getWishStats = () => {
  const total = wishesData.length;
  const completed = wishesData.filter(w => w.isCompleted).length;
  const percentage = Math.round((completed / total) * 100);
  return { total, completed, percentage };
};

// 获取分类列表
export const getCategories = () => {
  const categories = [...new Set(wishesData.map(w => w.category))];
  return categories;
};