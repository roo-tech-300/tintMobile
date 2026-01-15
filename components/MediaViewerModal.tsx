import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import DotIndicator from './DotIndicator';
import TintIcon from './Icon';

interface MediaItem {
  uri: string;
  type: string;
}

interface MediaViewerModalProps {
  visible: boolean;
  media: MediaItem[];
  startIndex: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ visible, media, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(startIndex);
      // Scroll to the start index after a brief delay to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: startIndex, animated: false });
      }, 50);
    }
  }, [visible, startIndex]);

  const onMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const renderItem = ({ item, index }: { item: MediaItem; index: number }) => {
    const isFocused = index === currentIndex;

    return (
      <View style={styles.mediaContainer}>
        {item.type === 'video' ? (
          <VideoItem
            uri={item.uri}
            shouldPlay={isFocused && visible}
          />
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar hidden />

        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={20}>
          <TintIcon name="cross" size={18} color="white" />
        </Pressable>

       
        <FlatList
          ref={flatListRef}
          data={media}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialScrollIndex={startIndex}
        />

        {/* Dot Indicator */}
        {media.length > 1 && (
          <View style={styles.indicatorWrapper}>
            <DotIndicator
              index={currentIndex}
              total={media.length}
              size={7}
              gap={10}
            />
          </View>
        )}
      </View>
    </Modal>
  );

};

const VideoItem = React.memo(({ uri, shouldPlay }: { uri: string; shouldPlay: boolean }) => {
  const [userPaused, setUserPaused] = useState(false);

  // Reset user pause preference when slide changes
  useEffect(() => {
    if (!shouldPlay) {
      setUserPaused(false);
    }
  }, [shouldPlay]);

  const togglePlay = () => {
    setUserPaused(prev => !prev);
  };

  const isPlaying = shouldPlay && !userPaused;
  console.log("Is it playing:", isPlaying);

  return (
    <Pressable onPress={togglePlay} style={styles.videoContainer}>
      {/* <Video
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        shouldPlay={isPlaying}
        useNativeControls={false}
      /> */}


      <Video
        style={styles.video}
        source={{ uri: uri }}
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        shouldPlay={isPlaying}
    />
      
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  mediaContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  indicatorWrapper: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

});

export default MediaViewerModal;
