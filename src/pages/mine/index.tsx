import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { getWishStats } from '../../data/wishes';
import { getBillStats } from '../../data/bill';
import { diariesData } from '../../data/diaries';

const MinePage: React.FC = () => {
  const { couple, loveDays } = useCoupleStore();
  const wishStats = getWishStats();
  const billStats = getBillStats();

  // 菜单项
  const menuItems = [
    { 
      id: 'anniversary', 
      icon: '📅', 
      title: '纪念日管理', 
      desc: '添加和管理重要纪念日',
      url: '/pages/anniversary/index'
    },
    { 
      id: 'album', 
      icon: '📷', 
      title: '双人相册', 
      desc: '查看甜蜜照片墙',
      url: '/pages/album/index'
    },
    { 
      id: 'bill', 
      icon: '💰', 
      title: '共同记账', 
      desc: `已记录 ${billStats.count} 笔账单`,
      url: '/pages/bill-detail/index'
    },
    { 
      id: 'letter', 
      icon: '💌', 
      title: '时光胶囊', 
      desc: '写给未来的情书',
      url: '/pages/letter-detail/index'
    }
  ];

  // 设置项
  const settingItems = [
    { id: 'bind', icon: '🔗', title: '情侣绑定', value: '已绑定' },
    { id: 'theme', icon: '🎨', title: '主题设置', value: '粉色系' },
    { id: 'feedback', icon: '💬', title: '意见反馈', value: '' },
    { id: 'about', icon: 'ℹ️', title: '关于我们', value: 'v1.0.0' },
    { id: 'logout', icon: '🚪', title: '退出登录', value: '', danger: true }
  ];

  // 点击菜单
  const handleMenuClick = (url: string) => {
    Taro.navigateTo({ url });
  };

  // 点击设置
  const handleSettingClick = (id: string) => {
    switch (id) {
      case 'bind':
        Taro.navigateTo({ url: '/pages/bind/index' });
        break;
      case 'theme':
        Taro.showToast({ title: '主题切换功能开发中...', icon: 'none' });
        break;
      case 'feedback':
        Taro.showToast({ title: '反馈功能开发中...', icon: 'none' });
        break;
      case 'about':
        Taro.showToast({ title: '恋人空间 v1.0.0', icon: 'none' });
        break;
      case 'logout':
        Taro.showModal({
          title: '确认退出',
          content: '确定要退出登录吗？',
          success: (res) => {
            if (res.confirm) {
              Taro.removeStorageSync('userInfo');
              Taro.removeStorageSync('isLogin');
              Taro.reLaunch({ url: '/pages/login/index' });
            }
          }
        });
        break;
    }
  };

  return (
    <ScrollView 
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
    >
      {/* 用户信息 */}
      <View className={styles.userCard}>
        <View className={styles.userHeader}>
          <Image 
            className={styles.userAvatar}
            src={couple?.user1Avatar || ''}
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{couple?.user1Name}</Text>
            <Text className={styles.userStatus}>恋爱 {loveDays} 天</Text>
          </View>
        </View>
        <View className={styles.coupleInfo}>
          <Image 
            className={styles.partnerAvatar}
            src={couple?.user1Avatar || ''}
            mode="aspectFill"
          />
          <Text className={styles.heartIcon}>❤️</Text>
          <Image 
            className={styles.partnerAvatar}
            src={couple?.user2Avatar || ''}
            mode="aspectFill"
          />
          <Text className={styles.partnerName}>{couple?.user2Name}</Text>
        </View>
      </View>

      {/* 数据统计 */}
      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>恋爱数据</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{loveDays}</Text>
            <Text className={styles.statLabel}>恋爱天数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{diariesData.length}</Text>
            <Text className={styles.statLabel}>甜蜜记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{wishStats.completed}</Text>
            <Text className={styles.statLabel}>愿望达成</Text>
          </View>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className={styles.menuList}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <View 
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.url)}
            >
              <View className={styles.menuIcon}>
                <Text className={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>{item.title}</Text>
                <Text className={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            {index < menuItems.length - 1 && <View className={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </View>

      {/* 设置 */}
      <View className={styles.settingList}>
        {settingItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <View 
              className={styles.settingItem}
              onClick={() => handleSettingClick(item.id)}
            >
              <View className={styles.settingLeft}>
                <View className={styles.settingIcon}>
                  <Text className={styles.settingIconText}>{item.icon}</Text>
                </View>
                <Text className={item.danger ? styles.settingTitleDanger : styles.settingTitle}>
                  {item.title}
                </Text>
              </View>
              {item.value && <Text className={styles.settingValue}>{item.value}</Text>}
            </View>
            {index < settingItems.length - 1 && <View className={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
};

export default MinePage;