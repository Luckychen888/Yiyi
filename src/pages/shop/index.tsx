import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { taskService } from '../../services/api';
import { productsData } from '../../data/shop';

const ShopPage: React.FC = () => {
  const { couple } = useCoupleStore();
  const [activeTab, setActiveTab] = useState<'shop' | 'task'>('shop');
  const [tasks, setTasks] = useState<any[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const isLogin = Taro.getStorageSync('isLogin');
    if (!isLogin) {
      Taro.redirectTo({ url: '/pages/login/index' });
      return;
    }
    if (couple) {
      loadTasks();
      loadPoints();
    }
  }, [couple?.id]);

  const loadTasks = async () => {
    try {
      const response: any = await taskService.getTasks(couple!.id);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('加载任务失败:', error);
    }
  };

  const loadPoints = async () => {
    try {
      const response: any = await taskService.getPoints(couple!.id);
      if (response.success && response.data) {
        setPoints(response.data.points || 0);
      }
    } catch (error) {
      console.error('加载积分失败:', error);
    }
  };

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;

  const handleExchange = (productId: string) => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    if (points < product.price) {
      Taro.showToast({ title: '积分不足', icon: 'none' });
      return;
    }
    
    Taro.showToast({ title: '兑换成功！', icon: 'success' });
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response: any = await taskService.completeTask(taskId, couple!.id);
      if (response.success) {
        Taro.showToast({ title: `获得 ${response.points || 0} 积分！`, icon: 'success' });
        loadTasks();
        loadPoints();
      }
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  return (
    <ScrollView 
      className={styles.page}
      scrollY
      enhanced
      showScrollbar={false}
    >
      {/* 积分卡片 */}
      <View className={styles.pointsCard}>
        <View className={styles.pointsHeader}>
          <Text className={styles.pointsTitle}>我的积分</Text>
          <View className={styles.pointsValueWrapper}>
            <Text className={styles.pointsValue}>{points}</Text>
            <Text className={styles.pointsUnit}>积分</Text>
          </View>
        </View>
        <Text className={styles.pointsDesc}>
          完成任务赚取积分，兑换情侣专属福利
        </Text>
      </View>

      {/* Tab 切换 */}
      <View className={styles.tabBar}>
        <View 
          className={classnames(styles.tabItem, activeTab === 'shop' && styles.tabItemActive)}
          onClick={() => setActiveTab('shop')}
        >
          <Text 
            className={classnames(styles.tabText, activeTab === 'shop' && styles.tabTextActive)}
          >
            积分商城
          </Text>
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'task' && styles.tabItemActive)}
          onClick={() => setActiveTab('task')}
        >
          <Text 
            className={classnames(styles.tabText, activeTab === 'task' && styles.tabTextActive)}
          >
            任务中心
          </Text>
        </View>
      </View>

      {/* 商城内容 */}
      {activeTab === 'shop' && (
        <View className={styles.productList}>
          {productsData.map(product => (
            <View key={product.id} className={styles.productCard}>
              <View className={styles.productIconWrapper}>
                <Text className={styles.productIcon}>{product.icon}</Text>
              </View>
              <View className={styles.productContent}>
                <Text className={styles.productTitle}>{product.title}</Text>
                <Text className={styles.productDescription}>{product.description}</Text>
                <View className={styles.productStats}>
                  <Text className={styles.productStatsText}>{product.exchangedCount}人已兑换</Text>
                </View>
              </View>
              <View className={styles.productAction}>
                <View className={styles.productPrice}>
                  <Text className={styles.productPriceValue}>{product.price}</Text>
                  <Text className={styles.productPriceLabel}>积分</Text>
                </View>
                <Button 
                  className={styles.exchangeBtn}
                  onClick={() => handleExchange(product.id)}
                >
                  兑换
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 任务内容 */}
      {activeTab === 'task' && (
        <View className={styles.taskList}>
          <View className={styles.taskHeader}>
            <Text className={styles.taskTitle}>今日任务</Text>
            <Text className={styles.taskStats}>
              已完成 {completedTasks}/{totalTasks}
            </Text>
          </View>
          {tasks.map(task => (
            <View 
              key={task.id}
              className={classnames(
                styles.taskCard,
                task.is_completed && styles.taskCardCompleted
              )}
            >
              <View className={styles.taskIconWrapper}>
                <Text className={styles.taskIcon}>{task.icon || '📋'}</Text>
              </View>
              <View className={styles.taskContent}>
                <Text className={styles.taskTitleText}>{task.title}</Text>
                <Text className={styles.taskDescription}>{task.description}</Text>
              </View>
              <View className={styles.taskAction}>
                <View className={styles.taskPoints}>
                  <Text className={styles.taskPointsValue}>+{task.points}</Text>
                </View>
                {task.is_completed ? (
                  <View className={styles.completedTag}>
                    <Text className={styles.completedText}>已完成</Text>
                  </View>
                ) : (
                  <Button 
                    className={styles.completeBtn}
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    完成
                  </Button>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default ShopPage;