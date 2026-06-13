import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import './app.scss';
import { useCoupleStore } from './store/useCoupleStore';

// 防止启动时重复跳转的标志位
let hasLaunched = false;

function App(props) {
  const { setCouple, setBound, setCurrentUser } = useCoupleStore();

  // 只在启动时执行一次初始化
  useEffect(() => {
    if (!hasLaunched) {
      hasLaunched = true;
      setTimeout(() => {
        restoreLoginState();
      }, 100);
    }
  }, []);

  // 小程序从后台返回时检查状态（非启动场景）
  useDidShow(() => {
    // 启动时已经处理过，这里只处理从后台返回的情况
    if (hasLaunched) {
      checkAndRestoreState();
    }
  });

  useDidHide(() => {});

  // 启动时恢复登录状态
  const restoreLoginState = () => {
    try {
      const isLogin = Taro.getStorageSync('isLogin');
      const userId = Taro.getStorageSync('userId');

      if (isLogin && userId) {
        // 恢复用户信息
        const coupleData = Taro.getStorageSync('coupleData');
        const isBound = Taro.getStorageSync('isBound');
        
        setCurrentUser(userId);
        
        if (coupleData && isBound) {
          setCouple(coupleData);
          setBound(true);
        }
        
        console.log('已恢复登录状态');
      } else {
        // 未登录，跳转到登录页
        navigateToLogin();
      }
    } catch (error) {
      console.error('恢复登录状态失败:', error);
      navigateToLogin();
    }
  };

  // 后台返回时检查状态（不跳转，只恢复状态）
  const checkAndRestoreState = () => {
    try {
      const isLogin = Taro.getStorageSync('isLogin');
      const userId = Taro.getStorageSync('userId');
      
      if (isLogin && userId) {
        const coupleData = Taro.getStorageSync('coupleData');
        const isBound = Taro.getStorageSync('isBound');
        
        setCurrentUser(userId);
        
        if (coupleData && isBound) {
          setCouple(coupleData);
          setBound(true);
        }
      }
    } catch (error) {
      console.error('检查状态失败:', error);
    }
  };

  // 跳转到登录页（确保只跳转一次）
  const navigateToLogin = () => {
    try {
      const pages = Taro.getCurrentPages();
      if (pages.length === 0) {
        // 页面栈为空，直接跳转到首页（由首页判断是否需要登录）
        Taro.reLaunch({
          url: '/pages/home/index'
        });
      } else {
        const currentPage = pages[pages.length - 1];
        if (!currentPage.route.includes('login') && !currentPage.route.includes('home')) {
          Taro.reLaunch({
            url: '/pages/home/index'
          });
        }
      }
    } catch (error) {
      console.error('跳转失败:', error);
    }
  };

  return props.children;
}

export default App;