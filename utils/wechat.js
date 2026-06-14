const https = require('https');

let accessToken = null;
let tokenExpireTime = 0;

async function requestWeChatAPI(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(JSON.stringify(data)) : 0
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.errcode && result.errcode !== 0) {
            reject(new Error(`微信API错误: ${result.errmsg} (${result.errcode})`));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error('解析响应失败'));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getAccessToken() {
  const now = Date.now();
  
  if (accessToken && now < tokenExpireTime) {
    return accessToken;
  }

  const { APPID, SECRET } = process.env;
  
  if (!APPID || !SECRET) {
    throw new Error('未配置微信APPID或SECRET环境变量');
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`;
  
  try {
    const result = await requestWeChatAPI(url);
    accessToken = result.access_token;
    tokenExpireTime = now + (result.expires_in - 300) * 1000;
    console.log('✅ 获取access_token成功，有效期:', result.expires_in, '秒');
    return accessToken;
  } catch (error) {
    console.error('❌ 获取access_token失败:', error.message);
    throw error;
  }
}

async function sendSubscribeMessage(touser, templateId, data, page = '') {
  try {
    const token = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`;
    
    const message = {
      touser,
      template_id: templateId,
      page,
      data
    };

    const result = await requestWeChatAPI(url, 'POST', message);
    console.log('✅ 订阅消息发送成功:', result);
    return result;
  } catch (error) {
    console.error('❌ 发送订阅消息失败:', error.message);
    throw error;
  }
}

async function sendUniformMessage(touser, mpTemplateMsg) {
  try {
    const token = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=${token}`;
    
    const message = {
      touser,
      mp_template_msg: mpTemplateMsg
    };

    const result = await requestWeChatAPI(url, 'POST', message);
    console.log('✅ 统一消息发送成功:', result);
    return result;
  } catch (error) {
    console.error('❌ 发送统一消息失败:', error.message);
    throw error;
  }
}

async function createMenu(menu) {
  try {
    const token = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`;
    
    const result = await requestWeChatAPI(url, 'POST', menu);
    console.log('✅ 创建自定义菜单成功:', result);
    return result;
  } catch (error) {
    console.error('❌ 创建自定义菜单失败:', error.message);
    throw error;
  }
}

async function getMenu() {
  try {
    const token = await getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${token}`;
    
    const result = await requestWeChatAPI(url);
    return result;
  } catch (error) {
    console.error('❌ 获取自定义菜单失败:', error.message);
    throw error;
  }
}

module.exports = {
  getAccessToken,
  sendSubscribeMessage,
  sendUniformMessage,
  createMenu,
  getMenu
};