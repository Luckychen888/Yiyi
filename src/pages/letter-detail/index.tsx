import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Input, Button, Textarea } from '@tarojs/components';
import Taro, { useDidHide } from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { letterService } from '../../services/api';

// 音乐列表
const MUSIC_LIST = [
  { name: '致爱丽丝', url: 'https://music.163.com/song/media/outer/url?id=1901371647.mp3', artist: '贝多芬' },
  { name: '天空之城', url: 'https://music.163.com/song/media/outer/url?id=1901371654.mp3', artist: '久石让' },
  { name: 'Canon in D', url: 'https://music.163.com/song/media/outer/url?id=1901371662.mp3', artist: 'Pachelbel' },
  { name: 'River Flows in You', url: 'https://music.163.com/song/media/outer/url?id=1901371670.mp3', artist: 'Yiruma' },
  { name: '梦中的婚礼', url: 'https://music.163.com/song/media/outer/url?id=1901371686.mp3', artist: '理查德' },
];

// 情书模板
const TEMPLATES = [
  {
    id: 'classic',
    name: '经典信笺',
    icon: '📜',
    bg: 'linear-gradient(180deg, #FFF8F0 0%, #FFF 100%)',
    border: '2rpx solid #E8D5B7',
    titleStyle: { color: '#8B6914', fontSize: '40rpx', fontWeight: '700', textAlign: 'center' as const },
    contentStyle: { color: '#5D4E37', fontSize: '30rpx', lineHeight: '2', textAlign: 'justify' as const },
    footerStyle: { color: '#8B6914', fontSize: '24rpx' },
    prefix: '',
    suffix: '',
    placeholder: '亲爱的，见字如面...',
  },
  {
    id: 'romantic',
    name: '浪漫粉笺',
    icon: '💕',
    bg: 'linear-gradient(180deg, #FFF0F5 0%, #FFF 100%)',
    border: '2rpx solid #FFB6C1',
    titleStyle: { color: '#FF69B4', fontSize: '40rpx', fontWeight: '700', textAlign: 'center' as const },
    contentStyle: { color: '#333', fontSize: '30rpx', lineHeight: '2', textAlign: 'justify' as const },
    footerStyle: { color: '#FF69B4', fontSize: '24rpx' },
    prefix: '💕 致最爱的你 💕\n\n',
    suffix: '\n\n永远爱你的人',
    placeholder: '写下你想对 TA 说的情话...',
  },
  {
    id: 'elegant',
    name: '优雅蓝笺',
    icon: '💙',
    bg: 'linear-gradient(180deg, #F0F8FF 0%, #FFF 100%)',
    border: '2rpx solid #87CEEB',
    titleStyle: { color: '#4169E1', fontSize: '40rpx', fontWeight: '700', textAlign: 'center' as const },
    contentStyle: { color: '#333', fontSize: '30rpx', lineHeight: '2', textAlign: 'justify' as const },
    footerStyle: { color: '#4169E1', fontSize: '24rpx' },
    prefix: '💙 致我最珍贵的人 💙\n\n',
    suffix: '\n\n你的专属恋人',
    placeholder: '用蓝色的浪漫记录爱意...',
  },
  {
    id: 'vintage',
    name: '复古牛皮纸',
    icon: '🍂',
    bg: 'linear-gradient(180deg, #F5E6D3 0%, #FFFBF5 100%)',
    border: '2rpx solid #D2B48C',
    titleStyle: { color: '#8B4513', fontSize: '40rpx', fontWeight: '700', textAlign: 'center' as const },
    contentStyle: { color: '#4A3728', fontSize: '30rpx', lineHeight: '2', textAlign: 'justify' as const },
    footerStyle: { color: '#8B4513', fontSize: '24rpx' },
    prefix: '亲爱的：\n\n',
    suffix: '\n\n想念你的人',
    placeholder: '用复古的方式诉说思念...',
  },
  {
    id: 'night',
    name: '星空夜语',
    icon: '🌌',
    bg: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    border: '2rpx solid #533483',
    titleStyle: { color: '#E8D5B7', fontSize: '40rpx', fontWeight: '700', textAlign: 'center' as const },
    contentStyle: { color: '#E0E0E0', fontSize: '30rpx', lineHeight: '2', textAlign: 'justify' as const },
    footerStyle: { color: '#B8860B', fontSize: '24rpx' },
    prefix: '🌙 在这个宁静的夜晚 🌙\n\n',
    suffix: '\n\n想你的每一刻',
    placeholder: '在星空下写下心事...',
  },
  {
    id: 'cherry',
    name: '樱花物语',
    icon: '🌸',
    bg: 'linear-gradient(180deg, #FFF5F7 0%, #FFEEF2 50%, #FFF 100%)',
    border: '2rpx solid #FFB7C5',
    titleStyle: { color: '#E75480', fontSize: '40rpx', fontWeight: '700', textAlign: 'center' as const },
    contentStyle: { color: '#4A4A4A', fontSize: '30rpx', lineHeight: '2', textAlign: 'justify' as const },
    footerStyle: { color: '#E75480', fontSize: '24rpx' },
    prefix: '🌸 樱花树下的约定 🌸\n\n',
    suffix: '\n\n与你共赏花开花落',
    placeholder: '让樱花见证你们的爱情...',
  },
];

