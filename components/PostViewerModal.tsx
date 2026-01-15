import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import TintIcon from "@/components/Icon";
import { colors } from "@/theme/theme";
import Post from "@/components/Post";

interface Props {
  visible: boolean;
  post: any | null;
  onClose: () => void;
}

export default function PostViewerModal({ visible, post, onClose }: Props) {
  if (!post) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        {/* Close button */}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <TintIcon name="cross" size={20} color="white" />
        </Pressable>

        {/* Post */}
        <View style={styles.postContainer}>
          <Post
            userName={post.user?.name}
            userInitials={post.user?.name?.[0]}
            timeAgo={post.timeAgo}
            caption={post.caption}
            avatar={post.user?.avatar}
            mediaItems={post.media}
            likes={post.likes}
            postId={post.$id}
            currentUserId={post.currentUserId}
            isUser={post.isUser}
            isVerified={post.user?.isVerified}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.black,
    paddingTop: 50,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  postContainer: {
    flex: 1,
    alignItems: "center",
  },
});
