const https = require('https');

class CronService {
  constructor() {
    this.intervalId = null;
    this.running = false;
  }

  start() {
    if (this.running) {
      console.log('⏰ 定时任务服务已运行');
      return;
    }

    console.log('⏰ 启动定时任务服务...');
    this.running = true;
    
    this.executeImmediately();
    
    this.intervalId = setInterval(() => {
      this.execute();
    }, 60 * 60 * 1000);

    console.log('✅ 定时任务服务已启动，每小时执行一次');
  }

  stop() {
    if (!this.running) {
      console.log('⏰ 定时任务服务未运行');
      return;
    }

    console.log('⏰ 停止定时任务服务...');
    clearInterval(this.intervalId);
    this.running = false;
    console.log('✅ 定时任务服务已停止');
  }

  executeImmediately() {
    this.execute();
  }

  async execute() {
    try {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      console.log(`⏰ 定时任务执行中 - ${now.toLocaleString()}`);

      const shouldSendReminder = await this.shouldSendReminder();
      if (shouldSendReminder) {
        await this.sendDailyReminder();
      }
    } catch (error) {
      console.error('❌ 定时任务执行失败:', error.message);
    }
  }

  async shouldSendReminder() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    const targetHour = parseInt(process.env.REMIND_HOUR || '9');
    const targetMinute = parseInt(process.env.REMIND_MINUTE || '0');
    
    return hour === targetHour && minute >= targetMinute && minute < targetMinute + 5;
  }

  async sendDailyReminder() {
    console.log('📤 开始发送每日纪念日提醒...');
    
    try {
      const response = await this.callBatchRemindAPI();
      console.log('📤 每日提醒发送完成:', response);
    } catch (error) {
      console.error('❌ 发送每日提醒失败:', error.message);
    }
  }

  async callBatchRemindAPI() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: process.env.PORT || 80,
        path: '/api/message/batch-remind',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            resolve({ success: false, message: '解析响应失败' });
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(JSON.stringify({}));
      req.end();
    });
  }
}

const cronService = new CronService();

module.exports = cronService;