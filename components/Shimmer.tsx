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


const ImageWithShimmer = ({
  uri,
  width = "100%",
  resizeMode = "contain"
}: {
  uri: string;
  width?: DimensionValue | number;
  resizeMode?: "contain" | "cover" | "stretch" | "repeat" | "center";
}) => {
  const [loaded, setLoaded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;


  const handleLoad = () => {
    setLoaded(true);

    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ width: width as any, height: "100%" }}>

      {!loaded && (
        <View style={StyleSheet.absoluteFill}>
          <Shimmer />
        </View>
      )}

      <Animated.Image
        source={{ uri }}
        style={{ opacity, width: "100%", height: "100%" }}
        resizeMode={resizeMode}
        onLoad={handleLoad}
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

