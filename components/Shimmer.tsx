import React, { useEffect, useRef, useState } from "react";
import { Animated, DimensionValue, StyleSheet, View } from "react-native";

interface ShimmerProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = "100%",
  height = "100%",
  borderRadius = 20,
}) => {
  const shimmerTranslate = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerTranslate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerTranslate.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};


import { Image } from "expo-image";

const ImageWithShimmer = ({
  uri,
  width = "100%",
  height = "100%",
  borderRadius = 20,
  resizeMode = "cover"
}: {
  uri: string;
  width?: DimensionValue | number;
  height?: DimensionValue | number;
  borderRadius?: number;
  resizeMode?: "contain" | "cover" | "stretch" | "repeat" | "center";
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={{ width: width as any, height: height as any, borderRadius, overflow: 'hidden' }}>

      {!loaded && (
        <View style={StyleSheet.absoluteFill}>
          <Shimmer borderRadius={borderRadius} />
        </View>
      )}

      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        contentFit={resizeMode as any}
        transition={300}
        onLoad={() => setLoaded(true)}
        cachePolicy="memory-disk"
        priority="high"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e1e1e",
    overflow: "hidden",
  },
  shimmer: {
    width: "40%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});

export { ImageWithShimmer, Shimmer };

