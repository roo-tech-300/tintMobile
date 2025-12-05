import { colors, fonts } from "@/theme/theme";
import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";

interface LogoProps {
    size?: "small" | "medium" | "large";
    variant?: "image" | "text" | "full";
    style?: ViewStyle;
}

const Logo: React.FC<LogoProps> = ({
    size = "medium",
    variant = "image",
    style
}) => {
    // Size configurations
    const sizeConfig = {
        small: {
            imageSize: 30,
            fontSize: 18,
        },
        medium: {
            imageSize: 40,
            fontSize: 24,
        },
        large: {
            imageSize: 60,
            fontSize: 32,
        },
    };

    const currentSize = sizeConfig[size];

    // Image variant - just the logo image
    if (variant === "image") {
        return (
            <View style={[styles.container, style]}>
                <Image
                    source={require("@/assets/images/Logo 1.png")}
                    style={[
                        styles.logoImage,
                        { width: currentSize.imageSize, height: currentSize.imageSize },
                    ]}
                    resizeMode="contain"
                />
            </View>
        );
    }

    // Text variant - just the text "Tint"
    if (variant === "text") {
        return (
            <View style={[styles.container, style]}>
                <Text style={[styles.logoText, { fontSize: currentSize.fontSize }]}>
                    Tint
                </Text>
            </View>
        );
    }

    // Full variant - image + text
    return (
        <View style={[styles.container, styles.fullContainer, style]}>
            <Image
                source={require("@/assets/images/Logo 2.png")}
                style={[
                    styles.logoImage,
                    { width: currentSize.imageSize, height: currentSize.imageSize },
                ]}
                resizeMode="contain"
            />
            
        </View>
    );
};

export default Logo;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    fullContainer: {
        flexDirection: "row",
        gap: 10,
    },
    logoImage: {
        // Size is set dynamically based on size prop
    },
    logoText: {
        color: colors.text,
        fontFamily: fonts.bold,
        fontWeight: "700",
    },
});
