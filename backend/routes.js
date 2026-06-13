/**
 * 恋人空间 - API路由
 * 
 * 所有接口统一返回格式:
 * { success: boolean, data?: any, message?: string }
 */

const express = require('express');
const router = express.Router();

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
    res.status(500).json({ success: false, message: '登录失败' });
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

module.exports = router;