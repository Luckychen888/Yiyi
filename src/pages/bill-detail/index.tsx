import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { billService } from '../../services/api';
import { billCategories } from '../../data/bill';

const BillDetailPage: React.FC = () => {
  const { couple, currentUserId, currentUserName, currentUserAvatar } = useCoupleStore();
  const [bills, setBills] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    sweetWord: '',
    billDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (couple) {
      loadBills();
    }
  }, [couple?.id]);

  const loadBills = async () => {
    try {
      const response: any = await billService.getBills(couple!.id);
      if (response.success && response.data) {
        setBills(response.data);
      }
    } catch (error) {
      console.error('加载账单失败:', error);
    }
  };

  const totalAmount = bills.reduce((sum, b) => sum + Number(b.amount), 0);
  const user1Paid = bills.filter(b => b.paid_by === couple?.user1Id).reduce((sum, b) => sum + Number(b.amount), 0);
  const user2Paid = totalAmount - user1Paid;

  const filteredBills = activeCategory === '全部'
    ? bills
    : bills.filter(b => b.category === activeCategory);

  const handleSubmit = async () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      Taro.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }

    try {
      const categoryInfo = billCategories.find(c => c.id === formData.category);
      const response: any = await billService.createBill({
        coupleId: couple!.id,
        amount: Number(formData.amount),
        category: formData.category,
        categoryIcon: categoryInfo?.icon || '💰',
        description: formData.description,
        sweetWord: formData.sweetWord,
        paidBy: currentUserId,
        paidByName: currentUserName,
        paidByAvatar: currentUserAvatar,
        billDate: formData.billDate,
        billType: 'common'
      });

      if (response.success) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setShowAddModal(false);
        setFormData({ amount: '', category: 'food', description: '', sweetWord: '', billDate: new Date().toISOString().split('T')[0] });
        loadBills();
      }
    } catch (error) {
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  };

  const handleDelete = (id: string, description: string) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${description || '这笔账单'}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await billService.deleteBill(id);
            Taro.showToast({ title: '已删除', icon: 'success' });
            loadBills();
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const categories = ['全部', ...billCategories.map(c => c.name)];

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>共同记账</Text>
        <Text className={styles.headerDesc}>记录你们的每一笔甜蜜开销</Text>
      </View>

      {/* 统计卡片 */}
      <View className={styles.statsCard}>
        <View className={styles.statsMain}>
          <Text className={styles.statsLabel}>总开销</Text>
          <Text className={styles.statsValue}>¥{totalAmount.toFixed(2)}</Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statsItem}>
            <Text className={styles.statsItemLabel}>{couple?.user1Name || '我'}支出</Text>
            <Text className={styles.statsItemValue}>¥{user1Paid.toFixed(2)}</Text>
          </View>
          <View className={styles.statsDivider} />
          <View className={styles.statsItem}>
            <Text className={styles.statsItemLabel}>{couple?.user2Name || 'Ta'}支出</Text>
            <Text className={styles.statsItemValue}>¥{user2Paid.toFixed(2)}</Text>
          </View>
        </View>
        {user1Paid !== user2Paid && (
          <View className={styles.settlement}>
            <Text className={styles.settlementText}>
              {user1Paid > user2Paid
                ? `${couple?.user2Name || 'Ta'} 需向 ${couple?.user1Name || '我'} 补 ¥${((user1Paid - user2Paid) / 2).toFixed(2)}`
                : `${couple?.user1Name || '我'} 需向 ${couple?.user2Name || 'Ta'} 补 ¥${((user2Paid - user1Paid) / 2).toFixed(2)}`
              }
            </Text>
          </View>
        )}
      </View>

      {/* 分类筛选 */}
      <ScrollView className={styles.categoryScroll} scrollX enhanced showScrollbar={false}>
        <View className={styles.categoryList}>
          {categories.map(category => (
            <View
              key={category}
              className={`${styles.categoryItem} ${activeCategory === category ? styles.categoryActive : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <Text className={`${styles.categoryText} ${activeCategory === category ? styles.categoryTextActive : ''}`}>
                {category}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 账单列表 */}
      <View className={styles.billList}>
        {filteredBills.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💰</Text>
            <Text className={styles.emptyText}>还没有账单记录</Text>
            <Text className={styles.emptyDesc}>点击下方按钮添加第一笔账单</Text>
          </View>
        ) : (
          filteredBills.map(bill => (
            <View key={bill.id} className={styles.billCard}>
              <View className={styles.billLeft}>
                <Text className={styles.billIcon}>{bill.category_icon || '💰'}</Text>
                <View className={styles.billInfo}>
                  <Text className={styles.billTitle}>{bill.description || bill.category}</Text>
                  {bill.sweet_word && (
                    <Text className={styles.billSweet}>{bill.sweet_word}</Text>
                  )}
                  <View className={styles.billMeta}>
                    <Text className={styles.billDate}>{formatDate(bill.bill_date || bill.created_at)}</Text>
                    <Text className={styles.billPayer}>{bill.paid_by_name} 付款</Text>
                  </View>
                </View>
              </View>
              <View className={styles.billRight}>
                <Text className={styles.billAmount}>¥{Number(bill.amount).toFixed(2)}</Text>
                <Text
                  className={styles.billDelete}
                  onClick={() => handleDelete(bill.id, bill.description)}
                >
                  删除
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 添加按钮 */}
      <View className={styles.addButtonWrapper}>
        <Button className={styles.addButton} onClick={() => setShowAddModal(true)}>
          <Text className={styles.addButtonText}>+ 记一笔</Text>
        </Button>
      </View>

      {/* 添加弹窗 */}
      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>记一笔账</Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>✕</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              {/* 金额 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>金额 *</Text>
                <View className={styles.amountInput}>
                  <Text className={styles.amountPrefix}>¥</Text>
                  <Input
                    className={styles.amountField}
                    placeholder="0.00"
                    type="digit"
                    value={formData.amount}
                    onInput={(e: any) => setFormData({ ...formData, amount: e.detail.value })}
                  />
                </View>
              </View>

              {/* 分类 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>分类</Text>
                <View className={styles.categoryGrid}>
                  {billCategories.map(cat => (
                    <View
                      key={cat.id}
                      className={`${styles.categoryOption} ${formData.category === cat.id ? styles.categoryOptionActive : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                    >
                      <Text className={styles.categoryOptionIcon}>{cat.icon}</Text>
                      <Text className={styles.categoryOptionText}>{cat.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 描述 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>描述</Text>
                <Input
                  className={styles.input}
                  placeholder="消费描述"
                  value={formData.description}
                  onInput={(e: any) => setFormData({ ...formData, description: e.detail.value })}
                  maxLength={50}
                />
              </View>

              {/* 甜蜜备注 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>甜蜜备注</Text>
                <Input
                  className={styles.input}
                  placeholder="写点什么甜甜的..."
                  value={formData.sweetWord}
                  onInput={(e: any) => setFormData({ ...formData, sweetWord: e.detail.value })}
                  maxLength={50}
                />
              </View>

              {/* 日期 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>日期</Text>
                <Picker mode="date" value={formData.billDate} onChange={(e: any) => setFormData({ ...formData, billDate: e.detail.value })}>
                  <View className={styles.pickerTrigger}>
                    <Text className={styles.pickerText}>{formData.billDate}</Text>
                    <Text className={styles.pickerArrow}>›</Text>
                  </View>
                </Picker>
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.confirmButton} onClick={handleSubmit}>
                <Text className={styles.confirmButtonText}>确认记账</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default BillDetailPage;
