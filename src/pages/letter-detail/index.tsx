import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { letterService } from '../../services/api';

const LOVE_MUSIC_LIST = [
  { name: '致爱丽丝', url: 'https://music.163.com/song/media/outer/url?id=1901371647.mp3', artist: '贝多芬' },
  { name: '天空之城', url: 'https://music.163.com/song/media/outer/url?id=1901371654.mp3', artist: '久石让' },
  { name: 'Canon in D', url: 'https://music.163.com/song/media/outer/url?id=1901371662.mp3', artist: 'Pachelbel' },
  { name: 'River Flows in You', url: 'https://music.163.com/song/media/outer/url?id=1901371670.mp3', artist: 'Yiruma' },
  { name: 'Wedding March', url: 'https://music.163.com/song/media/outer/url?id=1901371678.mp3', artist: 'Mendelssohn' },
  { name: '梦中的婚礼', url: 'https://music.163.com/song/media/outer/url?id=1901371686.mp3', artist: 'Richard Clayderman' },
];

const LetterDetailPage: React.FC = () => {
  const { couple, currentUserId, currentUserName, currentUserAvatar } = useCoupleStore();
  const [letters, setLetters] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingLetter, setViewingLetter] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<any>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [audioContext, setAudioContext] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    openAt: '',
    musicUrl: '',
    musicName: ''
  });

  useEffect(() => {
    if (couple) {
      loadLetters();
    }

    const audio = Taro.createInnerAudioContext();
    audio.onEnded(() => setIsPlaying(false));
    audio.onError(() => setIsPlaying(false));
    setAudioContext(audio);

    return () => {
      audio.stop();
      audio.destroy();
    };
  }, [couple?.id]);

  useDidHide(() => {
    if (audioContext) {
      audioContext.stop();
      setIsPlaying(false);
    }
  });

  const loadLetters = async () => {
    try {
      const response: any = await letterService.getLetters(couple!.id);
      if (response.success && response.data) {
        setLetters(response.data);
      }
    } catch (error) {
      // 加载失败静默处理
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!formData.content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    try {
      const response: any = await letterService.createLetter({
        coupleId: couple!.id,
        title: formData.title,
        content: formData.content,
        fromId: currentUserId,
        fromName: currentUserName,
        fromAvatar: currentUserAvatar,
        toId: couple?.user1Id === currentUserId ? couple?.user2Id : couple?.user1Id,
        openAt: formData.openAt || undefined,
        musicUrl: formData.musicUrl || undefined,
        musicName: formData.musicName || undefined
      });

      if (response.success) {
        Taro.showToast({ title: '发送成功', icon: 'success' });
        setShowCreateModal(false);
        setFormData({ title: '', content: '', openAt: '', musicUrl: '', musicName: '' });
        loadLetters();
      }
    } catch (error) {
      Taro.showToast({ title: '发送失败', icon: 'none' });
    }
  };

  const handleOpenLetter = async (letter: any) => {
    const now = new Date();
    const openAt = letter.open_at ? new Date(letter.open_at) : null;

    if (openAt && openAt > now) {
      const daysLeft = Math.ceil((openAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      Taro.showModal({
        title: '时光胶囊未到开启时间',
        content: `还需等待 ${daysLeft} 天才能打开`,
        showCancel: false
      });
      return;
    }

    if (!letter.is_opened) {
      await letterService.openLetter(letter.id);
      letter.is_opened = 1;
    }

    setViewingLetter(letter);

    if (letter.music_url && audioContext) {
      audioContext.src = letter.music_url;
      setCurrentMusic({ name: letter.music_name || '背景音乐', url: letter.music_url });
    }
  };

  const togglePlay = () => {
    if (!audioContext) return;

    if (isPlaying) {
      audioContext.pause();
      setIsPlaying(false);
    } else {
      if (viewingLetter?.music_url) {
        if (!audioContext.src || audioContext.src !== viewingLetter.music_url) {
          audioContext.src = viewingLetter.music_url;
        }
        audioContext.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSelectMusic = (music: any) => {
    setFormData({ ...formData, musicUrl: music.url, musicName: music.name });
    setShowMusicPicker(false);
    Taro.showToast({ title: `已选择: ${music.name}`, icon: 'success' });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这封情书吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await letterService.deleteLetter(id);
            Taro.showToast({ title: '已删除', icon: 'success' });
            setViewingLetter(null);
            if (audioContext) {
              audioContext.stop();
              setIsPlaying(false);
            }
            loadLetters();
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const isFromMe = (letter: any) => letter.from_id === currentUserId;

  // 查看信件详情
  if (viewingLetter) {
    return (
      <ScrollView className={styles.letterView} scrollY enhanced showScrollbar={false}>
        <View className={styles.letterViewHeader}>
          <Text className={styles.letterViewBack} onClick={() => {
            setViewingLetter(null);
            if (audioContext) {
              audioContext.stop();
              setIsPlaying(false);
            }
          }}>‹ 返回</Text>
          {viewingLetter.music_url && (
            <View className={styles.musicControl} onClick={togglePlay}>
              <Text className={styles.musicIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
              <Text className={styles.musicName}>{viewingLetter.music_name || '背景音乐'}</Text>
            </View>
          )}
        </View>

        <View className={styles.letterPaper}>
          <View className={styles.letterPaperDecor}>
            <Text className={styles.letterPaperIcon}>💌</Text>
          </View>

          <Text className={styles.letterTitle}>{viewingLetter.title}</Text>

          <View className={styles.letterFrom}>
            <Image className={styles.letterFromAvatar} src={viewingLetter.from_avatar || ''} mode="aspectFill" />
            <View className={styles.letterFromInfo}>
              <Text className={styles.letterFromName}>{viewingLetter.from_name}</Text>
              <Text className={styles.letterFromTime}>{formatTime(viewingLetter.send_at || viewingLetter.created_at)}</Text>
            </View>
          </View>

          <View className={styles.letterContentWrapper}>
            <Text className={styles.letterContent}>{viewingLetter.content}</Text>
          </View>

          {viewingLetter.music_url && (
            <View className={styles.musicBadge}>
              <Text className={styles.musicBadgeIcon}>🎵</Text>
              <Text className={styles.musicBadgeText}>{viewingLetter.music_name || '背景音乐'}</Text>
            </View>
          )}

          <View className={styles.letterFooter}>
            <Text className={styles.letterFooterText}>
              {isFromMe(viewingLetter) ? '写给 Ta 的信' : '收到的信'}
            </Text>
          </View>
        </View>

        <View className={styles.letterActions}>
          <Button className={styles.letterDeleteBtn} onClick={() => handleDelete(viewingLetter.id)}>
            <Text className={styles.letterDeleteText}>删除</Text>
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>时光胶囊</Text>
        <Text className={styles.headerDesc}>写给未来的 TA 一封信</Text>
      </View>

      <View className={styles.letterList}>
        {letters.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💌</Text>
            <Text className={styles.emptyText}>还没有情书</Text>
            <Text className={styles.emptyDesc}>写一封信给 TA 吧</Text>
          </View>
        ) : (
          letters.map(letter => (
            <View
              key={letter.id}
              className={`${styles.letterCard} ${isFromMe(letter) ? styles.letterCardMe : styles.letterCardPartner}`}
              onClick={() => handleOpenLetter(letter)}
            >
              <View className={styles.letterCardLeft}>
                <Image className={styles.letterCardAvatar} src={letter.from_avatar || ''} mode="aspectFill" />
              </View>
              <View className={styles.letterCardContent}>
                <View className={styles.letterCardHeader}>
                  <Text className={styles.letterCardName}>{letter.from_name}</Text>
                  {!letter.is_opened && (
                    <View className={styles.letterUnreadBadge}>
                      <Text className={styles.letterUnreadText}>NEW</Text>
                    </View>
                  )}
                </View>
                <Text className={styles.letterCardTitle}>{letter.title}</Text>
                <View className={styles.letterCardMeta}>
                  <Text className={styles.letterCardTime}>{formatTime(letter.send_at || letter.created_at)}</Text>
                  {letter.music_url && <Text className={styles.letterCardMusic}>🎵</Text>}
                </View>
                {letter.open_at && (
                  <Text className={styles.letterOpenTime}>
                    ⏰ {formatTime(letter.open_at)} 开启
                  </Text>
                )}
              </View>
              <View className={styles.letterCardRight}>
                <Text className={styles.letterCardIcon}>{letter.is_opened ? '📖' : '🔒'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View className={styles.addButtonWrapper}>
        <Button className={styles.addButton} onClick={() => setShowCreateModal(true)}>
          <Text className={styles.addButtonText}>✏️ 写一封信</Text>
        </Button>
      </View>

      {/* 写信弹窗 */}
      {showCreateModal && (
        <View className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>写一封信</Text>
              <Text className={styles.modalClose} onClick={() => setShowCreateModal(false)}>✕</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>标题 *</Text>
                <Input
                  className={styles.input}
                  placeholder="给这封信取个名字..."
                  value={formData.title}
                  onInput={(e: any) => setFormData({ ...formData, title: e.detail.value })}
                  maxLength={30}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>内容 *</Text>
                <textarea
                  className={styles.textarea}
                  placeholder="写下你想说的话..."
                  value={formData.content}
                  onInput={(e: any) => setFormData({ ...formData, content: e.detail.value })}
                  maxLength={2000}
                  autoHeight
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>🎵 背景音乐（选填）</Text>
                <View className={styles.musicSelector} onClick={() => setShowMusicPicker(true)}>
                  <Text className={styles.musicSelectorIcon}>🎶</Text>
                  <Text className={styles.musicSelectorText}>
                    {formData.musicName || '选择一首背景音乐'}
                  </Text>
                  <Text className={styles.musicSelectorArrow}>›</Text>
                </View>
                {formData.musicName && (
                  <View className={styles.musicSelected}>
                    <Text className={styles.musicSelectedName}>🎵 {formData.musicName}</Text>
                    <Text className={styles.musicSelectedClear} onClick={() => setFormData({ ...formData, musicUrl: '', musicName: '' })}>清除</Text>
                  </View>
                )}
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>定时开启（选填）</Text>
                <Text className={styles.formTip}>不设置则对方可立即打开</Text>
                <input
                  className={styles.input}
                  type="date"
                  value={formData.openAt}
                  onInput={(e: any) => setFormData({ ...formData, openAt: e.detail.value })}
                />
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.confirmButton} onClick={handleCreate}>
                <Text className={styles.confirmButtonText}>寄出信件</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 音乐选择弹窗 */}
      {showMusicPicker && (
        <View className={styles.modalOverlay} onClick={() => setShowMusicPicker(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择背景音乐</Text>
              <Text className={styles.modalClose} onClick={() => setShowMusicPicker(false)}>✕</Text>
            </View>

            <ScrollView className={styles.modalBody} scrollY>
              <View className={styles.musicList}>
                {LOVE_MUSIC_LIST.map((music, index) => (
                  <View
                    key={index}
                    className={`${styles.musicItem} ${formData.musicUrl === music.url ? styles.musicItemActive : ''}`}
                    onClick={() => handleSelectMusic(music)}
                  >
                    <View className={styles.musicItemLeft}>
                      <Text className={styles.musicItemIcon}>🎵</Text>
                      <View className={styles.musicItemInfo}>
                        <Text className={styles.musicItemName}>{music.name}</Text>
                        <Text className={styles.musicItemArtist}>{music.artist}</Text>
                      </View>
                    </View>
                    {formData.musicUrl === music.url && (
                      <Text className={styles.musicItemCheck}>✓</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default LetterDetailPage;
