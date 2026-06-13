import type { Diary, MoodType } from '../types/diary';

// 心情配置
export const moodConfig: Record<MoodType, { label: string; emoji: string; color: string }> = {
  happy: { label: '开心', emoji: '😊', color: '#FFD93D' },
  love: { label: '甜蜜', emoji: '🥰', color: '#FF6B9D' },
  sad: { label: '难过', emoji: '😢', color: '#74B9FF' },
  angry: { label: '生气', emoji: '😤', color: '#FF6B6B' },
  miss: { label: '想你', emoji: '🥺', color: '#A29BFE' },
  shy: { label: '害羞', emoji: '😳', color: '#FFB6C1' }
};

// 日记 Mock 数据
export const diariesData: Diary[] = [
  {
    id: 'diary_001',
    content: '今天和你一起看了日落，真的好美！希望以后每一天都能和你一起看日落~',
    images: [
      'https://picsum.photos/id/1015/750/500',
      'https://picsum.photos/id/1018/750/500'
    ],
    mood: 'love',
    location: '海边',
    weather: '晴',
    authorId: 'user_001',
    authorName: '小怿',
    authorAvatar: 'https://picsum.photos/id/64/200/200',
    createdAt: '2024-06-10 18:30:00',
    likes: 12,
    comments: [
      {
        id: 'comment_001',
        content: '下次我们一起去看日出吧！',
        authorId: 'user_002',
        authorName: '小爱',
        authorAvatar: 'https://picsum.photos/id/91/200/200',
        createdAt: '2024-06-10 19:00:00'
      }
    ]
  },
  {
    id: 'diary_002',
    content: '今天你给我做的早餐真的太好吃了！虽然有点糊了，但是我很感动~',
    images: [
      'https://picsum.photos/id/292/750/500'
    ],
    mood: 'happy',
    authorId: 'user_002',
    authorName: '小爱',
    authorAvatar: 'https://picsum.photos/id/91/200/200',
    createdAt: '2024-06-09 08:00:00',
    likes: 8,
    comments: []
  },
  {
    id: 'diary_003',
    content: '今天好想你啊，异地恋真的好难熬，希望快点见面...',
    images: [],
    mood: 'miss',
    location: '北京',
    authorId: 'user_001',
    authorName: '小怿',
    authorAvatar: 'https://picsum.photos/id/64/200/200',
    createdAt: '2024-06-08 22:00:00',
    likes: 15,
    comments: [
      {
        id: 'comment_002',
        content: '我也想你！下个月就能见面了~',
        authorId: 'user_002',
        authorName: '小爱',
        authorAvatar: 'https://picsum.photos/id/91/200/200',
        createdAt: '2024-06-08 22:30:00'
      }
    ]
  },
  {
    id: 'diary_004',
    content: '今天是我们在一起的第180天！时间过得好快，感觉每一刻都很幸福~',
    images: [
      'https://picsum.photos/id/1036/750/500',
      'https://picsum.photos/id/1039/750/500',
      'https://picsum.photos/id/1044/750/500'
    ],
    mood: 'love',
    location: '公园',
    authorId: 'user_001',
    authorName: '小怿',
    authorAvatar: 'https://picsum.photos/id/64/200/200',
    createdAt: '2024-06-01 15:00:00',
    likes: 20,
    comments: []
  },
  {
    id: 'diary_005',
    content: '今天你惹我生气了，但是你哄我的样子好可爱，原谅你了~',
    images: [],
    mood: 'shy',
    authorId: 'user_002',
    authorName: '小爱',
    authorAvatar: 'https://picsum.photos/id/91/200/200',
    createdAt: '2024-05-28 20:00:00',
    likes: 6,
    comments: []
  }
];

// 获取最近的日记
export const getRecentDiaries = (limit: number = 5): Diary[] => {
  return diariesData.slice(0, limit);
};