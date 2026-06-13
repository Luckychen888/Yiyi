import type { Product, Task } from '../types/shop';

// 商品 Mock 数据
export const productsData: Product[] = [
  {
    id: 'prod_001',
    title: '免生气券',
    description: '使用后对方不能生气，有效期一次',
    price: 100,
    icon: '😇',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 56
  },
  {
    id: 'prod_002',
    title: '公主抱券',
    description: '兑换一次公主抱服务',
    price: 150,
    icon: '👸',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 42
  },
  {
    id: 'prod_003',
    title: '按摩券',
    description: '兑换一次15分钟按摩服务',
    price: 200,
    icon: '💆',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 38
  },
  {
    id: 'prod_004',
    title: '洗碗豁免券',
    description: '使用后当天不用洗碗',
    price: 80,
    icon: '🍽️',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 89
  },
  {
    id: 'prod_005',
    title: '看电影券',
    description: '兑换一次陪看电影服务',
    price: 120,
    icon: '🎬',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 67
  },
  {
    id: 'prod_006',
    title: '晚安故事券',
    description: '兑换一次讲睡前故事服务',
    price: 100,
    icon: '📖',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 45
  },
  {
    id: 'prod_007',
    title: '购物陪同券',
    description: '兑换一次陪逛街购物服务',
    price: 180,
    icon: '🛍️',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 34
  },
  {
    id: 'prod_008',
    title: '早餐券',
    description: '兑换一次送早餐到床边服务',
    price: 150,
    icon: '🥐',
    category: 'official',
    isCustom: false,
    stock: 999,
    exchangedCount: 52
  }
];

// 任务 Mock 数据
export const tasksData: Task[] = [
  {
    id: 'task_001',
    title: '说早安',
    description: '给对方发一条早安消息',
    points: 10,
    type: 'daily',
    isCompleted: true,
    completedAt: '2024-06-10 08:00:00',
    icon: '🌅'
  },
  {
    id: 'task_002',
    title: '说晚安',
    description: '给对方发一条晚安消息',
    points: 10,
    type: 'daily',
    isCompleted: false,
    icon: '🌙'
  },
  {
    id: 'task_003',
    title: '分享一张照片',
    description: '分享一张今天的照片给对方',
    points: 15,
    type: 'daily',
    isCompleted: false,
    icon: '📸'
  },
  {
    id: 'task_004',
    title: '写一篇日记',
    description: '记录今天的心情',
    points: 20,
    type: 'daily',
    isCompleted: true,
    completedAt: '2024-06-10 21:00:00',
    icon: '📝'
  },
  {
    id: 'task_005',
    title: '给对方点赞',
    description: '在对方的日记下点赞',
    points: 5,
    type: 'daily',
    isCompleted: true,
    completedAt: '2024-06-10 19:00:00',
    icon: '❤️'
  },
  {
    id: 'task_006',
    title: '完成一件小事',
    description: '从愿望清单中完成一件小事',
    points: 50,
    type: 'daily',
    isCompleted: false,
    icon: '✨'
  },
  {
    id: 'task_007',
    title: '帮对方洗碗',
    description: '今天主动帮对方洗碗',
    points: 30,
    type: 'custom',
    isCompleted: false,
    icon: '🍽️'
  },
  {
    id: 'task_008',
    title: '给对方按摩',
    description: '给对方做一次按摩',
    points: 40,
    type: 'custom',
    isCompleted: false,
    icon: '💆'
  }
];

// 获取今日任务完成情况
export const getTodayTaskStats = () => {
  const dailyTasks = tasksData.filter(t => t.type === 'daily');
  const completed = dailyTasks.filter(t => t.isCompleted).length;
  return {
    total: dailyTasks.length,
    completed,
    points: tasksData.filter(t => t.isCompleted).reduce((sum, t) => sum + t.points, 0)
  };
};