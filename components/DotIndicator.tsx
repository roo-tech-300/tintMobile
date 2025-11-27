import { colors } from '@/theme/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  index: number;
  total: number;
  size?: number;
  gap?: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
};

export default function DotIndicator({
  index,
  total,
  size = 8,
  gap = 8,
  activeColor = colors.primary,
  inactiveColor = colors.darkText,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginHorizontal: gap / 2,
              backgroundColor: i === index ? activeColor : inactiveColor,
              opacity: i === index ? 1 : 0.45,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  dot: {},
});