import Taro from '@tarojs/taro';

// 分享数据接口
export interface ShareData {
  title: string;
  path: string;
  imageUrl?: string;
}

// 获取邀请绑定页面的分享路径
export const getInviteSharePath = (inviteCode: string): string => {
  return `/pages/bind/index?inviteCode=${inviteCode}`;
};

// 分享首页
export const shareHomePage = (): ShareData => {
  return {
    title: '恋人空间 - 记录我们的甜蜜时光',
    path: '/pages/home/index',
    imageUrl: 'https://picsum.photos/id/101/300/300'
  };
};

// 分享邀请绑定
export const shareInviteBinding = (inviteCode: string, userName: string): ShareData => {
  return {
    title: `${userName}邀请你加入恋人空间 ❤️`,
    path: getInviteSharePath(inviteCode),
    imageUrl: 'https://picsum.photos/id/101/300/300'
  };
};

// 分享纪念日
export const shareAnniversary = (title: string, daysLeft: number): ShareData => {
  return {
    title: `${daysLeft}天后是我们${title}的日子 ❤️`,
    path: '/pages/anniversary/index',
    imageUrl: 'https://picsum.photos/id/102/300/300'
  };
};

// 分享愿望清单
export const shareWishList = (completedCount: number, totalCount: number): ShareData => {
  return {
    title: `我们的愿望清单已完成${completedCount}/${totalCount}件 💕`,
    path: '/pages/wish/index',
    imageUrl: 'https://picsum.photos/id/103/300/300'
  };
};

// 分享日记
export const shareDiary = (content: string): ShareData => {
  const truncatedContent = content.length > 20 ? content.substring(0, 20) + '...' : content;
  return {
    title: `${truncatedContent} 💌`,
    path: '/pages/interact/index',
    imageUrl: 'https://picsum.photos/id/104/300/300'
  };
};

// 分享相册
export const shareAlbum = (photoCount: number): ShareData => {
  return {
    title: `我们的甜蜜相册 - ${photoCount}张照片 📸`,
    path: '/pages/album/index',
    imageUrl: 'https://picsum.photos/id/105/300/300'
  };
};

// 处理分享配置
export const handleShareAppMessage = (data: ShareData) => {
  return {
    title: data.title,
    path: data.path,
    imageUrl: data.imageUrl
  };
};

// 显示分享菜单
export const showShareMenu = () => {
  Taro.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  });
};

// 隐藏分享菜单
export const hideShareMenu = () => {
  Taro.hideShareMenu();
};

// 获取页面参数
export const getPageParams = (): Record<string, string> => {
  const pages = Taro.getCurrentPages();
  if (pages.length === 0) return {};
  
  const currentPage = pages[pages.length - 1];
  const { options } = currentPage;
  
  return options || {};
};
