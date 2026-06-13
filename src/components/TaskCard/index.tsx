import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TaskCardProps {
  title: string;
  description: string;
  points: number;
  icon: string;
  isCompleted: boolean;
  onComplete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  points,
  icon,
  isCompleted,
  onComplete
}) => {
  return (
    <View className={classnames(styles.container, isCompleted && styles.completed)}>
      <View className={styles.iconWrapper}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <View className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.description}>{description}</Text>
      </View>
      <View className={styles.action}>
        <View className={styles.points}>
          <Text className={styles.pointsValue}>+{points}</Text>
        </View>
        {isCompleted ? (
          <View className={styles.completedTag}>
            <Text className={styles.completedText}>已完成</Text>
          </View>
        ) : (
          <Button 
            className={styles.completeBtn}
            onClick={onComplete}
          >
            完成
          </Button>
        )}
      </View>
    </View>
  );
};

export default TaskCard;