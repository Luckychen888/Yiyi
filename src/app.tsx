import { useEffect } from 'react';
import { useDidShow } from '@tarojs/taro';
import './app.scss';
import { useCoupleStore } from './store/useCoupleStore';

function App(props) {
  const { initFromStorage } = useCoupleStore();

  useEffect(() => {
    initCloud();
    initFromStorage();
  }, []);

  useDidShow(() => {
    initFromStorage();
  });

  const initCloud = () => {
    try {
      if (typeof wx !== 'undefined' && wx.cloud) {
        wx.cloud.init({
          env: 'prod-d1gssem8n4896288b'
        });
      }
    } catch (e) {
      // 云开发初始化失败，静默处理
    }
  };

  return props.children;
}

export default App;