import { getMediaResource, pictureView } from "@/appwrite/apis/auth";
import TintIcon from '@/components/Icon';
import LoadingSpinner from "@/components/LoadingSpinner";

import { getDbUser } from "@/appwrite/apis/auth";
import { useAuth } from "@/context/AuthContext";
import { useGetPosts } from "@/hooks/usePosts";
import { useToggleFollow } from "@/hooks/useUser";
import { colors, fonts } from '@/theme/theme';
import { getInitials } from "@/utils/stringUtils";
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImageWithShimmer, Shimmer } from '@/components/Shimmer';

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = screenWidth / COLUMN_COUNT;

const PostThumbnail = ({ post, onPress }: { post: any; onPress: () => void }) => {
    const [resource, setResource] = useState<{ uri: string; type: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Safely get the first media ID
    const firstMedia = post.media?.[0];
    const mediaId = typeof firstMedia === 'string' ? firstMedia : firstMedia?.$id;

    useEffect(() => {
        if (!mediaId) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        getMediaResource(mediaId).then(res => {
            if (isMounted) {
                if (res) setResource(res);
                setLoading(false);
            }
        }).catch(() => {
            if (isMounted) setLoading(false);
        });

        return () => { isMounted = false; };
    }, [mediaId]);

    return (
        <Pressable style={styles.postItem} onPress={onPress}>
            {loading ? (
                <Shimmer borderRadius={10} />
            ) : resource?.uri ? (
                <View style={{ flex: 1 }}>
                    <ImageWithShimmer
                        uri={resource.uri}
                        resizeMode="cover"
                        borderRadius={10}
                    />
                    {resource.type === 'video' && (
                        <View style={styles.videoBadge}>
                            <TintIcon name="play" size={12} color="white" />
                        </View>
                    )}
                </View>
            ) : (
                <View style={[styles.placeholderThumbnail, { borderRadius: 10 }]}>
                    <TintIcon name="picture" size={24} color={colors.darkText} />
                </View>
            )}
        </Pressable>
    );
};

const Profile = () => {
    const router = useRouter();
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { user: currentUser, logout } = useAuth();
    const { mutate: toggleFollow } = useToggleFollow();

    const { data: allPosts, isLoading: isPostsLoading } = useGetPosts();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const isOwnProfile = useMemo(() => {
        return !userId || userId === currentUser?.$id;
    }, [userId, currentUser?.$id]);

    const fetchUser = async () => {
        setError(null);
        if (isOwnProfile) {
            setProfileUser(currentUser);
            setIsLoadingUser(false);
        } else if (userId) {
            setIsLoadingUser(true);
            try {
                const fetchedUser = await getDbUser(userId);
                if (!fetchedUser) {
                    throw new Error("User not found");
                }
                setProfileUser(fetchedUser);
            } catch (err: any) {
                console.error("Error fetching user profile:", err);
                setError(err.message || "Failed to load profile");
            } finally {
                setIsLoadingUser(false);
            }
        }
    };

    // Fetch User Data
    useEffect(() => {
        fetchUser();
    }, [userId, currentUser, isOwnProfile]);

    // Filter posts for the displayed user
    const userPosts = useMemo(() => {
        if (!allPosts || !profileUser) return [];
        return allPosts.filter((post: any) => {
            const postUserId = typeof post.user === 'string' ? post.user : post.user?.$id;
            return postUserId === profileUser.$id;
        });
    }, [allPosts, profileUser]);

    // Resolve Avatar URL
    useEffect(() => {
        const fetchAvatar = async () => {
            if (profileUser?.avatar) {
                try {
                    const url = await pictureView(profileUser.avatar);
                    setAvatarUrl(url ? url.toString() : null);
                } catch (e) {
                    console.error("Failed to fetch avatar", e);
                }
            } else {
                setAvatarUrl(null);
            }
        };
        fetchAvatar();
    }, [profileUser?.avatar]);

    // Derived Stats
    const stats = {
        posts: userPosts.length,
        followers: profileUser?.followers?.length || 0,
        following: profileUser?.following?.length || 0
    };

    const isFollowing = useMemo(() => {
        if (!currentUser || !profileUser) return false;
        return profileUser.followers?.includes(currentUser.$id);
    }, [currentUser, profileUser]);

    const handleFollow = () => {
        if (!currentUser || !profileUser) return;

        const previousFollowers = [...(profileUser.followers || [])];
        const isCurrentlyFollowing = previousFollowers.includes(currentUser.$id);

        // Optimistic UI update
        const updatedFollowers = isCurrentlyFollowing
            ? previousFollowers.filter((id: string) => id !== currentUser.$id)
            : [...previousFollowers, currentUser.$id];

        setProfileUser({
            ...profileUser,
            followers: updatedFollowers
        });

        toggleFollow(
            {
                currentUserId: currentUser.$id,
                targetUserId: profileUser.$id
            },
            {
                onError: (error) => {
                    console.error("Follow failed, reverting", error);
                    setProfileUser({
                        ...profileUser,
                        followers: previousFollowers
                    });
                }
            }
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {/* Profile Image */}
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image
                        source={{ uri: avatarUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarPlaceholderText}>
                            {getInitials(profileUser?.name)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Name & Info */}
            <Text style={styles.name}>{profileUser?.name || "User"}</Text>
            {profileUser?.username && (
                <Text style={styles.username}>@{profileUser.username}</Text>
            )}
            <Text style={styles.bio}>{profileUser?.bio || "No bio yet."}</Text>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                {isOwnProfile ? (
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => router.push('/user/edit')}
                    >
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={[styles.actionButton, isFollowing && styles.followingButton]}
                        onPress={handleFollow}
                    >
                        <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.posts}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.followers}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{stats.following}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </View>
            </View>
        </View>
    );

    const renderPost = ({ item }: { item: any }) => {
        return (
            <PostThumbnail
                post={item}
                onPress={() => {
                    router.push({
                        pathname: '/post/post',
                        params: {
                            postId: item.$id,
                            userId: profileUser?.$id
                        }
                    });
                }}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <View style={styles.navLeft}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <TintIcon name="angle-small-left" size={30} color={colors.text} />
                    </Pressable>
                    <Text style={styles.navTitle}>{profileUser?.name || (error ? 'Error' : 'Profile')}</Text>
                </View>
                {isOwnProfile && (
                    <Pressable style={styles.settingsButton} onPress={() => router.push('/user/Settings')}>
                        <TintIcon name="settings" size={24} color={colors.text} />
                    </Pressable>
                )}
            </View>

            {isLoadingUser ? (
                <View style={styles.loadingContainer}>
                    <LoadingSpinner />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <TintIcon name="info" size={50} color={colors.error} />
                    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchUser}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={userPosts}
                    renderItem={renderPost}
                    keyExtractor={item => item.$id}
                    numColumns={COLUMN_COUNT}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts yet.</Text>
                        </View>
                    }
                />
            )}


        </SafeAreaView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    navLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backButton: {
        padding: 5,
        marginLeft: -5,
    },
    navTitle: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
    },
    settingsButton: {
        padding: 5,
    },
    listContent: {
        paddingBottom: 20,
    },
    headerContent: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    name: {
        color: colors.text,
        fontSize: 22,
        fontFamily: fonts.bold,
        marginBottom: 5,
    },
    bio: {
        color: colors.text,
        fontSize: 14,
        fontFamily: fonts.regular,
        textAlign: 'center',
        marginBottom: 5,
        lineHeight: 20,
    },
    username: {
        color: colors.darkText,
        fontSize: 16,
        fontFamily: fonts.regular,
        marginBottom: 10,
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 25,
        minWidth: 150,
        alignItems: 'center',
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.darkText,
    },
    actionButtonText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    followingButtonText: {
        color: colors.text,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
        marginBottom: 2,
    },
    statLabel: {
        color: colors.darkText,
        fontSize: 12,
        fontFamily: fonts.regular,
    },
    postItem: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderWidth: 1,
        borderColor: colors.black, // Grid gap effect
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    placeholderThumbnail: {
        flex: 1,
        backgroundColor: colors.lightBunker,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: colors.text,
        fontSize: 40,
        fontFamily: fonts.bold,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 25,
    },
    logoutButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.error,
        minWidth: 100,
        paddingHorizontal: 20,
    },
    logoutButtonText: {
        color: colors.error,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.darkText,
        fontFamily: fonts.regular,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorTitle: {
        color: colors.text,
        fontSize: 20,
        fontFamily: fonts.bold,
        marginTop: 20,
        marginBottom: 10,
    },
    errorText: {
        color: colors.darkText,
        fontSize: 16,
        fontFamily: fonts.regular,
        textAlign: 'center',
        marginBottom: 30,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    retryButtonText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
});
