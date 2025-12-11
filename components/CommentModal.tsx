import { borderRadius, colors, fonts } from "@/theme/theme";
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import TintIcon from "./Icon";
import React, { useEffect, useState } from "react";
import { useCreatePostComment, useDeleteComment, useGetPostComments, useLikeComment } from "@/hooks/usePosts";
import { getMediaResource } from "@/appwrite/apis/auth";
import { timeAgo } from "@/utils/dateUtils";
import { getInitials } from "@/utils/stringUtils";
import { useAuth } from "@/context/AuthContext";
import { isLikedComment } from "@/appwrite/apis/posts";
import LoadingSpinner from "./LoadingSpinner";

interface CommentModalProps {
    visible: boolean;
    onClose: () => void;
    postUserName: string;
    currentUserId: string;
    postId: string;
}

export const CommentModal = ({visible, onClose, postUserName, currentUserId, postId}: CommentModalProps) => {
    const {user} = useAuth();
    const {data:comments, isLoading: isGettingPost} = useGetPostComments(postId);
    const {mutateAsync: likeComment, isPending: isLikingComment} = useLikeComment();
    const {mutateAsync: createComment, isPending: isCreatingComment} = useCreatePostComment();
    const {mutateAsync: deleteComment, isPending: isDeletingComment} = useDeleteComment();
    const [mappedComments, setMappedComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);


    if(!user) return null;
      React.useEffect(() => {
        const fetchAvatar = async () => {
          if (user?.avatar) {
            const url = await getMediaResource(user.avatar);
            setAvatarUrl(url?.uri ?? null);
            console.log("Avatar URL:", url?.uri);
          }
        };
        fetchAvatar();
      }, [user?.avatar]);

        useEffect(() => {
        const loadComments = async () => {
            if (!comments) return;

            const updated = await Promise.all(
                comments.map(async (c) => {
                    let avatar = null;

                    if (c.user?.avatar) {
                        const media = await getMediaResource(c.user.avatar);
                        avatar = media?.uri ?? null;
                    }

                    const liked = await isLikedComment(c.$id, user.$id);

                    return {
                        id: c.$id,
                        user: {
                            ...c.user,
                            avatar,
                        },
                        content: c.content,
                        createdAt: c.$createdAt,
                        isLiked: liked,
                    };
                })
            );

            setMappedComments(updated);
        };

        loadComments();
    }, [comments]);

    const handleLikeComment = async(commentId: string, userId:string) => {
        
        setMappedComments((prev) => 
            prev.map((c) => 
                c.id === commentId ? {...c, isLiked: !c.isLiked} : c)
        );

        try {
            await likeComment({commentId, userId});
        } catch (error) {
            console.log("Failed to like comment", error);

            setMappedComments((prev) => 
                prev.map((c) => 
                    c.id === commentId ? {...c, isLiked: !c.isLiked} : c)
            );
        }
    }

        const handleAddComment = () => {
            if (!newComment.trim()) return;
            try {
                createComment({postId, userId: user.$id, content: newComment});
                setNewComment("");
            } catch (error) {
                console.error("Error creating comment", error)
            }
        }

    const handleDeleteComment = async(commentId: string) => {
        try {
            await deleteComment({commentId});
        } catch (error) {
            console.error("Error deleting comment", error)
        }
    }

    const renderComment = ({ item }: {item: any}) => (
        <View style={styles.commentItem}>
            <View style={styles.commentAvatar}>
                {item.user.avatar ?
                    <Image
                        source={{uri: item.user.avatar}}
                        style = {{ width: 36, height: 36, borderRadius: 18 }}
                    />
                    :
                    <Text style={styles.commentAvatarText}>{getInitials(item.user.name)}</Text>
                }
            </View>
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{item.user.name}</Text>
                    <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.commentText}>{item.content}</Text>
                <View style={styles.commentActions}>
                    <Pressable
                        style={styles.commentActionButton}
                        onPress={() => handleLikeComment(item.id, user.$id)}
                    >
                        <TintIcon
                            name={item.isLiked ? "Heart-Filled" : "heart"}
                            size={16}
                            color={item.isLiked ? colors.primary : colors.darkText}
                        />
                        <Text style={styles.commentActionText}>Like</Text>
                    </Pressable>
                </View>
            </View>
            {item.user.$id === user.$id && (
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
                        {isDeletingComment ? <LoadingSpinner color={colors.text}/> :
                            (
                                <>
                                    <TintIcon name="trash" size={16} color={colors.error} />
                                    <Text style={styles.deleteText}>Delete</Text>
                                </>   
                            )
                        }
                        
                    </Pressable>
                </View>
            )}
        </View>
    );


    return (
        <Modal 
            visible={visible}
            animationType = "slide"
            transparent = {false}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Comments</Text>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <TintIcon name="cross" size={24} color={colors.text} />
                    </Pressable>
                </View>

                {/* Comment list */}
                <FlatList
                    data={mappedComments}
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

                {/* Comment Input */}
                <View style={styles.inputContainer}>
                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 36, height: 36, borderRadius: 18 }}
                            />
                        ) : (
                            <Text style={styles.commentAvatarText}>{getInitials(user?.name)}</Text>
                        )}
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
                    {isCreatingComment ? (
                        <LoadingSpinner
                            color={colors.text}
                        />
                    ) : (
                        <TintIcon
                            name="paper-plane"
                            size={20}
                            color={colors.primary}
                        />
                    )      
                    }
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

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
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
        gap: 10,
        bottom: 0,
        position: "absolute",
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
    commentAvatar: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        borderRadius: borderRadius.round,
        backgroundColor: colors.primary,
    },
    commentAvatarText: {
        color: "black",
        fontSize: 14,
        fontFamily: fonts.bold,
    },
    commentItem: {
        flexDirection: "row",
        marginBottom: 20,
        position: "relative",
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

})