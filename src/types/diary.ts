// 日记类型
export interface Diary {
  id: string;
  content: string;
  images: string[];
  mood: MoodType;
  location?: string;
  weather?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
}

export type MoodType = 'happy' | 'love' | 'sad' | 'angry' | 'miss' | 'shy';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

// 情书/时光胶囊类型
export interface Letter {
  id: string;
  title: string;
  content: string;
  images: string[];
  voiceUrl?: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  sendAt: string;
  openAt: string;
  isOpened: boolean;
  isOpenable: boolean;
}

// 账单类型
export interface Bill {
  id: string;
  amount: number;
  category: string;
  categoryIcon: string;
  description: string;
  sweetWord: string;
  paidBy: string;
  paidByName: string;
  paidByAvatar: string;
  date: string;
  type: 'common' | 'personal';
}

// 账单分类
export interface BillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}