import type { Anniversary } from '../types/couple';

// 纪念日 Mock 数据
export const anniversariesData: Anniversary[] = [
  {
    id: 'anni_001',
    title: '恋爱纪念日',
    date: '2024-01-01',
    type: 'love',
    icon: '💕',
    remindDays: 3,
    isRemind: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'anni_002',
    title: '小怿的生日',
    date: '2024-06-15',
    type: 'birthday',
    icon: '🎂',
    remindDays: 7,
    isRemind: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'anni_003',
    title: '小爱的生日',
    date: '2024-09-20',
    type: 'birthday',
    icon: '🎂',
    remindDays: 7,
    isRemind: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'anni_004',
    title: '第一次牵手',
    date: '2024-01-15',
    type: 'custom',
    icon: '🤝',
    remindDays: 0,
    isRemind: false,
    createdAt: '2024-01-15'
  },
  {
    id: 'anni_005',
    title: '第一次旅行',
    date: '2024-03-01',
    type: 'custom',
    icon: '✈️',
    remindDays: 0,
    isRemind: false,
    createdAt: '2024-03-01'
  },
  {
    id: 'anni_006',
    title: '100天纪念日',
    date: '2024-04-10',
    type: 'custom',
    icon: '💯',
    remindDays: 3,
    isRemind: true,
    createdAt: '2024-04-10'
  }
];

// 获取即将到来的纪念日
export const getUpcomingAnniversaries = (): Anniversary[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return anniversariesData
    .map(anni => {
      const anniDate = new Date(anni.date);
      const thisYear = today.getFullYear();
      anniDate.setFullYear(thisYear);
      
      if (anniDate < today) {
        anniDate.setFullYear(thisYear + 1);
      }
      
      return {
        ...anni,
        date: anniDate.toISOString().split('T')[0]
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
};

// 计算距离纪念日的天数
export const getDaysUntil = (date: string): number => {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};