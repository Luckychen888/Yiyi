import React from 'react';
import { View, Text, Picker } from '@tarojs/components';
import styles from './index.module.scss';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'region';
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = '请选择日期',
  mode = 'date',
  disabled = false
}) => {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const displayValue = mode === 'date' && value ? formatDate(value) : value;

  return (
    <View className={styles.container}>
      {label && (
        <Text className={styles.label}>{label}</Text>
      )}
      <Picker
        mode={mode}
        value={value}
        onChange={(e: any) => onChange(e.detail.value)}
        disabled={disabled}
      >
        <View className={`${styles.picker} ${disabled ? styles.disabled : ''}`}>
          <Text className={styles.value}>
            {displayValue || placeholder}
          </Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      </Picker>
    </View>
  );
};

export default DatePicker;