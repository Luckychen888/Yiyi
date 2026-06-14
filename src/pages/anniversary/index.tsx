import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, Picker } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import type { Anniversary } from '../../types/couple';

// 日期解析：支持多种格式自动转换为 yyyy-MM-dd
function parseDateInput(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const now = new Date();
  const year = now.getFullYear();

  // yyyy-MM-dd / yyyy.MM.dd / yyyy/MM/dd
  let m = trimmed.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  // MM-dd / MM.dd / MM/dd (当年)
  m = trimmed.match(/^(\d{1,2})[-.\/](\d{1,2})$/);
  if (m) return `${year}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;

  // 4位数字 MMdd（如 0101, 1225）
  m = trimmed.match(/^(\d{4})$/);
  if (m) {
    const mm = m[1].substring(0, 2);
    const dd = m[1].substring(2, 4);
    return `${year}-${mm}-${dd}`;
  }

  // 2位数字 MMdd
  m = trimmed.match(/^(\d{1,2})(\d{2})$/);
  if (m && parseInt(m[1]) >= 1 && parseInt(m[1]) <= 12) {
    return `${year}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }

  // 中文 X月X日
  m = trimmed.match(/^(\d{1,2})月(\d{1,2})[日号]?$/);
  if (m) return `${year}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;

  return null;
}

const AnniversaryPage: React.FC = () => {
  const { anniversaries, loadAnniversaries, addAnniversary, updateAnniversary, deleteAnniversary } = useCoupleStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Anniversary | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'custom' as 'love' | 'birthday' | 'custom',
    icon: '🎂',
    remindDays: 0,
    isRemind: false,
    remindTime: '09:00'
  });

  useEffect(() => {
    loadAnniversaries();
  }, []);

  // 分享给朋友
  useShareAppMessage(() => {
    const upcomingAnni = anniversaries[0];
    const title = upcomingAnni 
      ? `${getDaysUntil(upcomingAnni.date)}天后是我们${upcomingAnni.title}的日子 ❤️`
      : '我们的纪念日 - 恋人空间';
    return {
      title,
      path: '/pages/anniversary/index',
      imageUrl: 'https://picsum.photos/id/102/300/300'
    };
  });

  // 分享到朋友圈
  useShareTimeline(() => {
    const upcomingAnni = anniversaries[0];
    const title = upcomingAnni 
      ? `${getDaysUntil(upcomingAnni.date)}天后是我们${upcomingAnni.title}的日子 ❤️`
      : '我们的纪念日 - 恋人空间';
    return {
      title,
      query: '',
      imageUrl: 'https://picsum.photos/id/102/300/300'
    };
  });

  const iconOptions = [
    { value: '💕', label: '恋爱' },
    { value: '🎂', label: '生日' },
    { value: '💍', label: '求婚' },
    { value: '🤵', label: '婚礼' },
    { value: '✈️', label: '旅行' },
    { value: '🤝', label: '牵手' },
    { value: '💋', label: '初吻' },
    { value: '💯', label: '百日' },
    { value: '🎁', label: '礼物' },
    { value: '📸', label: '合影' }
  ];

  const typeOptions = [
    { value: 'love', label: '恋爱相关' },
    { value: 'birthday', label: '生日' },
    { value: 'custom', label: '自定义' }
  ];

  const remindTimeOptions = [
    { value: '08:00', label: '早上8点' },
    { value: '09:00', label: '上午9点' },
    { value: '12:00', label: '中午12点' },
    { value: '18:00', label: '下午6点' },
    { value: '20:00', label: '晚上8点' }
  ];

  const getDaysUntil = (dateStr: string): number => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    
    let diff = target.getTime() - today.getTime();
    let days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) {
      const nextYear = new Date(target);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      diff = nextYear.getTime() - today.getTime();
      days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    return days;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const TEMPLATE_ID = 'EzWVVfGH0hfcou80ekmjrsqwVzQobr_So4eJwH30xMA';

  // 订阅消息提醒
  const handleRequestRemind = async () => {
    try {
      const res = await Taro.requestSubscribeMessage({
        tmplIds: [TEMPLATE_ID],
      });

      if (res[TEMPLATE_ID] === 'accept') {
        Taro.showToast({
          title: '提醒订阅成功',
          icon: 'success'
        });
        await saveRemindSubscription();
        return true;
      } else if (res[TEMPLATE_ID] === 'reject') {
        Taro.showModal({
          title: '订阅失败',
          content: '您已拒绝订阅消息提醒，可在小程序设置中重新开启',
          showCancel: false
        });
        return false;
      } else {
        Taro.showToast({
          title: '订阅失败，可稍后重试',
          icon: 'none'
        });
        return false;
      }
    } catch (error) {
      console.error('订阅消息出错', error);
      Taro.showToast({
        title: '订阅功能暂不可用',
        icon: 'none'
      });
      return false;
    }
  };

  // 保存订阅状态到服务器
  const saveRemindSubscription = async () => {
    try {
      const BASE_URL = 'https://yiyi-269720-9-1442837704.sh.run.tcloudbase.com';
      const response = await Taro.request({
        url: `${BASE_URL}/api/message/subscribe`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          anniversaryId: editingItem?.id || '',
          remindDays: formData.remindDays,
          remindTime: formData.remindTime
        }
      });

      if (response.data?.success) {
        // 订阅状态保存成功
      }
    } catch (error) {
      console.error('保存订阅状态失败', error);
    }
  };

  // 计算提醒日期
  const calculateRemindDate = (anniDate: string, remindDays: number): string => {
    const date = new Date(anniDate);
    date.setDate(date.getDate() - remindDays);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const today = new Date().toISOString().split('T')[0];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      date: today,
      type: 'custom',
      icon: '🎂',
      remindDays: 0,
      isRemind: false,
      remindTime: '09:00'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: Anniversary) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      date: item.date,
      type: item.type,
      icon: item.icon,
      remindDays: item.remindDays,
      isRemind: item.isRemind,
      remindTime: item.remindTime || '09:00'
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入纪念日名称', icon: 'none' });
      return;
    }
    if (!formData.date) {
      Taro.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }

    if (formData.isRemind) {
      const subscribed = await handleRequestRemind();
      if (!subscribed) {
        return;
      }
    }

    if (editingItem) {
      updateAnniversary(editingItem.id, formData);
      Taro.showToast({ title: '修改成功', icon: 'success' });
    } else {
      addAnniversary(formData);
      Taro.showToast({ title: '添加成功', icon: 'success' });
    }
    
    setShowAddModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteAnniversary(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const sortedAnniversaries = [...anniversaries].sort((a, b) => {
    const daysA = getDaysUntil(a.date);
    const daysB = getDaysUntil(b.date);
    return daysA - daysB;
  });

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>纪念日管理</Text>
        <Text className={styles.headerDesc}>记录你们的重要日子</Text>
      </View>

      {/* 统计卡片 */}
      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{anniversaries.length}</Text>
          <Text className={styles.statLabel}>纪念日总数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{anniversaries.filter(a => a.isRemind).length}</Text>
          <Text className={styles.statLabel}>已设置提醒</Text>
        </View>
      </View>

      {/* 纪念日列表 */}
      <View className={styles.listSection}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>所有纪念日</Text>
          <Button className={styles.addButton} onClick={handleOpenAddModal}>
            <Text className={styles.addButtonText}>+ 添加</Text>
          </Button>
        </View>

        {sortedAnniversaries.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyText}>还没有添加纪念日</Text>
            <Text className={styles.emptyDesc}>点击上方按钮添加你们的第一个纪念日</Text>
          </View>
        ) : (
          <View className={styles.list}>
            {sortedAnniversaries.map((item) => {
              const daysUntil = getDaysUntil(item.date);
              return (
                <View key={item.id} className={styles.listItem}>
                  <View className={styles.itemLeft}>
                    <View className={styles.itemIcon}>
                      <Text className={styles.itemIconText}>{item.icon}</Text>
                    </View>
                    <View className={styles.itemContent}>
                      <Text className={styles.itemTitle}>{item.title}</Text>
                      {item.description && (
                        <Text className={styles.itemDesc}>{item.description}</Text>
                      )}
                      <View className={styles.itemMeta}>
                        <Text className={styles.itemDate}>{formatDate(item.date)}</Text>
                        {item.isRemind && (
                          <View className={styles.remindBadge}>
                            <Text className={styles.remindBadgeText}>🔔 提醒</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View className={styles.itemRight}>
                    <View className={styles.daysContainer}>
                      <Text className={styles.daysValue}>{daysUntil}</Text>
                      <Text className={styles.daysLabel}>天后</Text>
                    </View>
                    <View className={styles.itemActions}>
                      <Text 
                        className={styles.actionIcon} 
                        onClick={() => handleOpenEditModal(item)}
                      >
                        ✏️
                      </Text>
                      <Text 
                        className={styles.actionIcon} 
                        onClick={() => handleDelete(item.id, item.title)}
                      >
                        🗑️
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>{editingItem ? '编辑纪念日' : '添加纪念日'}</Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>✕</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              {/* 名称 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>名称 *</Text>
                <input
                  className={styles.input}
                  placeholder="如：在一起100天纪念日"
                  value={formData.title}
                  onInput={(e: any) => setFormData({ ...formData, title: e.detail.value })}
                  maxLength={20}
                />
              </View>

              {/* 描述 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>描述（选填）</Text>
                <textarea
                  className={styles.textarea}
                  placeholder="写下这个纪念日的意义或小愿望..."
                  value={formData.description}
                  onInput={(e: any) => setFormData({ ...formData, description: e.detail.value })}
                  maxLength={100}
                  autoHeight
                />
              </View>

              {/* 日期选择 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>日期 *</Text>
                <View className={styles.dateInputWrap}>
                  <Input
                    className={styles.dateInput}
                    placeholder="如：2024-01-01 或 1月1日 或 0101"
                    value={formData.date}
                    onInput={(e: any) => {
                      const val = e.detail.value;
                      const parsed = parseDateInput(val);
                      setFormData({ ...formData, date: parsed || val });
                    }}
                    onBlur={(e: any) => {
                      const val = e.detail.value;
                      if (val) {
                        const parsed = parseDateInput(val);
                        if (parsed) {
                          setFormData({ ...formData, date: parsed });
                        }
                      }
                    }}
                    maxLength={20}
                  />
                  <Picker mode="date" value={formData.date} onChange={(e: any) => setFormData({ ...formData, date: e.detail.value })}>
                    <View className={styles.datePickerBtn}>
                      <Text>📅</Text>
                    </View>
                  </Picker>
                </View>
                {formData.date && (
                  <Text className={styles.datePreview}>已选择：{formData.date}</Text>
                )}
              </View>

              {/* 类型 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>类型</Text>
                <View className={styles.typeSelector}>
                  {typeOptions.map((option) => (
                    <View
                      key={option.value}
                      className={`${styles.typeOption} ${formData.type === option.value ? styles.typeActive : ''}`}
                      onClick={() => setFormData({ ...formData, type: option.value as 'love' | 'birthday' | 'custom' })}
                    >
                      <Text className={styles.typeOptionText}>{option.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 图标 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>图标</Text>
                <View className={styles.iconGrid}>
                  {iconOptions.map((option) => (
                    <View
                      key={option.value}
                      className={`${styles.iconOption} ${formData.icon === option.value ? styles.iconActive : ''}`}
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                    >
                      <Text className={styles.iconOptionText}>{option.value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 提醒设置 */}
              <View className={styles.formItem}>
                <View className={styles.switchRow}>
                  <View>
                    <Text className={styles.formLabel}>服务号提醒</Text>
                    <Text className={styles.formTip}>开启后将在纪念日临近时推送通知</Text>
                  </View>
                  <switch
                    className={styles.switch}
                    checked={formData.isRemind}
                    color="#FF6B9D"
                    onChange={(e: any) => setFormData({ ...formData, isRemind: e.detail.value })}
                  />
                </View>
              </View>

              {formData.isRemind && (
                <>
                  {/* 提前提醒天数 */}
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>提前提醒</Text>
                    <View className={styles.remindDaysSelector}>
                      {[0, 1, 3, 7, 14].map((days) => (
                        <View
                          key={days}
                          className={`${styles.remindDayOption} ${formData.remindDays === days ? styles.remindDayActive : ''}`}
                          onClick={() => setFormData({ ...formData, remindDays: days })}
                        >
                          <Text className={styles.remindDayText}>{days === 0 ? '当天' : `${days}天`}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 提醒时间 */}
                  <View className={styles.formItem}>
                    <Text className={styles.formLabel}>提醒时间</Text>
                    <View className={styles.remindTimeSelector}>
                      {remindTimeOptions.map((option) => (
                        <View
                          key={option.value}
                          className={`${styles.remindTimeOption} ${formData.remindTime === option.value ? styles.remindTimeActive : ''}`}
                          onClick={() => setFormData({ ...formData, remindTime: option.value })}
                        >
                          <Text className={styles.remindTimeText}>{option.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 提醒预览 */}
                  <View className={styles.remindPreview}>
                    <Text className={styles.remindPreviewIcon}>📅</Text>
                    <Text className={styles.remindPreviewText}>
                      将在 {calculateRemindDate(formData.date || new Date().toISOString().split('T')[0], formData.remindDays)} {formData.remindTime} 发送提醒
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.confirmButton} onClick={handleSubmit}>
                <Text className={styles.confirmButtonText}>{editingItem ? '保存修改' : '确认添加'}</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AnniversaryPage;