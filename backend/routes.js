/**
 * 恋人空间 - API路由
 * 
 * 所有接口统一返回格式:
 * { success: boolean, data?: any, message?: string }
 */

const express = require('express');
const router = express.Router();
const { sendSubscribeMessage, getAccessToken } = require('./utils/wechat');

// 获取数据库连接
function getDB(req) {
  return req.app.locals.db;
}

// 生成唯一ID
function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ==================== 用户相关API ====================

/**
 * POST /api/user/login
 * 用户登录
 */
router.post('/user/login', async (req, res) => {
  try {
    const db = getDB(req);
    const { nickname, avatar, code, userId } = req.body;
    
    // 如果传了userId，直接查询用户
    if (userId) {
      const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (users.length > 0) {
        return res.json({ success: true, data: users[0] });
      }
    }
    
    // 通过code获取微信openid（需要配置APPID和SECRET环境变量）
    let openid = null;
    if (code && process.env.APPID && process.env.SECRET) {
      try {
        const https = require('https');
        const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.APPID}&secret=${process.env.SECRET}&js_code=${code}&grant_type=authorization_code`;
        
        openid = await new Promise((resolve, reject) => {
          https.get(wxUrl, (resp) => {
            let data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
              try {
                const result = JSON.parse(data);
                resolve(result.openid);
              } catch (e) {
                resolve(null);
              }
            });
          }).on('error', reject);
        });
      } catch (e) {
        console.log('微信登录失败，使用本地模式:', e.message);
      }
    }
    
    // 查询或创建用户
    if (openid) {
      const [users] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
      if (users.length > 0) {
        // 更新用户信息
        await db.query(
          'UPDATE users SET nickname = ?, avatar = ? WHERE openid = ?',
          [nickname, avatar, openid]
        );
        const [updated] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
        return res.json({ success: true, data: updated[0] });
      }
    }
    
    // 创建新用户
    const newUserId = generateId('user');
    await db.query(
      'INSERT INTO users (id, openid, nickname, avatar, created_at) VALUES (?, ?, ?, ?, NOW())',
      [newUserId, openid, nickname, avatar]
    );
    
    const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [newUserId]);
    
    res.json({ success: true, data: newUser[0] });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败', error: error.message });
  }
});

/**
 * GET /api/user/:id
 * 获取用户信息
 */
router.get('/user/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * PUT /api/user/:id
 * 更新用户信息
 */
router.put('/user/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { nickname, avatar } = req.body;
    
    await db.query(
      'UPDATE users SET nickname = ?, avatar = ? WHERE id = ?',
      [nickname, avatar, req.params.id]
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// ==================== 情侣相关API ====================

/**
 * POST /api/couple
 * 创建情侣关系（生成邀请码）
 */
router.post('/couple', async (req, res) => {
  try {
    const db = getDB(req);
    const { user1Id, user1Name, user1Avatar } = req.body;
    const coupleId = generateId('couple');
    const inviteCode = 'LOVE' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    await db.query(
      `INSERT INTO couples (id, user1_id, user1_name, user1_avatar, invite_code, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [coupleId, user1Id, user1Name, user1Avatar, inviteCode]
    );
    
    const couple = {
      id: coupleId,
      user1Id,
      user1Name,
      user1Avatar,
      inviteCode,
      user2Id: null,
      user2Name: null,
      user2Avatar: null,
      startDate: null
    };
    
    res.json({ success: true, data: couple });
  } catch (error) {
    console.error('创建情侣关系失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * POST /api/couple/join
 * 加入情侣（通过邀请码）
 */
router.post('/couple/join', async (req, res) => {
  try {
    const db = getDB(req);
    const { inviteCode, user2Id, user2Name, user2Avatar } = req.body;
    
    // 查找情侣关系
    const [couples] = await db.query(
      'SELECT * FROM couples WHERE invite_code = ? AND user2_id IS NULL',
      [inviteCode]
    );
    
    if (couples.length === 0) {
      return res.status(404).json({ success: false, message: '邀请码无效或已被使用' });
    }
    
    const couple = couples[0];
    const startDate = new Date().toISOString().split('T')[0];
    
    // 更新情侣关系
    await db.query(
      `UPDATE couples SET user2_id = ?, user2_name = ?, user2_avatar = ?, start_date = ? WHERE id = ?`,
      [user2Id, user2Name, user2Avatar, startDate, couple.id]
    );
    
    const [updated] = await db.query('SELECT * FROM couples WHERE id = ?', [couple.id]);

    // 绑定成功后发送订阅消息通知双方
    const bindTemplateId = process.env.BIND_TEMPLATE_ID || '';
    if (bindTemplateId) {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const messageData = {
        thing1: { value: '情侣绑定成功' },
        time2: { value: timeStr },
        thing3: { value: '恭喜你们成功绑定，一起记录甜蜜时光吧' }
      };

      // 查询双方openid并发送通知
      const [users] = await db.query(
        'SELECT id, openid FROM users WHERE id IN (?, ?)',
        [couple.user1_id, user2Id]
      );

      for (const user of users) {
        if (!user.openid) continue;
        try {
          await sendSubscribeMessage(user.openid, bindTemplateId, messageData, '/pages/home/index');
          await db.query(
            'INSERT INTO message_logs (user_id, message_type, status, created_at) VALUES (?, ?, ?, NOW())',
            [user.id, 'bind_notify', 'sent']
          );
        } catch (err) {
          console.error('发送绑定通知失败:', err.message);
        }
      }
    }
    
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('加入情侣关系失败:', error);
    res.status(500).json({ success: false, message: '加入失败' });
  }
});

/**
 * GET /api/couple/:id
 * 获取情侣信息
 */
router.get('/couple/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const [couples] = await db.query('SELECT * FROM couples WHERE id = ?', [req.params.id]);
    
    if (couples.length === 0) {
      return res.status(404).json({ success: false, message: '情侣关系不存在' });
    }
    
    res.json({ success: true, data: couples[0] });
  } catch (error) {
    console.error('获取情侣信息失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * GET /api/couple/user/:userId
 * 通过用户ID获取情侣信息
 */
router.get('/couple/user/:userId', async (req, res) => {
  try {
    const db = getDB(req);
    const [couples] = await db.query(
      'SELECT * FROM couples WHERE user1_id = ? OR user2_id = ?',
      [req.params.userId, req.params.userId]
    );
    
    if (couples.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    res.json({ success: true, data: couples[0] });
  } catch (error) {
    console.error('获取情侣信息失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * POST /api/couple/:id/unbind
 * 解除情侣绑定
 */
router.post('/couple/:id/unbind', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query(
      'UPDATE couples SET user2_id = NULL, user2_name = NULL, user2_avatar = NULL, start_date = NULL WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, message: '解除绑定成功' });
  } catch (error) {
    console.error('解除绑定失败:', error);
    res.status(500).json({ success: false, message: '解除失败' });
  }
});

/**
 * POST /api/couple/:id/regenerate-code
 * 生成新的邀请码
 */
router.post('/couple/:id/regenerate-code', async (req, res) => {
  try {
    const db = getDB(req);
    const inviteCode = 'LOVE' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    await db.query(
      'UPDATE couples SET invite_code = ? WHERE id = ?',
      [inviteCode, req.params.id]
    );
    
    res.json({ success: true, data: { inviteCode } });
  } catch (error) {
    console.error('生成邀请码失败:', error);
    res.status(500).json({ success: false, message: '生成失败' });
  }
});

// ==================== 日记相关API ====================

/**
 * POST /api/diary
 * 创建日记
 */
router.post('/diary', async (req, res) => {
  try {
    const db = getDB(req);
    const { coupleId, authorId, authorName, authorAvatar, content, images, mood, location, weather } = req.body;
    const diaryId = generateId('diary');
    
    await db.query(
      `INSERT INTO diaries (id, couple_id, author_id, author_name, author_avatar, content, images, mood, location, weather, likes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [diaryId, coupleId, authorId, authorName, authorAvatar, content, JSON.stringify(images || []), mood || null, location || null, weather || null]
    );
    
    const diary = {
      id: diaryId,
      coupleId, authorId, authorName, authorAvatar, content,
      images: images || [],
      mood, location, weather,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: diary });
  } catch (error) {
    console.error('创建日记失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * GET /api/diary/couple/:coupleId
 * 获取情侣日记列表
 */
router.get('/diary/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [diaries] = await db.query(
      'SELECT * FROM diaries WHERE couple_id = ? ORDER BY created_at DESC',
      [req.params.coupleId]
    );
    
    // 转换images字段并添加评论数
    const parsedDiaries = await Promise.all(diaries.map(async d => {
      const [comments] = await db.query(
        'SELECT * FROM diary_comments WHERE diary_id = ? ORDER BY created_at ASC',
        [d.id]
      );
      return {
        ...d,
        images: JSON.parse(d.images || '[]'),
        comments: comments || []
      };
    }));
    
    res.json({ success: true, data: parsedDiaries });
  } catch (error) {
    console.error('获取日记列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * GET /api/diary/:id
 * 获取日记详情
 */
router.get('/diary/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const [diaries] = await db.query('SELECT * FROM diaries WHERE id = ?', [req.params.id]);
    
    if (diaries.length === 0) {
      return res.status(404).json({ success: false, message: '日记不存在' });
    }
    
    const diary = {
      ...diaries[0],
      images: JSON.parse(diaries[0].images || '[]')
    };
    
    // 获取评论
    const [comments] = await db.query(
      'SELECT * FROM diary_comments WHERE diary_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    diary.comments = comments || [];
    
    res.json({ success: true, data: diary });
  } catch (error) {
    console.error('获取日记详情失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * POST /api/diary/:id/like
 * 点赞日记
 */
router.post('/diary/:id/like', async (req, res) => {
  try {
    const db = getDB(req);
    const { userId } = req.body;
    
    // 检查是否已点赞
    const [existing] = await db.query(
      'SELECT * FROM diary_likes WHERE diary_id = ? AND user_id = ?',
      [req.params.id, userId]
    );
    
    if (existing.length > 0) {
      // 取消点赞
      await db.query('DELETE FROM diary_likes WHERE diary_id = ? AND user_id = ?', [req.params.id, userId]);
      await db.query('UPDATE diaries SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [req.params.id]);
      return res.json({ success: true, message: '取消点赞', liked: false });
    }
    
    // 点赞
    await db.query(
      'INSERT INTO diary_likes (diary_id, user_id, created_at) VALUES (?, ?, NOW())',
      [req.params.id, userId]
    );
    await db.query('UPDATE diaries SET likes = likes + 1 WHERE id = ?', [req.params.id]);
    
    res.json({ success: true, message: '点赞成功', liked: true });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, message: '点赞失败' });
  }
});

/**
 * POST /api/diary/:id/comment
 * 添加评论
 */
router.post('/diary/:id/comment', async (req, res) => {
  try {
    const db = getDB(req);
    const { authorId, authorName, authorAvatar, content } = req.body;
    const commentId = generateId('comment');
    
    await db.query(
      `INSERT INTO diary_comments (id, diary_id, author_id, author_name, author_avatar, content, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [commentId, req.params.id, authorId, authorName, authorAvatar, content]
    );
    
    const comment = {
      id: commentId,
      diaryId: req.params.id,
      authorId, authorName, authorAvatar, content,
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ success: false, message: '添加失败' });
  }
});

/**
 * DELETE /api/diary/:id
 * 删除日记
 */
router.delete('/diary/:id', async (req, res) => {
  try {
    const db = getDB(req);
    
    // 先删除评论和点赞
    await db.query('DELETE FROM diary_comments WHERE diary_id = ?', [req.params.id]);
    await db.query('DELETE FROM diary_likes WHERE diary_id = ?', [req.params.id]);
    await db.query('DELETE FROM diaries WHERE id = ?', [req.params.id]);
    
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除日记失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ==================== 纪念日相关API ====================

/**
 * POST /api/anniversary
 * 创建纪念日
 */
router.post('/anniversary', async (req, res) => {
  try {
    const db = getDB(req);
    const { coupleId, title, description, date, type, icon, remindDays, isRemind, remindTime } = req.body;
    const anniId = generateId('anni');
    
    await db.query(
      `INSERT INTO anniversaries (id, couple_id, title, description, date, type, icon, remind_days, is_remind, remind_time, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [anniId, coupleId, title, description || null, date, type || 'custom', icon || '🎂', remindDays || 0, isRemind ? 1 : 0, remindTime || '09:00']
    );
    
    const anniversary = {
      id: anniId,
      coupleId, title, description, date, type: type || 'custom',
      icon: icon || '🎂', remindDays: remindDays || 0,
      isRemind: isRemind || false, remindTime: remindTime || '09:00',
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: anniversary });
  } catch (error) {
    console.error('创建纪念日失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * GET /api/anniversary/couple/:coupleId
 * 获取纪念日列表
 */
router.get('/anniversary/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [anniversaries] = await db.query(
      'SELECT * FROM anniversaries WHERE couple_id = ? ORDER BY date ASC',
      [req.params.coupleId]
    );
    
    res.json({ success: true, data: anniversaries });
  } catch (error) {
    console.error('获取纪念日列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * PUT /api/anniversary/:id
 * 更新纪念日
 */
router.put('/anniversary/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { title, description, date, type, icon, remindDays, isRemind, remindTime } = req.body;
    
    await db.query(
      `UPDATE anniversaries SET title = ?, description = ?, date = ?, type = ?, icon = ?, remind_days = ?, is_remind = ?, remind_time = ? WHERE id = ?`,
      [title, description, date, type, icon, remindDays, isRemind ? 1 : 0, remindTime, req.params.id]
    );
    
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新纪念日失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

/**
 * DELETE /api/anniversary/:id
 * 删除纪念日
 */
router.delete('/anniversary/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM anniversaries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除纪念日失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ==================== 愿望清单相关API ====================

/**
 * POST /api/wish
 * 创建愿望
 */
router.post('/wish', async (req, res) => {
  try {
    const db = getDB(req);
    const { coupleId, title, description, icon, targetDate } = req.body;
    const wishId = generateId('wish');
    
    await db.query(
      `INSERT INTO wishes (id, couple_id, title, description, icon, target_date, is_completed, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
      [wishId, coupleId, title, description || null, icon || '✨', targetDate || null]
    );
    
    const wish = {
      id: wishId,
      coupleId, title, description, icon: icon || '✨',
      targetDate, isCompleted: false,
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: wish });
  } catch (error) {
    console.error('创建愿望失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * GET /api/wish/couple/:coupleId
 * 获取愿望列表
 */
router.get('/wish/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [wishes] = await db.query(
      'SELECT * FROM wishes WHERE couple_id = ? ORDER BY created_at DESC',
      [req.params.coupleId]
    );
    
    res.json({ success: true, data: wishes });
  } catch (error) {
    console.error('获取愿望列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * POST /api/wish/:id/complete
 * 完成愿望
 */
router.post('/wish/:id/complete', async (req, res) => {
  try {
    const db = getDB(req);
    const { userId } = req.body;
    
    await db.query(
      'UPDATE wishes SET is_completed = 1, completed_by = ?, completed_at = NOW() WHERE id = ?',
      [userId, req.params.id]
    );
    
    res.json({ success: true, message: '愿望完成' });
  } catch (error) {
    console.error('完成愿望失败:', error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

/**
 * DELETE /api/wish/:id
 * 删除愿望
 */
router.delete('/wish/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM wishes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除愿望失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ==================== 任务积分相关API ====================

/**
 * GET /api/task/couple/:coupleId
 * 获取任务列表
 */
router.get('/task/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE couple_id = ? OR couple_id = 0 ORDER BY created_at DESC',
      [req.params.coupleId]
    );
    
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * POST /api/task/:id/complete
 * 完成任务
 */
router.post('/task/:id/complete', async (req, res) => {
  try {
    const db = getDB(req);
    const { userId } = req.body;
    
    // 获取任务积分
    const [tasks] = await db.query('SELECT points, couple_id FROM tasks WHERE id = ?', [req.params.id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }
    
    const { points, couple_id } = tasks[0];
    
    // 更新任务状态
    await db.query(
      'UPDATE tasks SET is_completed = 1, completed_by = ?, completed_at = NOW() WHERE id = ?',
      [userId, req.params.id]
    );
    
    // 增加情侣积分
    if (couple_id) {
      await db.query(
        'UPDATE couples SET points = COALESCE(points, 0) + ? WHERE id = ?',
        [points, couple_id]
      );
    }
    
    res.json({ success: true, message: '任务完成', points });
  } catch (error) {
    console.error('完成任务失败:', error);
    res.status(500).json({ success: false, message: '操作失败' });
  }
});

/**
 * GET /api/task/points/:coupleId
 * 获取积分
 */
router.get('/task/points/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [couples] = await db.query(
      'SELECT points FROM couples WHERE id = ?',
      [req.params.coupleId]
    );
    
    if (couples.length === 0) {
      return res.json({ success: true, data: { points: 0 } });
    }
    
    res.json({ success: true, data: { points: couples[0].points || 0 } });
  } catch (error) {
    console.error('获取积分失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// ==================== 消息推送相关API ====================

/**
 * POST /api/message/subscribe
 * 发送订阅消息
 */
router.post('/message/subscribe', async (req, res) => {
  try {
    const { touser, templateId, data, page } = req.body;
    
    if (!touser || !templateId || !data) {
      return res.status(400).json({ success: false, message: '缺少必填参数' });
    }
    
    const result = await sendSubscribeMessage(touser, templateId, data, page);
    res.json({ success: true, data: result, message: '消息发送成功' });
  } catch (error) {
    console.error('发送订阅消息失败:', error);
    res.status(500).json({ success: false, message: '发送失败', error: error.message });
  }
});

/**
 * POST /api/message/anniversary-remind
 * 发送纪念日提醒消息
 */
router.post('/message/anniversary-remind', async (req, res) => {
  try {
    const db = getDB(req);
    const { anniversaryId, userId } = req.body;
    
    if (!anniversaryId) {
      return res.status(400).json({ success: false, message: '缺少纪念日ID' });
    }
    
    const [anniversaries] = await db.query(
      'SELECT * FROM anniversaries WHERE id = ?',
      [anniversaryId]
    );
    
    if (anniversaries.length === 0) {
      return res.status(404).json({ success: false, message: '纪念日不存在' });
    }
    
    const anniversary = anniversaries[0];
    
    let targetUserId = userId;
    let openid = null;
    
    if (userId) {
      const [users] = await db.query('SELECT openid FROM users WHERE id = ?', [userId]);
      if (users.length > 0) {
        openid = users[0].openid;
      }
    } else {
      const [couples] = await db.query(
        'SELECT user1_id, user2_id FROM couples WHERE id = ?',
        [anniversary.couple_id]
      );
      if (couples.length > 0) {
        const couple = couples[0];
        const [users] = await db.query(
          'SELECT openid FROM users WHERE id IN (?, ?)',
          [couple.user1_id, couple.user2_id]
        );
        if (users.length > 0) {
          openid = users[0].openid;
        }
      }
    }
    
    if (!openid) {
      return res.status(400).json({ success: false, message: '未找到用户的openid' });
    }
    
    const templateId = process.env.ANNIVERSARY_TEMPLATE_ID || '';
    if (!templateId) {
      return res.status(500).json({ success: false, message: '未配置纪念日模板ID' });
    }
    
    const daysLeft = calculateDaysLeft(anniversary.date);
    const title = anniversary.title;
    
    // 模板472字段: thing3(温馨提醒) time4(上月日期) number2(倒计时天数) date1(预计日期)
    const data = {
      thing3: { value: title },
      time4: { value: anniversary.date },
      number2: { value: daysLeft },
      date1: { value: getNextOccurrence(anniversary.date) }
    };
    
    const result = await sendSubscribeMessage(openid, templateId, data, '/pages/anniversary/index');
    
    await db.query(
      'INSERT INTO message_logs (user_id, anniversary_id, message_type, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [targetUserId, anniversaryId, 'anniversary_remind', 'sent']
    );
    
    res.json({ success: true, data: result, message: '提醒消息发送成功' });
  } catch (error) {
    console.error('发送纪念日提醒失败:', error);
    res.status(500).json({ success: false, message: '发送失败', error: error.message });
  }
});

/**
 * POST /api/message/batch-remind
 * 批量发送纪念日提醒（用于定时任务）
 */
router.post('/message/batch-remind', async (req, res) => {
  try {
    const db = getDB(req);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const [anniversaries] = await db.query(`
      SELECT a.*, c.user1_id, c.user2_id 
      FROM anniversaries a 
      JOIN couples c ON a.couple_id = c.id 
      WHERE a.is_remind = 1
    `);
    
    const sendResults = [];
    const failedResults = [];
    
    for (const anniversary of anniversaries) {
      const daysUntil = calculateDaysLeft(anniversary.date);
      const remindDays = anniversary.remind_days || 0;
      
      if (daysUntil !== remindDays) {
        continue;
      }
      
      const [users] = await db.query(
        'SELECT id, openid FROM users WHERE id IN (?, ?)',
        [anniversary.user1_id, anniversary.user2_id]
      );
      
      const templateId = process.env.ANNIVERSARY_TEMPLATE_ID;
      if (!templateId) {
        continue;
      }
      
      // 模板472字段: thing3(温馨提醒) time4(上月日期) number2(倒计时天数) date1(预计日期)
      const data = {
        thing3: { value: anniversary.title },
        time4: { value: anniversary.date },
        number2: { value: daysUntil },
        date1: { value: getNextOccurrence(anniversary.date) }
      };
      
      for (const user of users) {
        if (!user.openid) continue;
        
        try {
          const result = await sendSubscribeMessage(
            user.openid, 
            templateId, 
            data, 
            '/pages/anniversary/index'
          );
          
          await db.query(
            'INSERT INTO message_logs (user_id, anniversary_id, message_type, status, created_at) VALUES (?, ?, ?, ?, NOW())',
            [user.id, anniversary.id, 'anniversary_remind', 'sent']
          );
          
          sendResults.push({ userId: user.id, anniversaryId: anniversary.id, success: true });
        } catch (error) {
          failedResults.push({ userId: user.id, anniversaryId: anniversary.id, error: error.message });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        sent: sendResults.length,
        failed: failedResults.length,
        details: { sent: sendResults, failed: failedResults }
      },
      message: `批量提醒完成，成功${sendResults.length}条，失败${failedResults.length}条`
    });
  } catch (error) {
    console.error('批量发送提醒失败:', error);
    res.status(500).json({ success: false, message: '批量发送失败', error: error.message });
  }
});

/**
 * GET /api/message/token
 * 获取access_token（用于测试）
 */
router.get('/message/token', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ success: true, data: { accessToken: token } });
  } catch (error) {
    console.error('获取access_token失败:', error);
    res.status(500).json({ success: false, message: '获取失败', error: error.message });
  }
});

/**
 * GET /api/message/logs
 * 获取消息发送日志
 */
router.get('/message/logs', async (req, res) => {
  try {
    const db = getDB(req);
    const [logs] = await db.query('SELECT * FROM message_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('获取消息日志失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

function calculateDaysLeft(dateStr) {
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
}

function getNextOccurrence(dateStr) {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  if (target < today) {
    target.setFullYear(today.getFullYear());
    if (target < today) {
      target.setFullYear(today.getFullYear() + 1);
    }
  }
  
  return target.toISOString().split('T')[0];
}

// ==================== 账单相关API ====================

/**
 * POST /api/bill
 * 创建账单
 */
router.post('/bill', async (req, res) => {
  try {
    const db = getDB(req);
    const { coupleId, amount, category, categoryIcon, description, sweetWord, paidBy, paidByName, paidByAvatar, billDate, billType } = req.body;
    const billId = generateId('bill');
    
    await db.query(
      `INSERT INTO bills (id, couple_id, amount, category, category_icon, description, sweet_word, paid_by, paid_by_name, paid_by_avatar, bill_date, bill_type, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [billId, coupleId, amount, category || null, categoryIcon || '💰', description || null, sweetWord || null, paidBy || null, paidByName || null, paidByAvatar || null, billDate || new Date().toISOString().split('T')[0], billType || 'common']
    );
    
    const bill = {
      id: billId, coupleId, amount, category, categoryIcon: categoryIcon || '💰',
      description, sweetWord, paidBy, paidByName, paidByAvatar,
      billDate: billDate || new Date().toISOString().split('T')[0],
      billType: billType || 'common',
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('创建账单失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * GET /api/bill/couple/:coupleId
 * 获取账单列表
 */
router.get('/bill/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [bills] = await db.query(
      'SELECT * FROM bills WHERE couple_id = ? ORDER BY created_at DESC',
      [req.params.coupleId]
    );
    
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('获取账单列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * DELETE /api/bill/:id
 * 删除账单
 */
router.delete('/bill/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM bills WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除账单失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ==================== 时光胶囊/情书相关API ====================

/**
 * POST /api/letter
 * 创建情书
 */
router.post('/letter', async (req, res) => {
  try {
    const db = getDB(req);
    const { coupleId, title, content, images, voiceUrl, fromId, fromName, fromAvatar, toId, openAt } = req.body;
    const letterId = generateId('letter');
    
    await db.query(
      `INSERT INTO letters (id, couple_id, title, content, images, voice_url, from_id, from_name, from_avatar, to_id, open_at, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [letterId, coupleId, title, content || null, JSON.stringify(images || []), voiceUrl || null, fromId, fromName, fromAvatar, toId || null, openAt || null]
    );
    
    const letter = {
      id: letterId, coupleId, title, content, images: images || [],
      voiceUrl, fromId, fromName, fromAvatar, toId,
      sendAt: new Date().toISOString(), openAt,
      isOpened: false, createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: letter });
  } catch (error) {
    console.error('创建情书失败:', error);
    res.status(500).json({ success: false, message: '创建失败' });
  }
});

/**
 * GET /api/letter/couple/:coupleId
 * 获取情书列表
 */
router.get('/letter/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [letters] = await db.query(
      'SELECT * FROM letters WHERE couple_id = ? ORDER BY created_at DESC',
      [req.params.coupleId]
    );
    
    const parsedLetters = letters.map(l => ({
      ...l,
      images: JSON.parse(l.images || '[]')
    }));
    
    res.json({ success: true, data: parsedLetters });
  } catch (error) {
    console.error('获取情书列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * POST /api/letter/:id/open
 * 打开情书
 */
router.post('/letter/:id/open', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query(
      'UPDATE letters SET is_opened = 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: '打开成功' });
  } catch (error) {
    console.error('打开情书失败:', error);
    res.status(500).json({ success: false, message: '打开失败' });
  }
});

/**
 * DELETE /api/letter/:id
 * 删除情书
 */
router.delete('/letter/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM letters WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除情书失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ==================== 相册相关API ====================

/**
 * POST /api/album
 * 上传照片
 */
router.post('/album', async (req, res) => {
  try {
    const db = getDB(req);
    const { coupleId, url, thumbnail, description, location, takenAt, uploadedBy, uploadedByName } = req.body;
    const photoId = generateId('photo');
    
    await db.query(
      `INSERT INTO albums (id, couple_id, url, thumbnail, description, location, taken_at, uploaded_by, uploaded_by_name, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [photoId, coupleId, url, thumbnail || null, description || null, location || null, takenAt || null, uploadedBy || null, uploadedByName || null]
    );
    
    const photo = {
      id: photoId, coupleId, url, thumbnail, description, location,
      takenAt, uploadedBy, uploadedByName,
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, data: photo });
  } catch (error) {
    console.error('上传照片失败:', error);
    res.status(500).json({ success: false, message: '上传失败' });
  }
});

/**
 * GET /api/album/couple/:coupleId
 * 获取相册列表
 */
router.get('/album/couple/:coupleId', async (req, res) => {
  try {
    const db = getDB(req);
    const [photos] = await db.query(
      'SELECT * FROM albums WHERE couple_id = ? ORDER BY created_at DESC',
      [req.params.coupleId]
    );
    
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('获取相册列表失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

/**
 * DELETE /api/album/:id
 * 删除照片
 */
router.delete('/album/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM albums WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除照片失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// ==================== 管理后台 API ====================

// 获取所有用户
router.get('/admin/users', async (req, res) => {
  try {
    const db = getDB(req);
    const [users] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 获取所有情侣
router.get('/admin/couples', async (req, res) => {
  try {
    const db = getDB(req);
    const [couples] = await db.query('SELECT * FROM couples ORDER BY created_at DESC');
    res.json({ success: true, data: couples });
  } catch (error) {
    console.error('获取情侣失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 获取所有日记
router.get('/admin/diaries', async (req, res) => {
  try {
    const db = getDB(req);
    const [diaries] = await db.query('SELECT * FROM diaries ORDER BY created_at DESC');
    res.json({ success: true, data: diaries });
  } catch (error) {
    console.error('获取日记失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 删除日记
router.delete('/admin/diaries/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM diary_comments WHERE diary_id = ?', [req.params.id]);
    await db.query('DELETE FROM diary_likes WHERE diary_id = ?', [req.params.id]);
    await db.query('DELETE FROM diaries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除日记失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 获取所有愿望
router.get('/admin/wishes', async (req, res) => {
  try {
    const db = getDB(req);
    const [wishes] = await db.query('SELECT * FROM wishes ORDER BY created_at DESC');
    res.json({ success: true, data: wishes });
  } catch (error) {
    console.error('获取愿望失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 获取所有纪念日
router.get('/admin/anniversaries', async (req, res) => {
  try {
    const db = getDB(req);
    const [anniversaries] = await db.query('SELECT * FROM anniversaries ORDER BY created_at DESC');
    res.json({ success: true, data: anniversaries });
  } catch (error) {
    console.error('获取纪念日失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// ==================== Admin CRUD API ====================

// 更新用户
router.put('/admin/users/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { nickname, avatar } = req.body;
    await db.query('UPDATE users SET nickname = ?, avatar = ? WHERE id = ?', [nickname, avatar, req.params.id]);
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 删除用户
router.delete('/admin/users/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 更新情侣
router.put('/admin/couples/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { user1_name, user2_name, start_date, points } = req.body;
    await db.query(
      'UPDATE couples SET user1_name = ?, user2_name = ?, start_date = ?, points = ? WHERE id = ?',
      [user1_name, user2_name, start_date, points, req.params.id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新情侣失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 删除情侣
router.delete('/admin/couples/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM couples WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除情侣失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 更新日记
router.put('/admin/diaries/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { content, mood, location, weather } = req.body;
    await db.query(
      'UPDATE diaries SET content = ?, mood = ?, location = ?, weather = ? WHERE id = ?',
      [content, mood, location, weather, req.params.id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新日记失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 更新愿望
router.put('/admin/wishes/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { title, description, icon, is_completed } = req.body;
    await db.query(
      'UPDATE wishes SET title = ?, description = ?, icon = ?, is_completed = ? WHERE id = ?',
      [title, description, icon, is_completed ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新愿望失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 删除愿望
router.delete('/admin/wishes/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM wishes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除愿望失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 更新纪念日
router.put('/admin/anniversaries/:id', async (req, res) => {
  try {
    const db = getDB(req);
    const { title, description, date, type, icon, is_remind, remind_days, remind_time } = req.body;
    await db.query(
      'UPDATE anniversaries SET title = ?, description = ?, date = ?, type = ?, icon = ?, is_remind = ?, remind_days = ?, remind_time = ? WHERE id = ?',
      [title, description, date, type, icon, is_remind ? 1 : 0, remind_days || 0, remind_time || '09:00', req.params.id]
    );
    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新纪念日失败:', error);
    res.status(500).json({ success: false, message: '更新失败' });
  }
});

// 删除纪念日
router.delete('/admin/anniversaries/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM anniversaries WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除纪念日失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 获取所有账单
router.get('/admin/bills', async (req, res) => {
  try {
    const db = getDB(req);
    const [bills] = await db.query('SELECT * FROM bills ORDER BY created_at DESC');
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('获取账单失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 获取所有情书
router.get('/admin/letters', async (req, res) => {
  try {
    const db = getDB(req);
    const [letters] = await db.query('SELECT * FROM letters ORDER BY created_at DESC');
    res.json({ success: true, data: letters.map(l => ({ ...l, images: JSON.parse(l.images || '[]') })) });
  } catch (error) {
    console.error('获取情书失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 删除情书
router.delete('/admin/letters/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM letters WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除情书失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 获取所有照片
router.get('/admin/albums', async (req, res) => {
  try {
    const db = getDB(req);
    const [photos] = await db.query('SELECT * FROM albums ORDER BY created_at DESC');
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('获取照片失败:', error);
    res.status(500).json({ success: false, message: '获取失败' });
  }
});

// 删除照片
router.delete('/admin/albums/:id', async (req, res) => {
  try {
    const db = getDB(req);
    await db.query('DELETE FROM albums WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除照片失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

module.exports = router;