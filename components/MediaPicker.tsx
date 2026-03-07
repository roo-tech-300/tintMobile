import { borderRadius, colors, fonts } from "@/theme/theme";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
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
    const [isReceivingFile, setIsReceivingFile] = useState(false);

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

        try {
            setIsLoading(true);
            setIsReceivingFile(true); // <-- FILE RECEIVING STARTS HERE
            setIsPickingMedia?.(true); // Notify parent

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5 - selectedMedia.length,
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
            setIsReceivingFile(false); // <-- FILE RECEIVING ENDS HERE
            setIsPickingMedia?.(false); // Notify parent
        }
    };

    const removeMedia = (index: number) => {
        onMediaChanged(selectedMedia.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.imagesGrid}>
            {/* Existing selected media */}
            {selectedMedia.map((item, index) => (
                <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: item.uri }} style={styles.selectedImage} />

                    {/* Video Indicator */}
                    {item.type === 'video' && (
                        <View style={styles.videoIndicator}>
                            <TintIcon name="play" size={20} color={colors.text} />
                        </View>
                    )}

                    {/* Remove Button */}
                    <Pressable
                        style={styles.removeImageButton}
                        onPress={() => removeMedia(index)}
                        hitSlop={10}
                    >
                        <TintIcon name="cross-circle" size={22} color="white" />
                    </Pressable>
                </View>
            ))}

            {/* Add Media Button as a tile */}
            {selectedMedia.length < 5 && (
                <Pressable
                    style={styles.addImageTile}
                    onPress={pickMedia}
                    disabled={isPickingMedia}
                >
                    <View style={styles.tileContent}>
                        {isPickingMedia || isReceivingFile ? (
                            <LoadingSpinner color={colors.primary} />
                        ) : (
                            <TintIcon name="picture" size={32} color={colors.primary} />
                        )}
                    </View>
                </Pressable>
            )}
        </View>
    );
};

export default MediaPicker;

const styles = StyleSheet.create({
    addImageTile: {
        backgroundColor: colors.lightBunker,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: "dashed",
        width: "48%",
        aspectRatio: 1,
        borderRadius: borderRadius.small,
        overflow: "hidden",
        marginBottom: 15,
    },
    tileContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    imagesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
        width: "100%",
    },
    imageContainer: {
        width: "48%",
        aspectRatio: 1,
        borderRadius: borderRadius.small,
        overflow: "hidden",
        position: "relative",
        marginBottom: 15,
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
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
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
