/**
 * 腾讯云托管API服务
 * 
 * 支持两种调用方式：
 * 1. wx.cloud.callContainer - 微信云托管调用（推荐，无需域名配置）
 * 2. HTTP请求 - 直接调用公网域名（需要配置合法域名）
 */

const BASE_URL = 'https://express-a4ne-269720-9-1442837704.sh.run.tcloudbase.com';
const ENV_ID = 'prod-d1gssem8n4896288b';
const SERVICE_NAME = 'express-a4ne';

// 是否使用云托管调用（true=callContainer, false=HTTP请求）
const USE_CLOUD_CALL = true;

/**
 * 通用请求方法
 */
async function request(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}) {
  const { url, method = 'GET', data = {}, header = {} } = options;

  if (USE_CLOUD_CALL) {
    return cloudRequest(options);
  } else {
    return httpRequest(options);
  }
}

/**
 * 云托管调用方式
 */
async function cloudRequest(options: {
  url: string;
  method?: string;
  data?: any;
  header?: Record<string, string>;
}) {
  const { url, method = 'GET', data = {}, header = {} } = options;

  try {
    const response: any = await wx.cloud.callContainer({
      config: { env: ENV_ID },
      path: url,
      header: {
        'X-WX-SERVICE': SERVICE_NAME,
        'Content-Type': 'application/json',
        ...header,
      },
      method,
      data,
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      return response.data;
    } else {
      throw new Error(response.errMsg || `请求失败 (${response.statusCode})`);
    }
  } catch (error) {
    console.error('云托管请求失败:', error);
    throw error;
  }
}

/**
 * HTTP请求方式
 */
async function httpRequest(options: {
  url: string;
  method?: string;
  data?: any;
  header?: Record<string, string>;
}) {
  const { url, method = 'GET', data = {}, header = {} } = options;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败 (${res.statusCode})`));
        }
      },
      fail: (err: any) => {
        console.error('HTTP请求失败:', err);
        reject(err);
      },
    });
  });
}

// ==================== 用户服务 ====================

export const userService = {
  /**
   * 用户登录
   */
  async login(userInfo: {
    nickname: string;
    avatar: string;
    code?: string;
    userId?: string;
  }) {
    return request({
      url: '/api/user/login',
      method: 'POST',
      data: userInfo,
    });
  },

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string) {
    return request({
      url: `/api/user/${userId}`,
      method: 'GET',
    });
  },

  /**
   * 更新用户信息
   */
  async updateUserInfo(userId: string, userInfo: any) {
    return request({
      url: `/api/user/${userId}`,
      method: 'PUT',
      data: userInfo,
    });
  },
};

// ==================== 情侣服务 ====================

export const coupleService = {
  /**
   * 创建情侣关系
   */
  async createCouple(data: {
    user1Id: string;
    user1Name: string;
    user1Avatar: string;
  }) {
    return request({
      url: '/api/couple',
      method: 'POST',
      data,
    });
  },

  /**
   * 加入情侣（通过邀请码）
   */
  async joinCouple(data: {
    inviteCode: string;
    user2Id: string;
    user2Name: string;
    user2Avatar: string;
  }) {
    return request({
      url: '/api/couple/join',
      method: 'POST',
      data,
    });
  },

  /**
   * 获取情侣信息
   */
  async getCoupleInfo(coupleId: string) {
    return request({
      url: `/api/couple/${coupleId}`,
      method: 'GET',
    });
  },

  /**
   * 获取情侣信息（通过用户ID）
   */
  async getCoupleInfoByUser(userId: string) {
    return request({
      url: `/api/couple/user/${userId}`,
      method: 'GET',
    });
  },

  /**
   * 解绑情侣
   */
  async unbindCouple(coupleId: string, userId: string) {
    return request({
      url: `/api/couple/${coupleId}/unbind`,
      method: 'POST',
      data: { userId },
    });
  },

  /**
   * 生成新的邀请码
   */
  async regenerateInviteCode(coupleId: string) {
    return request({
      url: `/api/couple/${coupleId}/regenerate-code`,
      method: 'POST',
    });
  },
};

// ==================== 日记服务 ====================

export const diaryService = {
  /**
   * 创建日记
   */
  async createDiary(data: {
    coupleId: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    images?: string[];
    mood?: string;
    location?: string;
    weather?: string;
  }) {
    return request({
      url: '/api/diary',
      method: 'POST',
      data,
    });
  },

  /**
   * 获取情侣日记列表
   */
  async getDiaries(coupleId: string) {
    return request({
      url: `/api/diary/couple/${coupleId}`,
      method: 'GET',
    });
  },

  /**
   * 获取日记详情
   */
  async getDiaryDetail(diaryId: string) {
    return request({
      url: `/api/diary/${diaryId}`,
      method: 'GET',
    });
  },

  /**
   * 点赞/取消点赞日记
   */
  async likeDiary(diaryId: string, userId: string) {
    return request({
      url: `/api/diary/${diaryId}/like`,
      method: 'POST',
      data: { userId },
    });
  },

  /**
   * 添加评论
   */
  async addComment(diaryId: string, comment: {
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
  }) {
    return request({
      url: `/api/diary/${diaryId}/comment`,
      method: 'POST',
      data: comment,
    });
  },

  /**
   * 删除日记
   */
  async deleteDiary(diaryId: string) {
    return request({
      url: `/api/diary/${diaryId}`,
      method: 'DELETE',
    });
  },
};

// ==================== 纪念日服务 ====================

export const anniversaryService = {
  /**
   * 创建纪念日
   */
  async createAnniversary(data: {
    coupleId: string;
    title: string;
    description?: string;
    date: string;
    type: string;
    icon: string;
    remindDays?: number;
    isRemind?: boolean;
    remindTime?: string;
  }) {
    return request({
      url: '/api/anniversary',
      method: 'POST',
      data,
    });
  },

  /**
   * 获取纪念日列表
   */
  async getAnniversaries(coupleId: string) {
    return request({
      url: `/api/anniversary/couple/${coupleId}`,
      method: 'GET',
    });
  },

  /**
   * 更新纪念日
   */
  async updateAnniversary(anniversaryId: string, data: any) {
    return request({
      url: `/api/anniversary/${anniversaryId}`,
      method: 'PUT',
      data,
    });
  },

  /**
   * 删除纪念日
   */
  async deleteAnniversary(anniversaryId: string) {
    return request({
      url: `/api/anniversary/${anniversaryId}`,
      method: 'DELETE',
    });
  },
};

// ==================== 愿望清单服务 ====================

export const wishService = {
  /**
   * 创建愿望
   */
  async createWish(data: {
    coupleId: string;
    title: string;
    description?: string;
    icon?: string;
    targetDate?: string;
  }) {
    return request({
      url: '/api/wish',
      method: 'POST',
      data,
    });
  },

  /**
   * 获取愿望列表
   */
  async getWishes(coupleId: string) {
    return request({
      url: `/api/wish/couple/${coupleId}`,
      method: 'GET',
    });
  },

  /**
   * 完成愿望
   */
  async completeWish(wishId: string, userId: string) {
    return request({
      url: `/api/wish/${wishId}/complete`,
      method: 'POST',
      data: { userId },
    });
  },

  /**
   * 删除愿望
   */
  async deleteWish(wishId: string) {
    return request({
      url: `/api/wish/${wishId}`,
      method: 'DELETE',
    });
  },
};

// ==================== 任务服务 ====================

export const taskService = {
  /**
   * 获取任务列表
   */
  async getTasks(coupleId: string) {
    return request({
      url: `/api/task/couple/${coupleId}`,
      method: 'GET',
    });
  },

  /**
   * 完成任务
   */
  async completeTask(taskId: string, userId: string) {
    return request({
      url: `/api/task/${taskId}/complete`,
      method: 'POST',
      data: { userId },
    });
  },

  /**
   * 获取积分
   */
  async getPoints(coupleId: string) {
    return request({
      url: `/api/task/points/${coupleId}`,
      method: 'GET',
    });
  },
};

export default {
  userService,
  coupleService,
  diaryService,
  anniversaryService,
  wishService,
  taskService,
};