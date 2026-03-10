import { ResizeMode, Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import DotIndicator from './DotIndicator';
import { ImageWithShimmer } from './Shimmer';

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
  const translateY = useRef(new Animated.Value(0)).current;


  const backgroundOpacity = translateY.interpolate({
    inputRange: [0, screenHeight * 0.5],
    outputRange: [1, 0.4],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        // Trigger vertical swipe if movement is more vertical than horizontal
        return Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx);
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 7
        }).start();
      },
    })
  ).current;

  const renderItem = ({ item, index }: { item: MediaItem; index: number }) => {
    const isFocused = index === currentIndex;

    return (
      <View style={styles.mediaContainer} pointerEvents="box-none">
        {item.type === 'video' ? (
          <VideoItem
            uri={item.uri}
            shouldPlay={isFocused && visible}
          />
        ) : (
          <Pressable style={{ width: '100%', height: '100%' }}>
            <ImageWithShimmer uri={item.uri} resizeMode="contain" />
          </Pressable>
        )}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'black', opacity: backgroundOpacity }
          ]}
        />

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              backgroundColor: 'transparent' // Main container transparent to show animated background
            }
          ]}
          {...panResponder.panHandlers}
        >
          <StatusBar hidden />

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
            style={{ flex: 1 }}
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
        </Animated.View>
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
