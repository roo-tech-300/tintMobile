import { colors, fonts } from '@/theme/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type LoadingSpinnerProps = {
    message?: string;
    size?: 'small' | 'large';
    color?: string;
};

export default function LoadingSpinner({
    size = 'small',
    color = colors.background
}: LoadingSpinnerProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
