// 愿望/100件小事类型
export interface Wish {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  photoUrl?: string;
  location?: string;
  sortOrder: number;
}

// 里程碑类型
export interface Milestone {
  id: string;
  title: string;
  date: string;
  icon: string;
  description: string;
  photoUrl?: string;
}

// 爱情树类型
export interface LoveTree {
  level: number;
  exp: number;
  maxExp: number;
  waterCount: number;
  fertilizerCount: number;
  lastWaterAt: string;
  stage: number; // 1-7 阶段
}

// 默契问答类型
export interface Quiz {
  id: string;
  question: string;
  category: string;
  options?: string[];
  user1Answer?: string;
  user2Answer?: string;
  isMatch?: boolean;
}

// 互动游戏类型
export interface Game {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'draw' | 'truth' | 'puzzle';
  icon: string;
  isAvailable: boolean;
}