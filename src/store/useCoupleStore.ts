import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { Couple, Anniversary } from '../types/couple';
import type { Diary } from '../types/diary';
import type { Wish } from '../types/wish';
import { 
  diaryService, 
  coupleService, 
  anniversaryService,
  wishService,
  userService
} from '../services/api';

interface CoupleStore {
  couple: Couple | null;
  isBound: boolean;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  loveDays: number;
  anniversaries: Anniversary[];
  diaries: Diary[];
  wishes: Wish[];
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
  createCouple: () => Promise<boolean>;
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
  
  // 愿望操作
  loadWishes: () => Promise<void>;
  completeWish: (wishId: string) => Promise<void>;
  
  // 数据初始化
  initFromStorage: () => void;
  loadAllData: () => Promise<void>;
}

export const useCoupleStore = create<CoupleStore>((set, get) => ({
  couple: null,
  isBound: false,
  currentUserId: '',
  currentUserName: '',
  currentUserAvatar: '',
  loveDays: 0,
  anniversaries: [],
  diaries: [],
  wishes: [],
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
    
    try {
      const response: any = await userService.login({
        nickname,
        avatar,
        code
      });
      
      if (response.success && response.data) {
        const userInfo = response.data;
        set({
          currentUserId: userInfo.id,
          currentUserName: userInfo.nickname,
          currentUserAvatar: userInfo.avatar,
          isLoading: false
        });
        
        Taro.setStorageSync('userId', userInfo.id);
        Taro.setStorageSync('userName', userInfo.nickname);
        Taro.setStorageSync('userAvatar', userInfo.avatar);
        Taro.setStorageSync('userInfo', userInfo);
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

  // 创建情侣关系
  createCouple: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { currentUserId, currentUserName, currentUserAvatar } = get();
      
      const response: any = await coupleService.createCouple({
        user1Id: currentUserId,
        user1Name: currentUserName,
        user1Avatar: currentUserAvatar
      });
      
      if (response.success && response.data) {
        set({
          couple: response.data,
          isBound: false,
          isLoading: false
        });
        
        Taro.setStorageSync('coupleData', response.data);
        Taro.setStorageSync('isBound', false);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('创建情侣关系失败:', error);
      set({ error: '创建失败', isLoading: false });
      return false;
    }
  },

  // 绑定伴侣
  bindPartner: async (inviteCode, partnerName, partnerAvatar) => {
    set({ isLoading: true, error: null });
    
    try {
      const { currentUserId } = get();
      const response: any = await coupleService.joinCouple({
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
    
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response: any = await coupleService.unbindCouple(couple.id, get().currentUserId);
      
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
    try {
      const { couple } = get();
      if (!couple) return '';
      
      const response: any = await coupleService.regenerateInviteCode(couple.id);
      
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
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response: any = await anniversaryService.getAnniversaries(couple.id);
      
      if (response.success && response.data) {
        set({ anniversaries: response.data });
      }
    } catch (error) {
      console.error('加载纪念日失败:', error);
    }
  },

  // 添加纪念日
  addAnniversary: async (anniversary) => {
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response: any = await anniversaryService.createAnniversary({
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
    try {
      const response: any = await anniversaryService.updateAnniversary(id, anniversary);
      
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
    try {
      const response: any = await anniversaryService.deleteAnniversary(id);
      
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
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response: any = await diaryService.getDiaries(couple.id);
      
      if (response.success && response.data) {
        set({ diaries: response.data });
      }
    } catch (error) {
      console.error('加载日记失败:', error);
    }
  },

  // 添加日记
  addDiary: async (diary) => {
    try {
      const { couple, currentUserId, currentUserName, currentUserAvatar } = get();
      if (!couple) return;
      
      const response: any = await diaryService.createDiary({
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
    try {
      const { currentUserId } = get();
      const response: any = await diaryService.likeDiary(id, currentUserId);
      
      if (response.success) {
        const liked = response.liked;
        set(state => ({
          diaries: state.diaries.map(diary =>
            diary.id === id 
              ? { ...diary, likes: diary.likes + (liked ? 1 : -1) } 
              : diary
          )
        }));
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  },

  // 添加评论
  addComment: async (diaryId, content) => {
    try {
      const { currentUserId, currentUserName, currentUserAvatar } = get();
      const response: any = await diaryService.addComment(diaryId, {
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

  // 加载愿望
  loadWishes: async () => {
    try {
      const { couple } = get();
      if (!couple) return;
      
      const response: any = await wishService.getWishes(couple.id);
      
      if (response.success && response.data) {
        set({ wishes: response.data });
      }
    } catch (error) {
      console.error('加载愿望失败:', error);
    }
  },

  // 完成愿望
  completeWish: async (wishId) => {
    try {
      const { currentUserId } = get();
      const response: any = await wishService.completeWish(wishId, currentUserId);
      
      if (response.success) {
        set(state => ({
          wishes: state.wishes.map(wish =>
            wish.id === wishId
              ? { ...wish, isCompleted: true, completedAt: new Date().toISOString() }
              : wish
          )
        }));
      }
    } catch (error) {
      console.error('完成愿望失败:', error);
    }
  },

  // 加载所有数据
  loadAllData: async () => {
    const { couple } = get();
    if (!couple) return;
    
    await Promise.all([
      get().loadAnniversaries(),
      get().loadDiaries(),
      get().loadWishes()
    ]);
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
