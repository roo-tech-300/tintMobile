import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import MediaPicker, { MediaItem } from "@/components/MediaPicker";
import TintAlert from "@/components/TintAlert";
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/usePosts";
import { borderRadius, colors, fonts } from "@/theme/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddPost = () => {
  const { user } = useAuth();
  const { mutate: createPost, isPending } = useCreatePost();
  const router = useRouter();

  const [isPickingMedia, setIsPickingMedia] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [alertState, setAlertState] = useState<{ visible: boolean; message: string; type: "error" | "success" | "info" }>({
    visible: false,
    message: "",
    type: "error",
  });

  const showAlert = (message: string, type: "error" | "success" | "info" = "error") => {
    setAlertState({ visible: true, message, type });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };



  const handlePost = () => {
    if (!caption.trim() && selectedMedia.length === 0) {
      showAlert('Please add a caption or select at least one media item', 'error');
      return;
    }

    if (!user?.$id) {
      showAlert('You must be logged in to create a post', 'error');
      return;
    }

    createPost({
      user: user.$id,
      caption: caption,
      media: selectedMedia.map(m => m.uri)
    }, {
      onSuccess: () => {
        setCaption("");
        setSelectedMedia([]);
        router.push("/(tabs)/home");
      },
      onError: (error) => {
        showAlert('Error creating post: ' + error.message, 'error');
      }
    })
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TintAlert
        visible={alertState.visible}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Text style={styles.headerSubtitle}>Share your thoughts with the community</Text>
        </View>

        {/* Caption Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>
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
          <Text style={styles.characterCount}>{caption.length}/500</Text>
        </View>

        {/* Media Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Media</Text>
          <MediaPicker
            selectedMedia={selectedMedia}
            onMediaChanged={setSelectedMedia}
            onAlert={showAlert}
            isPickingMedia={isPickingMedia}
            setIsPickingMedia={setIsPickingMedia}
          />
        </View>

        {/* Post Button */}
        <Pressable
          style={[
            styles.postButton,
            ((!caption.trim() && selectedMedia.length === 0) || isPickingMedia) && styles.postButtonDisabled
          ]}
          onPress={handlePost}
          disabled={(!caption.trim() && selectedMedia.length === 0) || isPending || isPickingMedia}
        >
          {
            isPending ?
              <Text style={styles.postButtonText}>{isPending ? <LoadingSpinner color={colors.text} /> : "Post"}</Text>
              : <TintIcon name="paper-plane" size={20} color={colors.text} />
          }
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.bold,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.darkText,
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
