import { borderRadius, colors, fonts } from "@/theme/theme";
import React, { useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import CommentModal from "./CommentModal";
import TintIcon from "./Icon";

interface PostProps {
    userName: string;
    userInitials: string;
    timeAgo: string;
    caption: string;
    avatarColor?: string;
    showFollowButton?: boolean;
    images?: string[];
    isUser?: boolean;
    onDelete?: () => void;
}

const Post: React.FC<PostProps> = ({
    userName,
    userInitials,
    timeAgo,
    caption,
    avatarColor = colors.background,
    showFollowButton = false,
    images = [],
    isUser = false,
    onDelete,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const lastTap = useRef<number | null>(null);
    const maxLength = 120;
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth * 0.9; // 90% of screen width to match post width

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
        setCurrentImageIndex(index);
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
            setIsLiked(true);
            lastTap.current = null;
        } else {
            lastTap.current = now;
        }
    };

    return (
        <View style={styles.post}>
            <View style={styles.postHeader}>
                <View style={styles.postUser}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>{userInitials}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.timeAgo}>{timeAgo}</Text>
                    </View>
                </View>
                {!isFollowing && !isUser && (
                    <Pressable
                        style={styles.followButton}
                        onPress={() => setIsFollowing(true)}
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


            {/* Image Carousel */}
            {images.length > 0 && (
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {images.map((image, index) => (
                            <TouchableWithoutFeedback key={index} onPress={handleDoubleTap}>
                                <Image
                                    source={{ uri: image }}
                                    style={[styles.postImage, { width: imageWidth }]}
                                    resizeMode="cover"
                                />
                            </TouchableWithoutFeedback>
                        ))}
                    </ScrollView>

                    {/* Image Indicator Dots */}
                    {images.length > 1 && (
                        <View style={styles.imageIndicator}>
                            {images.map((_, index) => (
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
                    <Pressable style={styles.actionButton} onPress={() => setIsLiked(!isLiked)}>
                        <TintIcon name={isLiked ? "Heart-Filled" : "heart"} size={20} color={isLiked ? colors.text : colors.text} />
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
                                    <Pressable style={styles.menuOption} onPress={() => setShowMenu(false)}>
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
