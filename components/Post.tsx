import { borderRadius, colors, fonts } from "@/theme/theme";
import { ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import TintIcon from "./Icon";
import ConfirmModal from "./ConfirmModal";
import { CommentModal } from "./CommentModal";

interface MediaItem {
    uri: string;
    type: string; // 'image' | 'video'
}

interface PostProps {
    userName: string;
    userInitials: string;
    timeAgo: string;
    caption: string;
    avatar?: string | null;
    avatarColor?: string;
    showFollowButton?: boolean;
    images?: string[]; // Deprecated in favor of mediaItems
    mediaItems?: MediaItem[];
    isUser?: boolean;
    isVisible?: boolean;
    likes?: string[];
    currentUserId?: string;
    onLike?: () => void;
    onDelete?: () => void;
    isFollowing?: boolean;
    onFollow?: () => void;
    onEdit?: () => void;
    postId?: string;
}

const Post: React.FC<PostProps> = ({
    userName,
    userInitials,
    timeAgo,
    caption,
    avatar,
    avatarColor = colors.background,
    showFollowButton = false,
    images = [],
    mediaItems = [],
    isUser = false,
    isVisible = true,
    likes = [],
    currentUserId,
    onLike,
    onDelete,
    isFollowing = false,
    onFollow,
    onEdit,
    postId,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);


    const isLiked = likes.includes(currentUserId || "");

    // Tap handling
    const lastTap = useRef<number | null>(null);
    const singleTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const maxLength = 120;
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth * 0.9;

    // Reset playing state when index changes (auto-play next slide)
    // or when visibility changes.
    React.useEffect(() => {
        // console.log(`Post ${userName}: isVisible=${isVisible} index=${currentImageIndex}`);
        if (isVisible) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    }, [currentImageIndex, isVisible]);

    // Combine legacy images with mediaItems, treating legacy images as type 'image'
    const displayMedia: MediaItem[] = [
        ...mediaItems,
        ...images.map(uri => ({ uri, type: 'image' }))
    ];

    const renderCaption = () => {
        if (!isExpanded && caption.length > maxLength) {
            return (
                <>
                    {caption.substring(0, maxLength)}...{' '}
                    <Pressable onPress={() => setIsExpanded(true)}>
                        <Text style={styles.readMore}>Read more</Text>
                    </Pressable>
                </>
            );
        }

        return (
            <>
                {caption}
                {isExpanded && caption.length > maxLength && (
                    <>
                        {' '}
                        <Pressable onPress={() => setIsExpanded(false)}>
                            <Text style={styles.readMore}>Show less</Text>
                        </Pressable>
                    </>
                )}
            </>
        );
    };

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / imageWidth);
        if (index !== currentImageIndex) {
            setCurrentImageIndex(index);
        }
    };

    const handlePress = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
            // Double tap detected
            if (singleTapTimeout.current) {
                clearTimeout(singleTapTimeout.current);
                singleTapTimeout.current = null;
            }
            if (!isLiked) {
                onLike?.();
            }
            lastTap.current = null;
        } else {
            // Single tap detected
            lastTap.current = now;
            singleTapTimeout.current = setTimeout(() => {
                // Execute single tap action (toggle play/pause for video)
                // Only relevant if current media is video
                const currentMedia = displayMedia[currentImageIndex];
                if (currentMedia && currentMedia.type === 'video') {
                    setIsPlaying(prev => !prev);
                }
                lastTap.current = null;
            }, DOUBLE_TAP_DELAY);
        }
    };

    return (
        <View style={styles.post}>
            <View style={styles.postHeader}>
                <View style={styles.postUser}>
                    <View style={[styles.avatar, { backgroundColor: avatar ? 'transparent' : avatarColor, overflow: 'hidden' }]}>
                        {avatar ? (
                            <Image
                                source={{ uri: avatar }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.avatarText}>{userInitials}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.timeAgo}>{timeAgo}</Text>
                    </View>
                </View>
                {!isFollowing && !isUser && (
                    <Pressable
                        style={styles.followButton}
                        onPress={onFollow}
                    >
                        <Text style={styles.followButtonText}>
                            Follow
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Caption - Now before images */}
            <View style={styles.captionContainer}>
                <Text style={styles.caption}>
                    {renderCaption()}
                </Text>
            </View>


            {/* Image/Video Carousel */}
            {displayMedia.length > 0 && (
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {displayMedia.map((item, index) => (
                            <TouchableWithoutFeedback key={index} onPress={handlePress}>
                                <View style={{ width: imageWidth, height: 300 }}>
                                    {item.type === 'video' ? (
                                        <Video
                                            style={[styles.postImage, { width: imageWidth }]}
                                            source={{ uri: item.uri }}
                                            resizeMode={ResizeMode.CONTAIN}
                                            isLooping
                                            shouldPlay={isVisible && index === currentImageIndex && isPlaying}
                                        />
                                    ) : (
                                        <Image
                                            source={{ uri: item.uri }}
                                            style={[styles.postImage, { width: imageWidth }]}
                                            resizeMode="cover"
                                        />
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        ))}
                    </ScrollView>

                    {/* Indicator Dots */}
                    {displayMedia.length > 1 && (
                        <View style={styles.imageIndicator}>
                            {displayMedia.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        index === currentImageIndex && styles.activeDot
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <View style={styles.leftActions}>
                    <Pressable style={styles.actionButton} onPress={onLike}>
                        <TintIcon name={isLiked ? "Heart-Filled" : "heart"} size={20} color={isLiked ? colors.primary : colors.text} />
                        <Text style={styles.actionText}>Like</Text>
                    </Pressable>
                    <Pressable style={styles.actionButton} onPress={() => setShowComments(true)}>
                        <TintIcon name="comment-dots" size={20} color={colors.text} />
                        <Text style={styles.actionText}>Comment</Text>
                    </Pressable>
                </View>
                <Pressable style={styles.menuButton} onPress={() => setShowMenu(true)}>
                    <TintIcon name="menu-dots" size={20} color={colors.text} />
                </Pressable>
            </View>

            {/* Options Menu Modal */}
            <Modal
                visible={showMenu}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menuModal}>
                                <Text style={styles.menuTitle}>Post Options</Text>
                                <Pressable style={styles.menuOption} onPress={() => {
                                    setShowMenu(false);
                                    onEdit?.();
                                }}>
                                    <TintIcon name="edit-1" size={20} color={colors.text} />
                                    <Text style={styles.menuOptionText}>Edit</Text>
                                </Pressable>
                                <Pressable style={styles.menuOption} onPress={() => setShowMenu(false)}>
                                    <TintIcon name="share" size={20} color={colors.text} />
                                    <Text style={styles.menuOptionText}>Share</Text>
                                </Pressable>

                                <Pressable style={styles.menuOption} onPress={() => setShowMenu(false)}>
                                    <TintIcon name="bookmark" size={20} color={colors.text} />
                                    <Text style={styles.menuOptionText}>Save Post</Text>
                                </Pressable>

                                {isUser && (
                                    <Pressable style={styles.menuOption} onPress={() => {
                                        setShowMenu(false);
                                        onDelete?.();
                                    }}>
                                        <TintIcon name="trash" size={20} color={colors.error} />
                                        <Text style={[styles.menuOptionText, { color: colors.error }]}>Delete Post</Text>
                                    </Pressable>
                                )}

                                {isFollowing && (
                                    <Pressable style={styles.menuOption} onPress={() => {
                                        setShowMenu(false);
                                        onFollow?.();
                                    }}>
                                        <TintIcon name="user-forbidden-alt" size={20} color={colors.error} />
                                        <Text style={[styles.menuOptionText, { color: colors.error }]}>Unfollow {userName}</Text>
                                    </Pressable>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Comment Modal */}
            <CommentModal
                visible={showComments}
                onClose={() => setShowComments(false)}
                postUserName={userName}
                currentUserId="current-user-id"
                postId={postId!}
            />
            <ConfirmModal
                visible={showConfirmDelete}
                message="Are you sure you want to delete this post?"
                onCancel={() => setShowConfirmDelete(false)}
                onConfirm={() => {
                    setShowConfirmDelete(false);
                    onDelete?.();
                }}
            />
        </View>
    );
};

export default Post;

const styles = StyleSheet.create({
    post: {
        width: "90%",
        marginHorizontal: "auto",
        padding: 15,
        borderRadius: borderRadius.small,
        marginBottom: 15,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    postUser: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    userName: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    timeAgo: {
        color: colors.darkText,
        fontSize: 14,
    },
    followButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    followingButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.primary,
    },
    followButtonText: {
        color: colors.text,
        fontSize: 14,
        fontFamily: fonts.bold,
    },
    followingButtonText: {
        color: colors.primary,
    },
    imageContainer: {
        marginTop: 15,
        marginHorizontal: -15, // Extend to edges of post
        position: "relative",
    },
    postImage: {
        height: 300,
    },
    imageIndicator: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    activeDot: {
        backgroundColor: colors.primary,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    captionContainer: {
        marginTop: 10,
    },
    caption: {
        color: colors.text,
        fontSize: 14,
    },
    readMore: {
        color: colors.darkText,
        fontSize: 12,
        fontFamily: fonts.bold,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    leftActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    actionIcon: {
        fontSize: 18,
    },
    actionText: {
        color: colors.text,
        fontSize: 14,
        fontFamily: fonts.regular,
    },
    menuButton: {
        padding: 5,
    },
    menuIcon: {
        fontSize: 24,
        color: colors.text,
        transform: [{ rotate: '90deg' }],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    menuModal: {
        backgroundColor: colors.lightBunker,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    menuTitle: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
        marginBottom: 20,
        textAlign: "center",
    },
    menuOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    menuOptionText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.regular,
    },
    cancelButton: {
        marginTop: 15,
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: borderRadius.small,
        alignItems: "center",
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
});
