// 情侣相关类型
export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  user1Avatar: string;
  user2Avatar: string;
  startDate: string; // 恋爱开始日期
  inviteCode: string;
  createdAt: string;
}

export interface CoupleState {
  couple: Couple | null;
  isBound: boolean;
  currentUserId: string;
  partnerId: string;
  loveDays: number;
}

// 纪念日类型
export interface Anniversary {
  id: string;
  title: string;
  description?: string; // 描述（可选）
  date: string;
  type: 'love' | 'birthday' | 'custom';
  icon: string;
  remindDays: number; // 提前多少天提醒
  isRemind: boolean;
  remindTime?: string; // 提醒时间点（HH:mm格式）
  createdAt: string;
}

// 心情类型
export type MoodType = 'happy' | 'love' | 'sad' | 'angry' | 'miss' | 'shy';

export interface Mood {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
}

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

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}