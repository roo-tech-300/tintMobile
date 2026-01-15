import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "@/theme/theme";

interface VerifiedBadgeProps {
  size?: number; // dot size
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 8 }) => {
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {/* Glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 1,
            opacity: glowAnim,
          },
        ]}
      />

      {/* Core Dot */}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

export default VerifiedBadge;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  glow: {
    position: "absolute",
    backgroundColor: "#fd74e886",
    shadowColor: "#fd74e886",
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },

  dot: {
    backgroundColor: colors.primary,
  },
});
