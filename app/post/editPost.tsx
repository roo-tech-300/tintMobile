import { getMediaResource } from "@/appwrite/apis/auth";
import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import MediaPicker, { MediaItem } from "@/components/MediaPicker";
import TintAlert from "@/components/TintAlert";
import { useEditedPost } from "@/hooks/usePosts";
import { borderRadius, colors, fonts } from "@/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface mediaItem  {
    id?: string;
    uri: string;
    type: 'image' | 'video';
}

const EditPost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, caption: initialCaption, media: initialMedia } = params;
    const { mutate: editPost, isPending } = useEditedPost();

    const [isPickingMedia, setIsPickingMedia] = useState(false);
    const [caption, setCaption] = useState(initialCaption as string || "");
    const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
    const [media, setMedia] = useState<string[]>([]);

    const [alertState, setAlertState] = useState<{ visible: boolean; message: string; type: "error" | "success" | "info" }>({
        visible: false,
        message: "",
        type: "error",
    });

    useEffect(() => {
        const loadMedia = async () => {
            if (initialMedia) {
            try {
                const parsedMedia = JSON.parse(initialMedia as string);
                const mediaObject = await Promise.all(
                    parsedMedia.map(async (m : string) => {
                        const resource = await getMediaResource(m);
                        return resource
                    })
                )
                setSelectedMedia(mediaObject);
                setMedia(parsedMedia);
            } catch (e) {
                console.error("Failed to parse media", e);
            }
        }      
    }
    loadMedia();
    }, [initialMedia]);

    const showAlert = (message: string, type: "error" | "success" | "info" = "error") => {
        setAlertState({ visible: true, message, type });
    };

    const hideAlert = () => {
        setAlertState(prev => ({ ...prev, visible: false }));
    };

    const handleMediaChange = (updatedSelectedMedia: MediaItem[]) => {
    setSelectedMedia(updatedSelectedMedia);
     const updatedIds = updatedSelectedMedia
        .filter(item => item.id)    // only old ones
        .map(item => item.id!);

    setMedia(updatedIds);
};

    const handleSave = () => {
        if (!caption.trim() && selectedMedia.length === 0) {
            showAlert('Please add a caption or select at least one media item', 'error');
            return;
        }

        if (!id) {
            showAlert('Error: Post ID missing', 'error');
            return;
        }
        let finalIds = [...media]
        const newFiles = selectedMedia.filter(item => !item.id)

        if(newFiles.length > 0){
            finalIds.push(...newFiles.map(item => item.uri))
        }
        editPost({
            postId: id as string,
            data: {
                caption: caption,
                media: finalIds
            }
        }, {
            onSuccess: () => {
                router.back();
            },
            onError: (error: any) => {
                showAlert('Error updating post: ' + error.message, 'error');
            }
        })
        console.log("What i'm passing", caption, media)
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <TintAlert
                visible={alertState.visible}
                message={alertState.message}
                type={alertState.type}
                onClose={hideAlert}
            />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <TintIcon name="angle-small-left" size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Edit Post</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Caption Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Caption</Text>
                    <TextInput
                        style={styles.captionInput}
                        placeholder="Write your caption here..."
                        placeholderTextColor={colors.darkText}
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                        maxLength={1500}
                        textAlignVertical="top"
                    />
                    <Text style={styles.characterCount}>{caption.length}/1500</Text>
                </View>

                {/* Media Picker Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Media</Text>
                    <MediaPicker
                        selectedMedia={selectedMedia}
                        onMediaChanged={handleMediaChange}
                        onAlert={showAlert}
                        isPickingMedia={isPickingMedia}
                        setIsPickingMedia={setIsPickingMedia}
                    />
                </View>

                {/* Save Button */}
                <Pressable
                    style={[
                        styles.postButton,
                        (!caption.trim() && selectedMedia.length === 0) && styles.postButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={(!caption.trim() && selectedMedia.length === 0) || isPending}
                >
                    {
                        isPending ?
                            <Text style={styles.postButtonText}>
                                <LoadingSpinner color={colors.text} /> Saving...
                            </Text>
                            :
                            <>
                                <TintIcon name="check" size={20} color={colors.text} />
                                <Text style={styles.postButtonText}>Save Changes</Text>
                            </>
                    }
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditPost;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        fontFamily: fonts.bold,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        fontFamily: fonts.bold,
        marginBottom: 15,
    },
    captionInput: {
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        padding: 15,
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.regular,
        minHeight: 120,
        maxHeight: 200,
    },
    characterCount: {
        color: colors.darkText,
        fontSize: 12,
        textAlign: "right",
        marginTop: 8,
    },
    postButton: {
        backgroundColor: colors.primary,
        marginHorizontal: 20,
        marginBottom: 30,
        paddingVertical: 16,
        borderRadius: borderRadius.small,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    postButtonDisabled: {
        backgroundColor: colors.darkText,
        opacity: 0.5,
    },
    postButtonText: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
    },
});
