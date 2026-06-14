import Taro from '@tarojs/taro';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

export const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return formatDate(date, 'MM-DD');
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getRandomLoveWord = (): string => {
  const words = [
    '你是我最想留住的幸运',
    '余生请多指教',
    '有你在身边，就是最好的日子',
    '遇见你是最美丽的意外',
    '想和你一起慢慢变老',
    '你是我写过最美的情书',
    '和你在一起，每天都是情人节',
    '你是我心中最美的风景',
    '爱你是我做过最好的事',
    '你是我生命中最重要的人'
  ];
  return words[Math.floor(Math.random() * words.length)];
};

export const getRandomTask = (): string => {
  const tasks = [
    '给对方一个拥抱',
    '说一句我爱你',
    '分享一张今天的照片',
    '给对方发一条甜蜜消息',
    '回忆一件美好的事',
    '计划下一次约会',
    '为对方做一件小事',
    '说一个对方的优点'
  ];
  return tasks[Math.floor(Math.random() * tasks.length)];
};

export interface UserInfo {
  userId: string;
  userName: string;
  userAvatar: string;
}

export const isLoggedIn = (): boolean => {
  try {
    const isLogin = Taro.getStorageSync('isLogin');
    const userId = Taro.getStorageSync('userId');
    return !!isLogin && !!userId;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
};

export const getUserInfo = (): UserInfo | null => {
  try {
    const userId = Taro.getStorageSync('userId');
    const userName = Taro.getStorageSync('userName');
    const userAvatar = Taro.getStorageSync('userAvatar');
    
    if (!userId) return null;
    
    return {
      userId,
      userName: userName || '',
      userAvatar: userAvatar || ''
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

export const checkLoginAndRedirect = (redirectUrl?: string): boolean => {
  if (!isLoggedIn()) {
    Taro.navigateTo({
      url: `/pages/login/index${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`
    });
    return false;
  }
  return true;
};

export const logout = (): void => {
  try {
    Taro.removeStorageSync('userId');
    Taro.removeStorageSync('userName');
    Taro.removeStorageSync('userAvatar');
    Taro.removeStorageSync('userInfo');
    Taro.removeStorageSync('coupleData');
    Taro.removeStorageSync('isBound');
    Taro.removeStorageSync('isLogin');
    
    Taro.switchTab({ url: '/pages/login/index' });
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};