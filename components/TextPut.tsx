import { borderRadius, colors, fonts } from '@/theme/theme';
import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

export default function TextPut({ placeholder, value, onChangeText, ...rest }: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.darkText}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.small,
    padding: 12,
    height: 50,
    fontSize: 16,
    color: colors.black,
    fontFamily: fonts.regular,
    width: '100%',
    marginBottom: 15,
  },
});