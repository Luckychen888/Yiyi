import React, { useState } from 'react';
import { View, Text, Image, Input, Button } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';

const BindPage: React.FC = () => {
  const { couple, createCouple, bindPartner, unbindCouple, generateInviteCode } = useCoupleStore();
  const [activeTab, setActiveTab] = useState<'share' | 'join'>('share');
  const [inviteCode, setInviteCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerAvatar, setPartnerAvatar] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const BIND_TEMPLATE_ID = 'ye6sttAhDmQPb_KxXUIsnpoUH87dn1BAUSsUHMLVoo0';

  const isBound = couple && couple.user2Id;

  // 从分享链接获取邀请码
  useDidShow(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.options) {
      const { inviteCode: codeFromShare } = currentPage.options;
      
      if (codeFromShare && !isBound) {
        setInviteCode(codeFromShare);
        setActiveTab('join');
      }
    }
  });

  // 分享给朋友
  useShareAppMessage(() => {
    const code = couple?.inviteCode || '';
    return {
      title: `${couple?.user1Name || '我'}邀请你加入恋人空间 ❤️`,
      path: `/pages/bind/index?inviteCode=${code}`,
      imageUrl: couple?.user1Avatar || 'https://picsum.photos/id/101/300/300'
    };
  });

  // 分享到朋友圈
  useShareTimeline(() => {
    const code = couple?.inviteCode || '';
    return {
      title: `邀请你加入恋人空间，一起记录甜蜜时光 💕\n我的邀请码：${code}`,
      query: `inviteCode=${code}`,
      imageUrl: couple?.user1Avatar || 'https://picsum.photos/id/101/300/300'
    };
  });

  const handleCopyCode = () => {
    if (!couple?.inviteCode) return;
    Taro.setClipboardData({
      data: couple.inviteCode,
      success: () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    Taro.showToast({
      title: '点击右上角分享',
      icon: 'none',
      duration: 2000
    });
  };

  const handleRefreshCode = () => {
    Taro.showModal({
      title: '确认更换邀请码',
      content: '更换邀请码后，旧邀请码将失效，确定要更换吗？',
      success: (res) => {
        if (res.confirm) {
          generateInviteCode();
          Taro.showToast({ title: '邀请码已更新', icon: 'success' });
        }
      }
    });
  };

  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail;
    setPartnerAvatar(avatarUrl);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Taro.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    if (!partnerName.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!partnerAvatar) {
      Taro.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }

    // 先请求订阅消息授权，无论是否授权都继续绑定流程
    try {
      await Taro.requestSubscribeMessage({
        tmplIds: [BIND_TEMPLATE_ID],
      });
    } catch (e) {
      // 订阅授权跳过
    }

    const success = await bindPartner(inviteCode.trim(), partnerName.trim(), partnerAvatar);
    if (success) {
      const updatedCouple = useCoupleStore.getState().couple;
      if (updatedCouple) {
        Taro.setStorageSync('coupleData', updatedCouple);
        Taro.setStorageSync('isBound', true);
      }
      Taro.showToast({ title: '绑定成功 💕', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } else {
      Taro.showToast({ title: '邀请码错误', icon: 'none' });
    }
  };

  const handleCreateCouple = async () => {
    setIsCreating(true);
    try {
      const success = await createCouple();
      if (success) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '创建失败，请重试', icon: 'none' });
      }
    } catch (e) {
      Taro.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUnbind = () => {
    Taro.showModal({
      title: '确认解除绑定',
      content: '确定要解除情侣绑定吗？',
      success: (res) => {
        if (res.confirm) {
          unbindCouple();
          // 清除情侣绑定数据
          Taro.removeStorageSync('coupleData');
          Taro.setStorageSync('isBound', false);
          Taro.showToast({ title: '已解除绑定', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      {!couple ? (
        <View className={styles.content}>
          <View className={styles.card}>
            <View className={styles.createSection}>
              <Text className={styles.createIcon}>💑</Text>
              <Text className={styles.createTitle}>创建情侣空间</Text>
              <Text className={styles.createDesc}>创建后可邀请你的另一半加入</Text>
              <Button 
                className={styles.primaryButton} 
                onClick={handleCreateCouple}
                loading={isCreating}
                disabled={isCreating}
              >
                <Text className={styles.primaryButtonText}>
                  {isCreating ? '创建中...' : '立即创建'}
                </Text>
              </Button>
            </View>
          </View>

          <View className={styles.card}>
            <Text className={styles.cardTitle}>或加入TA的情侣空间</Text>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>邀请码</Text>
              <Input
                className={styles.input}
                placeholder="请输入邀请码"
                value={inviteCode}
                onInput={(e) => setInviteCode(e.detail.value.toUpperCase())}
                maxLength={10}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>昵称</Text>
              <Input
                className={styles.input}
                placeholder="请输入你的昵称"
                value={partnerName}
                onInput={(e) => setPartnerName(e.detail.value)}
                maxLength={20}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>头像</Text>
              <button
                className={styles.avatarButton}
                open-type="chooseAvatar"
                onChooseAvatar={handleChooseAvatar}
              >
                {partnerAvatar ? (
                  <Image className={styles.avatarPreview} src={partnerAvatar} mode="aspectFill" />
                ) : (
                  <View className={styles.avatarPlaceholder}>
                    <Text className={styles.avatarIcon}>👤</Text>
                  </View>
                )}
              </button>
            </View>
            <Button className={styles.primaryButton} onClick={handleJoin}>
              <Text className={styles.primaryButtonText}>加入情侣</Text>
            </Button>
          </View>
        </View>
      ) : (
        <>
          {/* 用户卡片 */}
          <View className={styles.userCard}>
            <View className={styles.userHeader}>
              <Image 
                className={styles.userAvatar}
                src={couple?.user1Avatar || ''}
                mode="aspectFill"
              />
              <View className={styles.userInfo}>
                <Text className={styles.userName}>{couple?.user1Name}</Text>
                <Text className={styles.userStatus}>
                  {isBound ? '已绑定' : '未绑定'}
                </Text>
              </View>
            </View>
            
            {/* 情侣信息 */}
            <View className={styles.coupleInfo}>
              <View className={styles.avatarItem}>
                <Image 
                  className={styles.partnerAvatar}
                  src={couple?.user1Avatar || ''}
                  mode="aspectFill"
                />
                <Text className={styles.avatarLabel}>我</Text>
              </View>
              <Text className={styles.heartIcon}>❤️</Text>
              <View className={styles.avatarItem}>
                <Image 
                  className={styles.partnerAvatar}
                  src={couple?.user2Avatar || ''}
                  mode="aspectFill"
                />
                <Text className={styles.avatarLabel}>{couple?.user2Name || 'Ta'}</Text>
              </View>
            </View>
          </View>

          {/* Tab切换 */}
          <View className={styles.tabBar}>
            <View
              className={`${styles.tabItem} ${activeTab === 'share' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('share')}
            >
              <Text className={styles.tabText}>分享邀请</Text>
            </View>
            <View
              className={`${styles.tabItem} ${activeTab === 'join' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('join')}
            >
              <Text className={styles.tabText}>加入情侣</Text>
            </View>
          </View>

          {/* 分享邀请码 */}
          {activeTab === 'share' && (
            <View className={styles.content}>
              <View className={styles.card}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>我的邀请码</Text>
                  <Button className={styles.refreshButton} onClick={handleRefreshCode}>
                    <Text className={styles.refreshIcon}>🔄</Text>
                  </Button>
                </View>
                
                <View className={styles.codeDisplay}>
                  <Text className={styles.codeText}>{couple?.inviteCode}</Text>
                </View>

                <View className={styles.buttonGroup}>
                  <Button className={styles.primaryButton} onClick={handleCopyCode}>
                    <Text className={styles.primaryButtonText}>
                      {copied ? '✓ 已复制' : '复制邀请码'}
                    </Text>
                  </Button>
                  <Button className={styles.secondaryButton} onClick={handleShare}>
                    <Text className={styles.secondaryButtonText}>📤 分享</Text>
                  </Button>
                </View>

                <Text className={styles.tipText}>
                  对方点击分享链接即可自动绑定
                </Text>
              </View>

              {/* 绑定步骤 */}
              <View className={styles.card}>
                <Text className={styles.cardTitle}>绑定步骤</Text>
                <View className={styles.stepList}>
                  <View className={styles.stepItem}>
                    <Text className={styles.stepNumber}>1</Text>
                    <Text className={styles.stepText}>点击「分享」按钮</Text>
                  </View>
                  <View className={styles.stepItem}>
                    <Text className={styles.stepNumber}>2</Text>
                    <Text className={styles.stepText}>发送给另一半</Text>
                  </View>
                  <View className={styles.stepItem}>
                    <Text className={styles.stepNumber}>3</Text>
                    <Text className={styles.stepText}>Ta打开链接即可绑定</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 加入情侣 */}
          {activeTab === 'join' && (
            <View className={styles.content}>
              <View className={styles.card}>
                <Text className={styles.cardTitle}>输入邀请码</Text>
                
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>邀请码</Text>
                  <Input
                    className={styles.input}
                    placeholder="请输入10位邀请码"
                    value={inviteCode}
                    onInput={(e) => setInviteCode(e.detail.value.toUpperCase())}
                    maxLength={10}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>昵称</Text>
                  <Input
                    className={styles.input}
                    placeholder="请输入你的昵称"
                    value={partnerName}
                    onInput={(e) => setPartnerName(e.detail.value)}
                    maxLength={20}
                  />
                </View>

                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>头像</Text>
                  <button
                    className={styles.avatarButton}
                    open-type="chooseAvatar"
                    onChooseAvatar={handleChooseAvatar}
                  >
                    {partnerAvatar ? (
                      <Image className={styles.avatarPreview} src={partnerAvatar} mode="aspectFill" />
                    ) : (
                      <View className={styles.avatarPlaceholder}>
                        <Text className={styles.avatarIcon}>👤</Text>
                      </View>
                    )}
                  </button>
                </View>

                <Button className={styles.primaryButton} onClick={handleJoin}>
                  <Text className={styles.primaryButtonText}>加入情侣</Text>
                </Button>
              </View>
            </View>
          )}

          {/* 已绑定 - 显示邀请码 */}
          {isBound && (
            <View className={styles.content}>
              <View className={styles.card}>
                <Text className={styles.cardTitle}>专属邀请码</Text>
                <View className={styles.codeDisplay}>
                  <Text className={styles.codeText}>{couple?.inviteCode}</Text>
                </View>
                <View className={styles.buttonGroup}>
                  <Button className={styles.primaryButton} onClick={handleCopyCode}>
                    <Text className={styles.primaryButtonText}>
                      {copied ? '✓ 已复制' : '复制邀请码'}
                    </Text>
                  </Button>
                  <Button className={styles.secondaryButton} onClick={handleShare}>
                    <Text className={styles.secondaryButtonText}>📤 分享</Text>
                  </Button>
                </View>
              </View>

              <Button className={styles.dangerButton} onClick={handleUnbind}>
                <Text className={styles.dangerButtonText}>解除绑定</Text>
              </Button>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default BindPage;