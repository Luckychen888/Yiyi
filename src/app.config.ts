export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/interact/index',
    'pages/wish/index',
    'pages/shop/index',
    'pages/mine/index',
    'pages/diary-detail/index',
    'pages/anniversary/index',
    'pages/album/index',
    'pages/letter-detail/index',
    'pages/bill-detail/index',
    'pages/bind/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '恋人空间',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFF5F7'
  },
  tabBar: {
    color: '#B2BEC3',
    selectedColor: '#FF6B9D',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/interact/index',
        text: '互动'
      },
      {
        pagePath: 'pages/wish/index',
        text: '愿望'
      },
      {
        pagePath: 'pages/shop/index',
        text: '商城'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})