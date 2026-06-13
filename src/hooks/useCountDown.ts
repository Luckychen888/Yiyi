import { useState, useEffect, useCallback } from 'react';

interface CountDown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * 倒计时 Hook
 * @param targetDate 目标日期字符串
 * @returns 倒计时对象
 */
export const useCountDown = (targetDate: string): CountDown => {
  const calculateTimeLeft = useCallback((): CountDown => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      isExpired: false
    };
  }, [targetDate]);

  const [countDown, setCountDown] = useState<CountDown>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountDown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return countDown;
};

export default useCountDown;