// 系统提示词
const SUGGESTIONS = [
  '遇见你是我最美的意外',
  '想把所有的温柔都给你',
  '和你在一起的每一天都是情人节',
  '你是我最想留住的幸运',
  '余生请多指教',
  '我愿陪你走过春夏秋冬',
];

const LetterDetailPage: React.FC = () => {
  const { couple, currentUserId, currentUserName, currentUserAvatar } = useCoupleStore();
  const [letters, setLetters] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingLetter, setViewingLetter] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [audioContext, setAudioContext] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    openAt: '',
    musicUrl: '',
    musicName: '',
    template: 'romantic'
  });

  useEffect(() => {
    if (couple) loadLetters();
    const audio = Taro.createInnerAudioContext();
    audio.onEnded(() => setIsPlaying(false));
    audio.onError(() => setIsPlaying(false));
    setAudioContext(audio);
    return () => { audio.stop(); audio.destroy(); };
  }, [couple?.id]);

  useDidHide(() => { if (audioContext) { audioContext.stop(); setIsPlaying(false); } });

  const loadLetters = async () => {
    try {
      const response: any = await letterService.getLetters(couple!.id);
      if (response.success && response.data) setLetters(response.data);
    } catch (e) {}
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) { Taro.showToast({ title: '请输入标题', icon: 'none' }); return; }
    if (!formData.content.trim()) { Taro.showToast({ title: '请输入内容', icon: 'none' }); return; }

    try {
      const tpl = TEMPLATES.find(t => t.id === formData.template) || TEMPLATES[1];
      const fullContent = tpl.prefix + formData.content + tpl.suffix;
      const response: any = await letterService.createLetter({
        coupleId: couple!.id,
        title: formData.title,
        content: fullContent,
        fromId: currentUserId,
        fromName: currentUserName,
        fromAvatar: currentUserAvatar,
        toId: couple?.user1Id === currentUserId ? couple?.user2Id : couple?.user1Id,
        openAt: formData.openAt || undefined,
        musicUrl: formData.musicUrl || undefined,
        musicName: formData.musicName || undefined,
        template: formData.template || 'romantic',
      });

      if (response.success) {
        Taro.showToast({ title: '寄出成功 💌', icon: 'success' });
        setShowCreateModal(false);
        setFormData({ title: '', content: '', openAt: '', musicUrl: '', musicName: '', template: 'romantic' });
        loadLetters();
      }
    } catch (e) {
      Taro.showToast({ title: '发送失败', icon: 'none' });
    }
  };

  const handleOpenLetter = async (letter: any) => {
    const openAt = letter.open_at ? new Date(letter.open_at) : null;
    if (openAt && openAt > new Date()) {
      const days = Math.ceil((openAt.getTime() - Date.now()) / 86400000);
      Taro.showModal({ title: '时光胶囊未到开启时间', content: `还需等待 ${days} 天`, showCancel: false });
      return;
    }
    if (!letter.is_opened) { await letterService.openLetter(letter.id); letter.is_opened = 1; }
    setViewingLetter(letter);
    if (letter.music_url && audioContext) {
      audioContext.src = letter.music_url;
    }
  };

  const togglePlay = () => {
    if (!audioContext || !viewingLetter?.music_url) return;
    if (isPlaying) { audioContext.pause(); setIsPlaying(false); }
    else { audioContext.src = viewingLetter.music_url; audioContext.play(); setIsPlaying(true); }
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除', content: '确定要删除这封情书吗？',
      success: async (res) => {
        if (res.confirm) {
          await letterService.deleteLetter(id);
          Taro.showToast({ title: '已删除', icon: 'success' });
          setViewingLetter(null);
          if (audioContext) { audioContext.stop(); setIsPlaying(false); }
          loadLetters();
        }
      }
    });
  };

  const applySuggestion = (text: string) => {
    setFormData({ ...formData, content: formData.content ? formData.content + '\n' + text : text });
  };

  const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id) || TEMPLATES[1];
  const isFromMe = (letter: any) => letter.from_id === currentUserId;
  const formatDate = (s: string) => { if (!s) return ''; const d = new Date(s); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; };

  // 查看信件详情
  if (viewingLetter) {
    const tpl = getTemplate(viewingLetter.template || 'romantic');
    return (
      <ScrollView className={styles.viewPage} scrollY enhanced showScrollbar={false}
        style={{ background: tpl.bg }}>
        <View className={styles.viewHeader}>
          <Text className={styles.viewBack} onClick={() => { setViewingLetter(null); audioContext?.stop(); setIsPlaying(false); }}>‹ 返回</Text>
          {viewingLetter.music_url && (
            <View className={styles.playBtn} onClick={togglePlay}>
              <Text>{isPlaying ? '⏸️' : '▶️'}</Text>
              <Text className={styles.playText}>{viewingLetter.music_name || '音乐'}</Text>
            </View>
          )}
        </View>

        <View className={styles.viewPaper} style={{ border: tpl.border }}>
          <Text style={tpl.titleStyle}>{viewingLetter.title}</Text>

          <View className={styles.viewAuthor}>
            <Image className={styles.viewAvatar} src={viewingLetter.from_avatar || ''} mode="aspectFill" />
            <View>
              <Text style={{ fontSize: '28rpx', fontWeight: '500', color: '#333' }}>{viewingLetter.from_name}</Text>
              <Text style={{ fontSize: '22rpx', color: '#999', marginTop: '4rpx', display: 'block' }}>{formatDate(viewingLetter.send_at || viewingLetter.created_at)}</Text>
            </View>
          </View>

          <View className={styles.viewDivider} style={{ borderColor: tpl.border.replace('2rpx solid ', '') }} />

          <Text style={tpl.contentStyle}>{viewingLetter.content}</Text>

          {viewingLetter.music_url && (
            <View className={styles.viewMusicBadge}>
              <Text>🎵 {viewingLetter.music_name}</Text>
            </View>
          )}

          <Text style={{ ...tpl.footerStyle, textAlign: 'center', marginTop: '40rpx' }}>
            {isFromMe(viewingLetter) ? '— 写给 Ta 的信 —' : '— 来自 Ta 的信 —'}
          </Text>
        </View>

        <View style={{ padding: '20rpx 32rpx 60rpx' }}>
          <Button className={styles.delBtn} onClick={() => handleDelete(viewingLetter.id)}>
            <Text style={{ color: '#999', fontSize: '26rpx' }}>删除</Text>
          </Button>
        </View>
      </ScrollView>
    );
  }

  // 信件列表
  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>💌 情书</Text>
        <Text className={styles.headerDesc}>写一封信，寄给 TA</Text>
      </View>

      <View className={styles.letterList}>
        {letters.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>💌</Text>
            <Text className={styles.emptyText}>还没有情书</Text>
            <Text className={styles.emptyDesc}>写一封情书给 TA 吧</Text>
          </View>
        ) : (
          letters.map(letter => {
            const tpl = getTemplate(letter.template || 'romantic');
            return (
              <View key={letter.id} className={styles.letterCard} style={{ borderLeft: `6rpx solid ${tpl.border.replace('2rpx solid ', '')}` }}
                onClick={() => handleOpenLetter(letter)}>
                <View className={styles.cardLeft}>
                  <Image className={styles.cardAvatar} src={letter.from_avatar || ''} mode="aspectFill" />
                </View>
                <View className={styles.cardCenter}>
                  <View className={styles.cardRow}>
                    <Text className={styles.cardName}>{letter.from_name}</Text>
                    {!letter.is_opened && <View className={styles.newBadge}><Text style={{ fontSize: '18rpx', color: '#fff' }}>NEW</Text></View>}
                  </View>
                  <Text className={styles.cardTitle}>{letter.title}</Text>
                  <View className={styles.cardMeta}>
                    <Text className={styles.cardTime}>{formatDate(letter.send_at || letter.created_at)}</Text>
                    {letter.music_url && <Text style={{ fontSize: '24rpx' }}>🎵</Text>}
                    <Text style={{ fontSize: '20rpx', background: 'rgba(255,107,157,0.1)', padding: '2rpx 8rpx', borderRadius: '6rpx', color: '#FF6B9D' }}>{tpl.icon}</Text>
                  </View>
                  {letter.open_at && <Text className={styles.cardOpen}>⏰ {formatDate(letter.open_at)} 开启</Text>}
                </View>
                <Text className={styles.cardIcon}>{letter.is_opened ? '📖' : '🔒'}</Text>
              </View>
            );
          })
        )}
      </View>

      <View className={styles.fabWrapper}>
        <Button className={styles.fab} onClick={() => setShowCreateModal(true)}>
          <Text style={{ color: '#fff', fontSize: '36rpx' }}>✏️</Text>
        </Button>
      </View>

      {/* 写信弹窗 */}
      {showCreateModal && (
        <View className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>写一封情书</Text>
              <Text className={styles.modalClose} onClick={() => setShowCreateModal(false)}>✕</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              {/* 模板选择 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>🎨 选择模板</Text>
                <ScrollView scrollX className={styles.tplScroll}>
                  <View className={styles.tplList}>
                    {TEMPLATES.map(tpl => (
                      <View key={tpl.id}
                        className={`${styles.tplItem} ${formData.template === tpl.id ? styles.tplActive : ''}`}
                        style={{ background: tpl.bg, border: formData.template === tpl.id ? `3rpx solid ${tpl.border.replace('2rpx solid ', '')}` : '2rpx solid #eee' }}
                        onClick={() => setFormData({ ...formData, template: tpl.id })}>
                        <Text style={{ fontSize: '36rpx' }}>{tpl.icon}</Text>
                        <Text className={styles.tplName}>{tpl.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* 标题 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>标题 *</Text>
                <Input className={styles.input} placeholder="给这封信取个名字..."
                  value={formData.title} onInput={(e: any) => setFormData({ ...formData, title: e.detail.value })} maxLength={30} />
              </View>

              {/* 内容 */}
              <View className={styles.formItem}>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>内容 *</Text>
                  <Text className={styles.formHint}>{formData.content.length}/2000</Text>
                </View>
                <Textarea className={styles.textarea}
                  placeholder={getTemplate(formData.template).placeholder}
                  value={formData.content}
                  onInput={(e: any) => setFormData({ ...formData, content: e.detail.value })}
                  maxLength={2000} autoHeight />
              </View>

              {/* 快捷语句 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>💡 快捷语句</Text>
                <View className={styles.suggestions}>
                  {SUGGESTIONS.map((s, i) => (
                    <View key={i} className={styles.suggestionItem} onClick={() => applySuggestion(s)}>
                      <Text className={styles.suggestionText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 音乐 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>🎵 背景音乐</Text>
                <View className={styles.selectorBtn} onClick={() => setShowMusicPicker(true)}>
                  <Text style={{ fontSize: '28rpx' }}>🎶</Text>
                  <Text className={styles.selectorText}>{formData.musicName || '选择背景音乐'}</Text>
                  <Text style={{ color: '#999' }}>›</Text>
                </View>
                {formData.musicName && (
                  <View className={styles.selectedTag}>
                    <Text>🎵 {formData.musicName}</Text>
                    <Text onClick={() => setFormData({ ...formData, musicUrl: '', musicName: '' })} style={{ color: '#999' }}>✕</Text>
                  </View>
                )}
              </View>

              {/* 定时开启 */}
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>⏰ 定时开启</Text>
                <Text className={styles.formHint}>不设置则对方可立即打开</Text>
                <Input className={styles.input} type="date" placeholder="选择日期"
                  value={formData.openAt} onInput={(e: any) => setFormData({ ...formData, openAt: e.detail.value })} />
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                <Text style={{ color: '#666' }}>取消</Text>
              </Button>
              <Button className={styles.confirmBtn} onClick={handleCreate}>
                <Text style={{ color: '#fff' }}>寄出 💌</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 音乐选择弹窗 */}
      {showMusicPicker && (
        <View className={styles.modalOverlay} onClick={() => setShowMusicPicker(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择音乐</Text>
              <Text className={styles.modalClose} onClick={() => setShowMusicPicker(false)}>✕</Text>
            </View>
            <ScrollView className={styles.modalBody} scrollY>
              {MUSIC_LIST.map((m, i) => (
                <View key={i} className={`${styles.musicItem} ${formData.musicUrl === m.url ? styles.musicActive : ''}`}
                  onClick={() => { setFormData({ ...formData, musicUrl: m.url, musicName: m.name }); setShowMusicPicker(false); }}>
                  <Text style={{ fontSize: '32rpx' }}>🎵</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '500' }}>{m.name}</Text>
                    <Text style={{ fontSize: '22rpx', color: '#999', display: 'block' }}>{m.artist}</Text>
                  </View>
                  {formData.musicUrl === m.url && <Text style={{ color: '#FF6B9D', fontWeight: 'bold' }}>✓</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default LetterDetailPage;
