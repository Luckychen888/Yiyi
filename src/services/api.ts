const BASE_URL = 'https://yiyi-269720-9-1442837704.sh.run.tcloudbase.com';
const ENV_ID = 'prod-d1gssem8n4896288b';
const SERVICE_NAME = 'yiyi';

async function request(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}) {
  return cloudRequest(options);
}

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
  } catch (error: any) {
    if (error.errMsg && error.errMsg.includes('INVALID_HOST')) {
      return fallbackRequest(options);
    }

    if (error.errMsg && error.errMsg.includes('ok')) {
      return { success: false, message: '服务响应异常，请稍后重试' };
    }

    return fallbackRequest(options);
  }
}

async function fallbackRequest(options: {
  url: string;
  method?: string;
  data?: any;
  header?: Record<string, string>;
}) {
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
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败 (${res.statusCode})`));
        }
      },
      fail: (err: any) => {
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

export const billService = {
  async createBill(data: {
    coupleId: string;
    amount: number;
    category?: string;
    categoryIcon?: string;
    description?: string;
    sweetWord?: string;
    paidBy?: string;
    paidByName?: string;
    paidByAvatar?: string;
    billDate?: string;
    billType?: string;
  }) {
    return request({
      url: '/api/bill',
      method: 'POST',
      data,
    });
  },

  async getBills(coupleId: string) {
    return request({
      url: `/api/bill/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async deleteBill(billId: string) {
    return request({
      url: `/api/bill/${billId}`,
      method: 'DELETE',
    });
  },
};

export const letterService = {
  async createLetter(data: {
    coupleId: string;
    title: string;
    content?: string;
    images?: string[];
    voiceUrl?: string;
    fromId: string;
    fromName: string;
    fromAvatar: string;
    toId?: string;
    openAt?: string;
  }) {
    return request({
      url: '/api/letter',
      method: 'POST',
      data,
    });
  },

  async getLetters(coupleId: string) {
    return request({
      url: `/api/letter/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async openLetter(letterId: string) {
    return request({
      url: `/api/letter/${letterId}/open`,
      method: 'POST',
    });
  },

  async deleteLetter(letterId: string) {
    return request({
      url: `/api/letter/${letterId}`,
      method: 'DELETE',
    });
  },
};

export const albumService = {
  async uploadPhoto(data: {
    coupleId: string;
    url: string;
    thumbnail?: string;
    description?: string;
    location?: string;
    takenAt?: string;
    uploadedBy?: string;
    uploadedByName?: string;
  }) {
    return request({
      url: '/api/album',
      method: 'POST',
      data,
    });
  },

  async getPhotos(coupleId: string) {
    return request({
      url: `/api/album/couple/${coupleId}`,
      method: 'GET',
    });
  },

  async deletePhoto(photoId: string) {
    return request({
      url: `/api/album/${photoId}`,
      method: 'DELETE',
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
  billService,
  letterService,
  albumService,
};
