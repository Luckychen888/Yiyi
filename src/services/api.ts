const BASE_URL = 'https://yiyi-269720-9-1442837704.sh.run.tcloudbase.com';
const ENV_ID = 'prod-d1gssem8n4896288b';
const SERVICE_NAME = 'yiyi';

const USE_CLOUD_CALL = true;
const USE_MOCK_DATA = false;

async function request(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}) {
  if (USE_MOCK_DATA) {
    return mockRequest(options);
  }

  if (USE_CLOUD_CALL) {
    return cloudRequest(options);
  } else {
    return httpRequest(options);
  }
}

async function mockRequest(options: {
  url: string;
  method?: string;
  data?: any;
}) {
  const { url, method = 'GET', data = {} } = options;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url === '/api/user/login' && method === 'POST') {
        resolve({
          success: true,
          data: {
            id: 'user_' + Date.now(),
            nickname: data.nickname || '测试用户',
            avatar: data.avatar || 'https://picsum.photos/id/64/200/200',
            createdAt: new Date().toISOString()
          },
          message: '登录成功'
        });
      } else if (url.startsWith('/api/couple/user/') && method === 'GET') {
        resolve({
          success: false,
          data: null,
          message: '暂无情侣关系'
        });
      } else if (url === '/api/couple' && method === 'POST') {
        resolve({
          success: true,
          data: {
            id: 'couple_' + Date.now(),
            user1Id: data.user1Id || 'user_001',
            user1Name: data.user1Name || '用户1',
            user1Avatar: data.user1Avatar || 'https://picsum.photos/id/64/200/200',
            user2Id: '',
            user2Name: '',
            user2Avatar: '',
            startDate: new Date().toISOString().split('T')[0],
            inviteCode: 'LOVE' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            createdAt: new Date().toISOString()
          },
          message: '创建成功'
        });
      } else if (url === '/api/couple/join' && method === 'POST') {
        resolve({
          success: true,
          data: {
            id: 'couple_001',
            user1Id: 'user_001',
            user1Name: '用户1',
            user1Avatar: 'https://picsum.photos/id/64/200/200',
            user2Id: data.user2Id || 'user_002',
            user2Name: data.user2Name || '用户2',
            user2Avatar: data.user2Avatar || 'https://picsum.photos/id/91/200/200',
            startDate: new Date().toISOString().split('T')[0],
            inviteCode: data.inviteCode,
            createdAt: new Date().toISOString()
          },
          message: '绑定成功'
        });
      } else if (url.startsWith('/api/couple/') && method === 'GET') {
        resolve({
          success: true,
          data: {
            id: 'couple_001',
            user1Id: 'user_001',
            user1Name: '小怿',
            user1Avatar: 'https://picsum.photos/id/64/200/200',
            user2Id: 'user_002',
            user2Name: '小爱',
            user2Avatar: 'https://picsum.photos/id/91/200/200',
            startDate: '2024-01-01',
            inviteCode: 'LOVE2024',
            createdAt: '2024-01-01'
          },
          message: '获取成功'
        });
      } else {
        resolve({
          success: true,
          data: [],
          message: '操作成功'
        });
      }
    }, 500);
  });
}

async function cloudRequest(options: {
  url: string;
  method?: string;
  data?: any;
  header?: Record<string, string>;
}) {
  const { url, method = 'GET', data = {}, header = {} } = options;

  try {
    console.log('云托管请求:', { env: ENV_ID, service: SERVICE_NAME, path: url, method, data });
    
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

    console.log('云托管响应:', response);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      return response.data;
    } else {
      console.error('云托管请求失败，状态码:', response.statusCode, '响应:', response);
      throw new Error(response.errMsg || `请求失败 (${response.statusCode})`);
    }
  } catch (error: any) {
    console.error('云托管请求异常:', error);
    
    if (error.errMsg && error.errMsg.includes('INVALID_HOST')) {
      console.error('INVALID_HOST错误：请检查云托管服务配置');
      console.error('检查项：1. env是否正确 2. SERVICE_NAME是否正确 3. 服务是否已部署');
      return fallbackRequest(options);
    }
    
    if (error.errMsg && error.errMsg.includes('ok')) {
      console.warn('注意：云托管调用返回ok但可能数据格式错误');
      return { success: false, message: '服务响应异常，请稍后重试' };
    }
    
    console.warn('云托管调用失败，尝试降级为HTTP请求');
    return fallbackRequest(options);
  }
}

async function fallbackRequest(options: {
  url: string;
  method?: string;
  data?: any;
  header?: Record<string, string>;
}) {
  console.log('降级到HTTP请求:', BASE_URL + options.url);
  return httpRequest(options);
}

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
        console.log('HTTP响应:', res);
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          console.error('HTTP请求失败，状态码:', res.statusCode, '响应:', res);
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

export const userService = {
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

  async getUserInfo(userId: string) {
    return request({
      url: `/api/user/${userId}`,
      method: 'GET',
    });
  },

  async updateUserInfo(userId: string, userInfo: any) {
    return request({
      url: `/api/user/${userId}`,
      method: 'PUT',
      data: userInfo,
    });
  },
};

export const coupleService = {
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

  async getCoupleInfo(coupleId: string) {
    return request({
      url: `/api/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async getCoupleInfoByUser(userId: string) {
    return request({
      url: `/api/couple/user/${userId}`,
      method: 'GET',
    });
  },

  async unbindCouple(coupleId: string, userId: string) {
    return request({
      url: `/api/couple/${coupleId}/unbind`,
      method: 'POST',
      data: { userId },
    });
  },

  async regenerateInviteCode(coupleId: string) {
    return request({
      url: `/api/couple/${coupleId}/regenerate-code`,
      method: 'POST',
    });
  },
};

export const diaryService = {
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

  async getDiaries(coupleId: string) {
    return request({
      url: `/api/diary/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async getDiaryDetail(diaryId: string) {
    return request({
      url: `/api/diary/${diaryId}`,
      method: 'GET',
    });
  },

  async likeDiary(diaryId: string, userId: string) {
    return request({
      url: `/api/diary/${diaryId}/like`,
      method: 'POST',
      data: { userId },
    });
  },

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

  async deleteDiary(diaryId: string) {
    return request({
      url: `/api/diary/${diaryId}`,
      method: 'DELETE',
    });
  },
};

export const anniversaryService = {
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

  async getAnniversaries(coupleId: string) {
    return request({
      url: `/api/anniversary/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async updateAnniversary(anniversaryId: string, data: any) {
    return request({
      url: `/api/anniversary/${anniversaryId}`,
      method: 'PUT',
      data,
    });
  },

  async deleteAnniversary(anniversaryId: string) {
    return request({
      url: `/api/anniversary/${anniversaryId}`,
      method: 'DELETE',
    });
  },
};

export const wishService = {
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

  async getWishes(coupleId: string) {
    return request({
      url: `/api/wish/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async completeWish(wishId: string, userId: string) {
    return request({
      url: `/api/wish/${wishId}/complete`,
      method: 'POST',
      data: { userId },
    });
  },

  async deleteWish(wishId: string) {
    return request({
      url: `/api/wish/${wishId}`,
      method: 'DELETE',
    });
  },
};

export const taskService = {
  async getTasks(coupleId: string) {
    return request({
      url: `/api/task/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async completeTask(taskId: string, userId: string) {
    return request({
      url: `/api/task/${taskId}/complete`,
      method: 'POST',
      data: { userId },
    });
  },

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