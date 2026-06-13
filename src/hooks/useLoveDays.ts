import { useState, useEffect, useCallback } from 'react';

interface LoveTimer {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * 恋爱计时器 Hook
 * @param startDate 恋爱开始日期
 * @returns 计时器对象
 */
export const useLoveTimer = (startDate: string): LoveTimer => {
  const calculateElapsedTime = useCallback((): LoveTimer => {
    const start = new Date(startDate).getTime();
    const now = new Date().getTime();
    const difference = now - start;

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds
    };
  }, [startDate]);

  const [timer, setTimer] = useState<LoveTimer>(calculateElapsedTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(calculateElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateElapsedTime]);

  return timer;
};

/**
 * 计算恋爱天数
 * @param startDate 恋爱开始日期
 * @returns 恋爱天数
 */
export const useLoveDays = (startDate: string): number => {
  const calculateDays = useCallback((): number => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate]);

  const [days, setDays] = useState<number>(calculateDays());

  useEffect(() => {
    const timer = setInterval(() => {
      setDays(calculateDays());
    }, 1000 * 60 * 60); // 每小时更新一次

    return () => clearInterval(timer);
  }, [calculateDays]);

  return days;
};

export default useLoveTimer;