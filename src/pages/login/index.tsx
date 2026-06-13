import React, { useState } from 'react';
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

  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail;
    setAvatar(avatarUrl);
  };

  const handleNicknameChange = (e: any) => {
    setNickname(e.detail.value);
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

      // 调用后端登录接口
      const loginRes: any = await userService.login({
        nickname: nickname.trim(),
        avatar: avatar,
        code: code
      });

      if (!loginRes.success) {
        Taro.showToast({ title: loginRes.message || '登录失败', icon: 'none' });
        return;
      }

      const userInfo = loginRes.data;

      // 查询是否已有情侣关系
      const coupleRes: any = await coupleService.getCoupleInfoByUser(userInfo.id);
      const coupleData = coupleRes.success ? coupleRes.data : null;

      // 保存到状态管理
      setCurrentUser(userInfo.id, userInfo.nickname, userInfo.avatar);

      if (coupleData) {
        setCouple(coupleData);
        setBound(true);
      }

      // 持久化保存到本地存储
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
      console.error('登录失败:', error);
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

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