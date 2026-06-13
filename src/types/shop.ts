// 商品类型
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  category: 'official' | 'custom';
  isCustom: boolean;
  createdBy?: string;
  stock: number;
  exchangedCount: number;
}

// 任务类型
export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'custom';
  isCompleted: boolean;
  completedAt?: string;
  icon: string;
}

// 积分记录
export interface PointsRecord {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  createdAt: string;
}

// 商城状态
export interface ShopState {
  points: number;
  tasks: Task[];
  products: Product[];
  records: PointsRecord[];
}