// 通用类型定义

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 分页参数
export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  pagination: Pagination;
}

// 日期范围
export interface DateRange {
  start: string;
  end: string;
}

// 统计数据
export interface Statistics {
  loveDays: number;
  diaryCount: number;
  wishCompleted: number;
  wishTotal: number;
  photoCount: number;
  points: number;
  treeLevel: number;
}

// 天气类型
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';

export interface Weather {
  type: WeatherType;
  temp: number;
  city: string;
}

// 位置信息
export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}