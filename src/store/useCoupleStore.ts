import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { Couple, Anniversary } from '../types/couple';
import type { Diary, Comment } from '../types/diary';
import { 
  diaryService, 
  coupleService, 
  anniversaryService 
} from '../services/api';
import { diariesData } from '../data/diaries';

interface CoupleStore {
  couple: Couple | null;
  isBound: boolean;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  loveDays: number;
  anniversaries: Anniversary[];
  diaries: Diary[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCouple: (couple: Couple | null) => void;
  setBound: (isBound: boolean) => void;
  setCurrentUser: (userId: string, name?: string, avatar?: string) => void;
  calculateLoveDays: () => number;
  
  // 用户操作
  login: (nickname: string, avatar: string, code: string) => Promise<boolean>;
  
  // 情侣操作
  bindPartner: (inviteCode: string, partnerName: string, partnerAvatar: string) => Promise<boolean>;
  unbindCouple: () => Promise<void>;
  generateInviteCode: () => Promise<string>;
  
  // 纪念日操作
  loadAnniversaries: () => Promise<void>;
  addAnniversary: (anniversary: Omit<Anniversary, 'id' | 'createdAt'>) => Promise<void>;
  updateAnniversary: (id: string, anniversary: Partial<Anniversary>) => Promise<void>;
  deleteAnniversary: (id: string) => Promise<void>;
  
  // 日记操作
  loadDiaries: () => Promise<void>;
  addDiary: (diary: Omit<Diary, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  likeDiary: (id: string) => Promise<void>;
  addComment: (diaryId: string, content: string) => Promise<void>;
  
  // 数据初始化
  initFromStorage: () => void;
}

// 模拟数据（用于本地开发和测试）
const mockCouple: Couple = {
  id: 'couple_001',
  user1Id: 'user_001',
  user2Id: 'user_002',
  user1Name: '小怿',
  user2Name: '小爱',
  user1Avatar: 'https://picsum.photos/id/64/200/200',
  user2Avatar: 'https://picsum.photos/id/91/200/200',
  startDate: '2024-01-01',
  inviteCode: 'LOVE2024',
  createdAt: '2024-01-01'
};

const mockAnniversaries: Anniversary[] = [
  {
    id: 'anni_001',
    title: '恋爱纪念日',
    date: '2024-01-01',
    type: 'love',
    icon: '💕',
    remindDays: 3,
    isRemind: true,
    createdAt: '2024-01-01'
  }
];

// 是否使用真实API（设置为false使用模拟数据）
const USE_API = false;

export const useCoupleStore = create<CoupleStore>((set, get) => ({
  couple: mockCouple,
  isBound: true,
  currentUserId: 'user_001',
  currentUserName: '小怿',
  currentUserAvatar: 'https://picsum.photos/id/64/200/200',
  loveDays: 0,
  anniversaries: mockAnniversaries,
  diaries: diariesData,
  isLoading: false,
  error: null,

  setCouple: (couple) => {
    set({ couple, isBound: !!couple });
    if (couple) {
      get().calculateLoveDays();
      // 保存到本地存储
      Taro.setStorageSync('coupleData', couple);
    }
  },

  setBound: (isBound) => {
    set({ isBound });
    Taro.setStorageSync('isBound', isBound);
  },

  setCurrentUser: (userId, name, avatar) => {
    set({ 
      currentUserId: userId,
      currentUserName: name || Taro.getStorageSync('userName'),
      currentUserAvatar: avatar || Taro.getStorageSync('userAvatar')
    });
  },

  calculateLoveDays: () => {
    const { couple } = get();
    if (!couple || !couple.startDate) return 0;
    
    const startDate = new Date(couple.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    set({ loveDays: diffDays });
    return diffDays;
  },

  // 用户登录
  login: async (nickname, avatar, code) => {
    set({ isLoading: true, error: null });
    
    if (!USE_API) {
      // 模拟登录
      const userId = 'user_' + Date.now();
      set({
        currentUserId: userId,
        currentUserName: nickname,
        currentUserAvatar: avatar,
        isLoading: false
      });
      
      // 保存到本地存储
      Taro.setStorageSync('userId', userId);
      Taro.setStorageSync('userName', nickname);
      Taro.setStorageSync('userAvatar', avatar);
      Taro.setStorageSync('isLogin', true);
      
      return true;
    }
    
    try {
      const response = await coupleService.createCouple({
        user1Id: 'temp_user_id',
        user1Name: nickname,
        user1Avatar: avatar
      });
      
      if (response.success && response.data) {
        const userId = response.data.user1Id;
        set({
          currentUserId: userId,
          currentUserName: nickname,
          currentUserAvatar: avatar,
          couple: response.data,
          isBound: false,
          isLoading: false
        });
        
        // 保存到本地存储
        Taro.setStorageSync('userId', userId);
        Taro.setStorageSync('userName', nickname);
        Taro.setStorageSync('userAvatar', avatar);
        Taro.setStorageSync('coupleData', response.data);
        Taro.setStorageSync('isLogin', true);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      set({ error: '登录失败', isLoading: false });
      return false;
    }
  },

  // 绑定伴侣
  bindPartner: async (inviteCode, partnerName, partnerAvatar) => {
    set({ isLoading: true, error: null });
    
    if (!USE_API) {
      // 模拟绑定
      const { couple } = get();
      if (!couple) return false;
      
      const updatedCouple: Couple = {
        ...couple,
        user2Id: 'user_' + Date.now(),
        user2Name: partnerName,
        user2Avatar: partnerAvatar,
        startDate: new Date().toISOString().split('T')[0]
      };
      
      set({ 
        couple: updatedCouple, 
        isBound: true, 
        isLoading: false 
      });
      
      // 保存到本地存储
      Taro.setStorageSync('coupleData', updatedCouple);
      Taro.setStorageSync('isBound', true);
      
      return true;
    }
    
    try {
      const { currentUserId } = get();
      const response = await coupleService.joinCouple({
        inviteCode,
        user2Id: currentUserId,
        user2Name: partnerName,
        user2Avatar: partnerAvatar
      });
      
      if (response.success && response.data) {
        set({
          couple: response.data,
          isBound: true,
          isLoading: false
        });
        
        // 保存到本地存储
        Taro.setStorageSync('coupleData', response.data);
        Taro.setStorageSync('isBound', true);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('绑定失败:', error);
      set({ error: '邀请码无效', isLoading: false });
      return false;
    }
  },

  // 解除绑定
  unbindCouple: async () => {
    set({ isLoading: true, error: null });
    
    if (!USE_API) {
      const { couple } = get();
      if (!couple) return;
      
      const updatedCouple: Couple = {
        ...couple,
        user2Id: '',
        user2Name: '',
        user2Avatar: ''
      };
      
      set({ 
        couple: updatedCouple, 
        isBound: false, 
        isLoading: false 
      });
      
      Taro.setStorageSync('coupleData', updatedCouple);
      Taro.setStorageSync('isBound', false);
      return;
    }
    
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response = await coupleService.unbindCouple(couple.id, get().currentUserId);
      
      if (response.success) {
        set({
          couple: { ...couple, user2Id: '', user2Name: '', user2Avatar: '' },
          isBound: false,
          isLoading: false
        });
        
        Taro.removeStorageSync('coupleData');
        Taro.setStorageSync('isBound', false);
      }
    } catch (error) {
      console.error('解除绑定失败:', error);
      set({ error: '解除绑定失败', isLoading: false });
    }
  },

  // 生成新邀请码
  generateInviteCode: async () => {
    if (!USE_API) {
      const code = 'LOVE' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const { couple } = get();
      if (couple) {
        const updatedCouple = { ...couple, inviteCode: code };
        set({ couple: updatedCouple });
        Taro.setStorageSync('coupleData', updatedCouple);
      }
      return code;
    }
    
    try {
      const { couple } = get();
      if (!couple) return '';
      
      const response = await coupleService.regenerateInviteCode(couple.id);
      
      if (response.success && response.data) {
        const updatedCouple = { ...couple, inviteCode: response.data.inviteCode };
        set({ couple: updatedCouple });
        Taro.setStorageSync('coupleData', updatedCouple);
        return response.data.inviteCode;
      }
      return '';
    } catch (error) {
      console.error('生成邀请码失败:', error);
      return '';
    }
  },

  // 加载纪念日
  loadAnniversaries: async () => {
    if (!USE_API) {
      return;
    }
    
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response = await anniversaryService.getAnniversaries(couple.id);
      
      if (response.success && response.data) {
        set({ anniversaries: response.data });
      }
    } catch (error) {
      console.error('加载纪念日失败:', error);
    }
  },

  // 添加纪念日
  addAnniversary: async (anniversary) => {
    if (!USE_API) {
      const newAnniversary: Anniversary = {
        ...anniversary,
        id: 'anni_' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      set(state => ({ anniversaries: [...state.anniversaries, newAnniversary] }));
      return;
    }
    
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response = await anniversaryService.createAnniversary({
        ...anniversary,
        coupleId: couple.id
      });
      
      if (response.success && response.data) {
        set(state => ({ anniversaries: [...state.anniversaries, response.data] }));
      }
    } catch (error) {
      console.error('添加纪念日失败:', error);
    }
  },

  // 更新纪念日
  updateAnniversary: async (id, anniversary) => {
    if (!USE_API) {
      set(state => ({
        anniversaries: state.anniversaries.map(anni =>
          anni.id === id ? { ...anni, ...anniversary } : anni
        )
      }));
      return;
    }
    
    try {
      const response = await anniversaryService.updateAnniversary(id, anniversary);
      
      if (response.success) {
        set(state => ({
          anniversaries: state.anniversaries.map(anni =>
            anni.id === id ? { ...anni, ...anniversary } : anni
          )
        }));
      }
    } catch (error) {
      console.error('更新纪念日失败:', error);
    }
  },

  // 删除纪念日
  deleteAnniversary: async (id) => {
    if (!USE_API) {
      set(state => ({
        anniversaries: state.anniversaries.filter(anni => anni.id !== id)
      }));
      return;
    }
    
    try {
      const response = await anniversaryService.deleteAnniversary(id);
      
      if (response.success) {
        set(state => ({
          anniversaries: state.anniversaries.filter(anni => anni.id !== id)
        }));
      }
    } catch (error) {
      console.error('删除纪念日失败:', error);
    }
  },

  // 加载日记
  loadDiaries: async () => {
    if (!USE_API) {
      return;
    }
    
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response = await diaryService.getDiaries(couple.id);
      
      if (response.success && response.data) {
        set({ diaries: response.data });
      }
    } catch (error) {
      console.error('加载日记失败:', error);
    }
  },

  // 添加日记
  addDiary: async (diary) => {
    if (!USE_API) {
      const { currentUserId, currentUserName, currentUserAvatar } = get();
      
      const newDiary: Diary = {
        ...diary,
        id: 'diary_' + Date.now(),
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      
      set(state => ({ diaries: [newDiary, ...state.diaries] }));
      return;
    }
    
    try {
      const { couple, currentUserId, currentUserName, currentUserAvatar } = get();
      if (!couple) return;
      
      const response = await diaryService.createDiary({
        ...diary,
        coupleId: couple.id,
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar
      });
      
      if (response.success && response.data) {
        set(state => ({ diaries: [response.data, ...state.diaries] }));
      }
    } catch (error) {
      console.error('添加日记失败:', error);
    }
  },

  // 点赞日记
  likeDiary: async (id) => {
    if (!USE_API) {
      set(state => ({
        diaries: state.diaries.map(diary =>
          diary.id === id ? { ...diary, likes: diary.likes + 1 } : diary
        )
      }));
      return;
    }
    
    try {
      const { currentUserId } = get();
      const response = await diaryService.likeDiary(id, currentUserId);
      
      if (response.success) {
        set(state => ({
          diaries: state.diaries.map(diary =>
            diary.id === id ? { ...diary, likes: diary.likes + 1 } : diary
          )
        }));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  },

  // 添加评论
  addComment: async (diaryId, content) => {
    if (!USE_API) {
      const { currentUserId, currentUserName, currentUserAvatar } = get();
      
      const newComment: Comment = {
        id: 'comment_' + Date.now(),
        content,
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({
        diaries: state.diaries.map(diary =>
          diary.id === diaryId
            ? { ...diary, comments: [...diary.comments, newComment] }
            : diary
        )
      }));
      return;
    }
    
    try {
      const { currentUserId, currentUserName, currentUserAvatar } = get();
      const response = await diaryService.addComment(diaryId, {
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
        content
      });
      
      if (response.success && response.data) {
        set(state => ({
          diaries: state.diaries.map(diary =>
            diary.id === diaryId
              ? { ...diary, comments: [...diary.comments, response.data] }
              : diary
          )
        }));
      }
    } catch (error) {
      console.error('添加评论失败:', error);
    }
  },

  // 从本地存储初始化
  initFromStorage: () => {
    try {
      const userId = Taro.getStorageSync('userId');
      const userName = Taro.getStorageSync('userName');
      const userAvatar = Taro.getStorageSync('userAvatar');
      const coupleData = Taro.getStorageSync('coupleData');
      const isBound = Taro.getStorageSync('isBound');
      
      if (userId) {
        set({
          currentUserId: userId,
          currentUserName: userName,
          currentUserAvatar: userAvatar,
          couple: coupleData,
          isBound: isBound || false
        });
        
        if (coupleData) {
          get().calculateLoveDays();
        }
      }
    } catch (error) {
      console.error('初始化失败:', error);
    }
  }
}));
