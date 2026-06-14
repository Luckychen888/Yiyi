import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { userService, coupleService } from '../../services/api';

const LoginPage: React.FC = () => {
  const { setCouple, setBound, setCurrentUser } = useCoupleStore();
  const [avatar, setAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(true);

  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const isLogin = Taro.getStorageSync('isLogin');
      const userId = Taro.getStorageSync('userId');
      
      if (isLogin && userId) {
        setIsAutoLogin(true);
        await restoreLoginState();
      } else {
        setIsAutoLogin(false);
      }
    } catch (error) {
      console.error('检查自动登录失败:', error);
      setIsAutoLogin(false);
    }
  };

  const restoreLoginState = async () => {
    try {
      const userId = Taro.getStorageSync('userId');
      const userName = Taro.getStorageSync('userName');
      const userAvatar = Taro.getStorageSync('userAvatar');
      const coupleData = Taro.getStorageSync('coupleData');
      const isBound = Taro.getStorageSync('isBound');

      setCurrentUser(userId, userName, userAvatar);

      if (coupleData && isBound) {
        setCouple(coupleData);
        setBound(true);
      }

      Taro.showToast({ title: '欢迎回来', icon: 'success' });
      
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1500);
    } catch (error) {
      console.error('恢复登录状态失败:', error);
      setIsAutoLogin(false);
    }
  };

  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail;
    setAvatar(avatarUrl);
  };

  const handleNicknameChange = (e: any) => {
    setNickname(e.detail.value);
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    
    try {
      const { code } = await Taro.login();
      
      const userProfile = await Taro.getUserProfile({
        desc: '用于完善会员资料'
      });

      const { nickName, avatarUrl } = userProfile.userInfo;
      
      await doLogin(nickName, avatarUrl, code);
    } catch (error: any) {
      console.error('微信授权失败:', error);
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        Taro.showToast({ title: '请授权登录', icon: 'none' });
      } else {
        Taro.showToast({ title: '授权失败，请重试', icon: 'none' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!avatar) {
      Taro.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    setIsLoading(true);

    try {
      const { code } = await Taro.login();
      await doLogin(nickname.trim(), avatar, code);
    } catch (error) {
      console.error('登录失败:', error);
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const doLogin = async (nickname: string, avatar: string, code: string) => {
    try {
      const loginRes: any = await userService.login({
        nickname,
        avatar,
        code
      });

      if (!loginRes.success) {
        Taro.showToast({ title: loginRes.message || '登录失败', icon: 'none' });
        return;
      }

      const userInfo = loginRes.data;

      const coupleRes: any = await coupleService.getCoupleInfoByUser(userInfo.id);
      const coupleData = coupleRes.success ? coupleRes.data : null;

      setCurrentUser(userInfo.id, userInfo.nickname, userInfo.avatar);

      if (coupleData) {
        setCouple(coupleData);
        setBound(true);
      }

      Taro.setStorageSync('userId', userInfo.id);
      Taro.setStorageSync('userName', userInfo.nickname);
      Taro.setStorageSync('userAvatar', userInfo.avatar);
      Taro.setStorageSync('userInfo', userInfo);
      Taro.setStorageSync('coupleData', coupleData || {});
      Taro.setStorageSync('isBound', !!coupleData);
      Taro.setStorageSync('isLogin', true);

      Taro.showToast({ title: '登录成功', icon: 'success' });

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1500);
    } catch (error) {
      throw error;
    }
  };

  if (isAutoLogin) {
    return (
      <View className={styles.loadingPage}>
        <View className={styles.loadingLogo}>
          <Text className={styles.loadingIcon}>❤️</Text>
        </View>
        <Text className={styles.loadingText}>正在加载...</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.loginContainer}>
        <View className={styles.logoSection}>
          <View className={styles.logo}>
            <Text className={styles.logoText}>❤️</Text>
          </View>
          <Text className={styles.appTitle}>恋人空间</Text>
          <Text className={styles.appDesc}>记录属于你们的甜蜜时光</Text>
        </View>

        <Button
          className={styles.quickLoginButton}
          onClick={handleQuickLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          <Text className={styles.wechatIcon}>💬</Text>
          <Text className={styles.quickLoginText}>微信快捷登录</Text>
        </Button>

        <View className={styles.divider}>
          <View className={styles.dividerLine}></View>
          <Text className={styles.dividerText}>或</Text>
          <View className={styles.dividerLine}></View>
        </View>

        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>头像</Text>
            <button
              className={styles.avatarButton}
              open-type="chooseAvatar"
              onChooseAvatar={handleChooseAvatar}
            >
              {avatar ? (
                <Image className={styles.avatarPreview} src={avatar} mode="aspectFill" />
              ) : (
                <View className={styles.avatarPlaceholder}>
                  <Text className={styles.avatarIcon}>👤</Text>
                </View>
              )}
            </button>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>昵称</Text>
            <Input
              className={styles.input}
              placeholder="请输入您的昵称"
              value={nickname}
              onInput={handleNicknameChange}
              maxLength={20}
            />
          </View>
        </View>

        <Button
          className={styles.loginButton}
          onClick={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          <Text className={styles.loginButtonText}>{isLoading ? '登录中...' : '开始恋爱之旅'}</Text>
        </Button>

        <Text className={styles.tipText}>登录即表示同意《用户协议》和《隐私政策》</Text>
      </View>
    </View>
  );
};

export default LoginPage;