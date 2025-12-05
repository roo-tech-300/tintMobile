import { borderRadius, colors, fonts } from "@/theme/theme";
import React, { useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import TintIcon from "./Icon";

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userInitials: string;
    avatarColor: string;
    text: string;
    timeAgo: string;
    isOwner: boolean;
}

interface CommentModalProps {
    visible: boolean;
    onClose: () => void;
    postUserName: string;
    currentUserId: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
    visible,
    onClose,
    postUserName,
    currentUserId,
}) => {
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "1",
            userId: "user1",
            userName: "Sarah Williams",
            userInitials: "SW",
            avatarColor: "#FF6B6B",
            text: "This is amazing! Love it 🔥",
            timeAgo: "2h ago",
            isOwner: false,
        },
        {
            id: "2",
            userId: currentUserId,
            userName: "You",
            userInitials: "EA",
            avatarColor: colors.primary,
            text: "Thanks for sharing!",
            timeAgo: "1h ago",
            isOwner: true,
        },
    ]);
    const [newComment, setNewComment] = useState("");
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                userId: currentUserId,
                userName: "You",
                userInitials: "EA",
                avatarColor: colors.primary,
                text: newComment,
                timeAgo: "Just now",
                isOwner: true,
            };
            setComments([...comments, comment]);
            setNewComment("");
        }
    };

    const handleLikeComment = (commentId: string) => {
        const newLiked = new Set(likedComments);
        if (newLiked.has(commentId)) {
            newLiked.delete(commentId);
        } else {
            newLiked.add(commentId);
        }
        setLikedComments(newLiked);
    };

    const handleDeleteComment = (commentId: string) => {
        setComments(comments.filter(c => c.id !== commentId));
        setShowDeleteMenu(null);
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <View style={[styles.commentAvatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.commentAvatarText}>{item.userInitials}</Text>
            </View>
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{item.userName}</Text>
                    <Text style={styles.commentTime}>{item.timeAgo}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
                <View style={styles.commentActions}>
                    <Pressable
                        style={styles.commentActionButton}
                        onPress={() => handleLikeComment(item.id)}
                    >
                        <TintIcon
                            name={likedComments.has(item.id) ? "Heart-Filled" : "heart"}
                            size={16}
                            color={likedComments.has(item.id) ? colors.primary : colors.darkText}
                        />
                        <Text style={styles.commentActionText}>Like</Text>
                    </Pressable>
                </View>
            </View>
            {item.isOwner && (
                <Pressable
                    style={styles.commentMenuButton}
                    onPress={() => setShowDeleteMenu(showDeleteMenu === item.id ? null : item.id)}
                >
                    <TintIcon name="menu-dots" size={16} color={colors.darkText} />
                </Pressable>
            )}

            {/* Delete Menu */}
            {showDeleteMenu === item.id && (
                <View style={styles.deleteMenu}>
                    <Pressable
                        style={styles.deleteOption}
                        onPress={() => handleDeleteComment(item.id)}
                    >
                        <TintIcon name="trash" size={16} color={colors.error} />
                        <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Comments</Text>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <TintIcon name="cross" size={24} color={colors.text} />
                    </Pressable>
                </View>

                {/* Comments List */}
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id}
                    style={styles.commentsList}
                    contentContainerStyle={styles.commentsListContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No comments yet</Text>
                            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                        </View>
                    }
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.commentAvatarText}>EA</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a comment..."
                        placeholderTextColor={colors.darkText}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                        onPress={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        <TintIcon
                            name="paper-plane"
                            size={20}
                            color={newComment.trim() ? colors.primary : colors.darkText}
                        />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CommentModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    headerTitle: {
        color: colors.text,
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    closeButton: {
        padding: 5,
    },
    commentsList: {
        flex: 1,
    },
    commentsListContent: {
        padding: 20,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
        marginBottom: 8,
    },
    emptySubtext: {
        color: colors.darkText,
        fontSize: 14,
    },
    commentItem: {
        flexDirection: "row",
        marginBottom: 20,
        position: "relative",
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    commentAvatarText: {
        color: colors.text,
        fontSize: 14,
        fontFamily: fonts.bold,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
    },
    commentUserName: {
        color: colors.text,
        fontSize: 14,
        fontFamily: fonts.bold,
    },
    commentTime: {
        color: colors.darkText,
        fontSize: 12,
    },
    commentText: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    commentActions: {
        flexDirection: "row",
        gap: 15,
    },
    commentActionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    commentActionText: {
        color: colors.darkText,
        fontSize: 12,
    },
    commentMenuButton: {
        padding: 5,
    },
    deleteMenu: {
        position: "absolute",
        right: 30,
        top: 0,
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        padding: 8,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    deleteOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    deleteText: {
        color: colors.error,
        fontSize: 14,
        fontFamily: fonts.regular,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: colors.lightBunker,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        padding: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
