import TintIcon from "@/components/Icon";
import { borderRadius, colors, fonts } from "@/theme/theme";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddPost = () => {
  const [caption, setCaption] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' }[]>([]);

  const pickMedia = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Check if limit reached
    if (selectedMedia.length >= 5) {
      alert('You can only select up to 5 media items');
      return;
    }

    // Launch picker
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
      setSelectedMedia([...selectedMedia, ...newMedia]);
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(selectedMedia.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!caption.trim() && selectedMedia.length === 0) {
      alert('Please add a caption or select at least one media item');
      return;
    }

    // Handle post creation here
    console.log('Caption:', caption);
    console.log('Media:', selectedMedia);

    // Reset form
    setCaption("");
    setSelectedMedia([]);
    alert('Post created successfully!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{caption.length}/500</Text>
        </View>

        {/* Media Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Media</Text>

          {/* Add Media Button */}
          <Pressable style={styles.addImageButton} onPress={pickMedia}>
            <TintIcon name="picture" size={32} color={colors.primary} />
            <Text style={styles.addImageText}>Select Photos or Videos</Text>
            <Text style={styles.addImageSubtext}>
              {selectedMedia.length > 0
                ? `${selectedMedia.length}/5 selected`
                : 'Max 5 photos or videos'}
            </Text>
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

        {/* Post Button */}
        <Pressable
          style={[
            styles.postButton,
            (!caption.trim() && selectedMedia.length === 0) && styles.postButtonDisabled
          ]}
          onPress={handlePost}
          disabled={!caption.trim() && selectedMedia.length === 0}
        >
          <TintIcon name="paper-plane" size={20} color={colors.text} />
          <Text style={styles.postButtonText}>Post</Text>
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
