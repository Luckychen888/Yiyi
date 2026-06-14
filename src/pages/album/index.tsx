import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useCoupleStore } from '../../store/useCoupleStore';
import { albumService } from '../../services/api';

const AlbumPage: React.FC = () => {
  const { couple, currentUserId, currentUserName } = useCoupleStore();
  const [photos, setPhotos] = useState<any[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (couple) {
      loadPhotos();
    }
  }, [couple?.id]);

  const loadPhotos = async () => {
    try {
      const response: any = await albumService.getPhotos(couple!.id);
      if (response.success && response.data) {
        setPhotos(response.data);
      }
    } catch (error) {
      console.error('加载相册失败:', error);
    }
  };

  const handleUpload = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        setIsUploading(true);
        let uploadCount = 0;

        for (const file of res.tempFiles) {
          try {
            const response: any = await albumService.uploadPhoto({
              coupleId: couple!.id,
              url: file.path,
              description: '',
              uploadedBy: currentUserId,
              uploadedByName: currentUserName
            });

            if (response.success) {
              uploadCount++;
            }
          } catch (error) {
            console.error('上传单张照片失败:', error);
          }
        }

        setIsUploading(false);

        if (uploadCount > 0) {
          Taro.showToast({ title: `成功上传 ${uploadCount} 张照片`, icon: 'success' });
          loadPhotos();
        } else {
          Taro.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      setIsUploading(false);
    }
  };

  const handlePreview = (photo: any) => {
    setPreviewPhoto(photo);
  };

  const handlePreviewImage = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: photos.map(p => p.url)
    });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await albumService.deletePhoto(id);
            Taro.showToast({ title: '已删除', icon: 'success' });
            setPreviewPhoto(null);
            loadPhotos();
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 按日期分组
  const groupedPhotos = photos.reduce((groups: any, photo: any) => {
    const date = photo.created_at ? photo.created_at.split('T')[0] : 'unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(photo);
    return groups;
  }, {});

  // 照片详情预览
  if (previewPhoto) {
    return (
      <ScrollView className={styles.previewPage} scrollY enhanced showScrollbar={false}>
        <View className={styles.previewHeader}>
          <Text className={styles.previewBack} onClick={() => setPreviewPhoto(null)}>‹ 返回</Text>
        </View>

        <View className={styles.previewImageWrapper} onClick={() => handlePreviewImage(previewPhoto.url)}>
          <Image className={styles.previewImage} src={previewPhoto.url} mode="aspectFill" />
        </View>

        <View className={styles.previewInfo}>
          {previewPhoto.description && (
            <Text className={styles.previewDesc}>{previewPhoto.description}</Text>
          )}
          <View className={styles.previewMeta}>
            {previewPhoto.uploaded_by_name && (
              <Text className={styles.previewUploader}>{previewPhoto.uploaded_by_name} 上传</Text>
            )}
            {previewPhoto.created_at && (
              <Text className={styles.previewTime}>{formatDate(previewPhoto.created_at)}</Text>
            )}
          </View>
          {previewPhoto.location && (
            <View className={styles.previewLocation}>
              <Text className={styles.previewLocationIcon}>📍</Text>
              <Text className={styles.previewLocationText}>{previewPhoto.location}</Text>
            </View>
          )}
        </View>

        <View className={styles.previewActions}>
          <Button className={styles.previewDeleteBtn} onClick={() => handleDelete(previewPhoto.id)}>
            <Text className={styles.previewDeleteText}>删除照片</Text>
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY enhanced showScrollbar={false}>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>双人相册</Text>
        <Text className={styles.headerDesc}>记录你们的每一个瞬间</Text>
        <View className={styles.photoCount}>
          <Text className={styles.photoCountText}>共 {photos.length} 张照片</Text>
        </View>
      </View>

      {/* 照片墙 */}
      {photos.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📷</Text>
          <Text className={styles.emptyText}>相册还是空的</Text>
          <Text className={styles.emptyDesc}>上传你们的第一张合照吧</Text>
          <Button className={styles.uploadEmptyBtn} onClick={handleUpload}>
            <Text className={styles.uploadEmptyText}>上传照片</Text>
          </Button>
        </View>
      ) : (
        Object.keys(groupedPhotos).sort((a, b) => b.localeCompare(a)).map(date => (
          <View key={date} className={styles.dateGroup}>
            <View className={styles.dateHeader}>
              <Text className={styles.dateText}>{formatDate(date)}</Text>
              <Text className={styles.dateCount}>{groupedPhotos[date].length} 张</Text>
            </View>
            <View className={styles.photoGrid}>
              {groupedPhotos[date].map((photo: any) => (
                <View
                  key={photo.id}
                  className={styles.photoItem}
                  onClick={() => handlePreview(photo)}
                >
                  <Image className={styles.photoImage} src={photo.url || photo.thumbnail} mode="aspectFill" lazyLoad />
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      {/* 上传按钮 */}
      <View className={styles.addButtonWrapper}>
        <Button className={styles.addButton} onClick={handleUpload} loading={isUploading} disabled={isUploading}>
          <Text className={styles.addButtonText}>{isUploading ? '上传中...' : '+ 上传照片'}</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default AlbumPage;
