import React from 'react';
import { useDidShow } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import './app.scss';
import { useCoupleStore } from './store/useCoupleStore';

function App(props) {
  const { setCouple, setBound, setCurrentUser } = useCoupleStore();

  // 小程序显示时恢复状态（不跳转，只恢复数据）
  useDidShow(() => {
    restoreState();
  });

  // 从本地存储恢复状态
  const restoreState = () => {
    try {
      const isLogin = Taro.getStorageSync('isLogin');
      const userId = Taro.getStorageSync('userId');

      if (isLogin && userId) {
        const userName = Taro.getStorageSync('userName');
        const userAvatar = Taro.getStorageSync('userAvatar');
        const coupleData = Taro.getStorageSync('coupleData');
        const isBound = Taro.getStorageSync('isBound');

        setCurrentUser(userId, userName, userAvatar);

        if (coupleData && isBound) {
          setCouple(coupleData);
          setBound(true);
        }
      }
    } catch (error) {
      console.error('恢复状态失败:', error);
    }
  };

  return props.children;
}

export default App;