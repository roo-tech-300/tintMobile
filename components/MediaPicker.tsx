import { borderRadius, colors, fonts } from "@/theme/theme";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import TintIcon from "./Icon";
import LoadingSpinner from "./LoadingSpinner";

export interface MediaItem {
    id?: string;
    uri: string;
    type: 'image' | 'video';
}

interface MediaPickerProps {
    selectedMedia: MediaItem[];
    onMediaChanged: (media: MediaItem[]) => void;
    onAlert: (message: string, type?: "error" | "success" | "info") => void;
    isPickingMedia: boolean;
    setIsPickingMedia?: (value: boolean) => void;
}

const MediaPicker = ({ selectedMedia, onMediaChanged, onAlert, isPickingMedia, setIsPickingMedia }: MediaPickerProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const pickMedia = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            onAlert('Sorry, we need camera roll permissions to make this work!', 'error');
            return;
        }

        // Check if limit reached
        if (selectedMedia.length >= 5) {
            onAlert('You can only select up to 5 media items', 'info');
            return;
        }

        // Launch picker
        try {
            setIsLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow images and videos
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5 - selectedMedia.length, // Limit based on remaining slots
            });

            if (!result.canceled && result.assets) {
                const newMedia = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: asset.type as 'image' | 'video'
                }));
                onMediaChanged([...selectedMedia, ...newMedia]);
            }
        } catch (error) {
            console.error("Error picking media:", error);
            onAlert("Error picking media", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const removeMedia = (index: number) => {
        onMediaChanged(selectedMedia.filter((_, i) => i !== index));
    };

    return (
        <View>
            {/* Add Media Button */}
            <Pressable style={styles.addImageButton} onPress={pickMedia} disabled={isPickingMedia}>
                {isPickingMedia ? (
                    <LoadingSpinner color={colors.primary} />
                ) : (
                    <>
                        <TintIcon name="picture" size={32} color={colors.primary} />
                        <Text style={styles.addImageText}>Select Photos or Videos</Text>
                        <Text style={styles.addImageSubtext}>
                            {selectedMedia.length > 0
                                ? `${selectedMedia.length}/5 selected`
                                : (isLoading) ? <LoadingSpinner color={colors.primary} /> : 'Max 5 photos or videos'}
                        </Text>
                    </>
                )}
            </Pressable>

            {/* Selected Media Grid */}
            {selectedMedia.length > 0 && (
                <View style={styles.imagesGrid}>
                    {selectedMedia.map((item, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image source={{ uri: item.uri }} style={styles.selectedImage} />

                            {/* Video Indicator */}
                            {item.type === 'video' && (
                                <View style={styles.videoIndicator}>
                                    <TintIcon name="play" size={20} color={colors.text} />
                                </View>
                            )}

                            <Pressable
                                style={styles.removeImageButton}
                                onPress={() => removeMedia(index)}
                            >
                                <TintIcon name="cross-circle" size={24} color={colors.error} />
                            </Pressable>
                            <View style={styles.imageNumber}>
                                <Text style={styles.imageNumberText}>{index + 1}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default MediaPicker;

const styles = StyleSheet.create({
    addImageButton: {
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: "dashed",
    },
    addImageText: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
        marginTop: 12,
    },
    addImageSubtext: {
        color: colors.darkText,
        fontSize: 14,
        marginTop: 4,
    },
    imagesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 20,
    },
    imageContainer: {
        width: "48%",
        aspectRatio: 1,
        borderRadius: borderRadius.small,
        overflow: "hidden",
        position: "relative",
    },
    selectedImage: {
        width: "100%",
        height: "100%",
    },
    videoIndicator: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    removeImageButton: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 12,
        zIndex: 2,
    },
    imageNumber: {
        position: "absolute",
        bottom: 8,
        left: 8,
        backgroundColor: colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    imageNumberText: {
        color: colors.text,
        fontSize: 12,
        fontFamily: fonts.bold,
    },
});
