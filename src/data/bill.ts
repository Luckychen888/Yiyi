import type { Bill, BillCategory } from '../types/diary';

// 账单分类
export const billCategories: BillCategory[] = [
  { id: 'food', name: '餐饮', icon: '🍜', color: '#FF6B9D' },
  { id: 'travel', name: '旅行', icon: '✈️', color: '#74B9FF' },
  { id: 'gift', name: '礼物', icon: '🎁', color: '#FFD93D' },
  { id: 'movie', name: '电影', icon: '🎬', color: '#A29BFE' },
  { id: 'shopping', name: '购物', icon: '🛍️', color: '#00B894' },
  { id: 'other', name: '其他', icon: '💰', color: '#636E72' }
];

// 账单 Mock 数据
export const billsData: Bill[] = [
  {
    id: 'bill_001',
    amount: 286,
    category: 'food',
    categoryIcon: '🍜',
    description: '火锅晚餐',
    sweetWord: '和你一起吃什么都好吃~',
    paidBy: 'user_001',
    paidByName: '小怿',
    paidByAvatar: 'https://picsum.photos/id/64/200/200',
    date: '2024-06-10',
    type: 'common'
  },
  {
    id: 'bill_002',
    amount: 168,
    category: 'movie',
    categoryIcon: '🎬',
    description: '电影票',
    sweetWord: '和你看电影最开心',
    paidBy: 'user_002',
    paidByName: '小爱',
    paidByAvatar: 'https://picsum.photos/id/91/200/200',
    date: '2024-06-09',
    type: 'common'
  },
  {
    id: 'bill_003',
    amount: 520,
    category: 'gift',
    categoryIcon: '🎁',
    description: '纪念日礼物',
    sweetWord: '爱你么么哒~',
    paidBy: 'user_001',
    paidByName: '小怿',
    paidByAvatar: 'https://picsum.photos/id/64/200/200',
    date: '2024-06-01',
    type: 'common'
  },
  {
    id: 'bill_004',
    amount: 3500,
    category: 'travel',
    categoryIcon: '✈️',
    description: '三亚旅行',
    sweetWord: '期待下次旅行~',
    paidBy: 'user_002',
    paidByName: '小爱',
    paidByAvatar: 'https://picsum.photos/id/91/200/200',
    date: '2024-05-15',
    type: 'common'
  },
  {
    id: 'bill_005',
    amount: 89,
    category: 'shopping',
    categoryIcon: '🛍️',
    description: '情侣T恤',
    sweetWord: '穿情侣装出门~',
    paidBy: 'user_001',
    paidByName: '小怿',
    paidByAvatar: 'https://picsum.photos/id/64/200/200',
    date: '2024-05-10',
    type: 'common'
  }
];

// 获取账单统计
export const getBillStats = () => {
  const total = billsData.reduce((sum, b) => sum + b.amount, 0);
  const user1Paid = billsData
    .filter(b => b.paidBy === 'user_001')
    .reduce((sum, b) => sum + b.amount, 0);
  const user2Paid = total - user1Paid;
  
  return {
    total,
    user1Paid,
    user2Paid,
    count: billsData.length
  };
};