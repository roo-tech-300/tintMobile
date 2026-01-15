import { getMediaResource, pictureView } from "@/appwrite/apis/auth";
import TintIcon from '@/components/Icon';
import LoadingSpinner from "@/components/LoadingSpinner";

import { useAuth } from "@/context/AuthContext";
import { useGetPosts } from "@/hooks/usePosts";
import { colors, fonts } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = screenWidth / COLUMN_COUNT;

const PostThumbnail = ({ post, onPress }: { post: any; onPress: () => void }) => {
    const [uri, setUri] = useState<string | null>(null);
    const mediaId = typeof post.media?.[0] === 'string' ? post.media[0] : post.media?.[0]?.$id;

    useEffect(() => {
        if (!mediaId) return;
        let isMounted = true;
        getMediaResource(mediaId).then(res => {
            if (isMounted && res) setUri(res.uri);
        });
        return () => { isMounted = false; };
    }, [mediaId]);

    if (!uri) return <View style={[styles.postItem, { backgroundColor: colors.lightBunker }]} />;

    return (
        <Pressable style={styles.postItem} onPress={onPress}>
            <Image source={{ uri }} style={styles.postImage} resizeMode="cover" />
        </Pressable>
    );
};

const Profile = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { data: allPosts, isLoading: isPostsLoading } = useGetPosts();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Filter posts for current user
    const userPosts = useMemo(() => {
        if (!allPosts || !user) return [];
        return allPosts.filter((post: any) => {
            const postUserId = typeof post.user === 'string' ? post.user : post.user?.$id;
            return postUserId === user.$id;
        });
    }, [allPosts, user]);

    // Resolve Avatar URL
    useEffect(() => {
        const fetchAvatar = async () => {
            if (user?.avatar) {
                try {
                    const url = await pictureView(user.avatar);
                    setAvatarUrl(url ? url.toString() : null);
                } catch (e) {
                    console.error("Failed to fetch avatar", e);
                }
            }
        };
        fetchAvatar();
    }, [user?.avatar]);

    // Derived Stats
    const stats = {
        posts: userPosts.length,
        followers: user?.followers?.length || 0,
        following: user?.following?.length || 0
    };

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {/* Profile Image */}
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarPlaceholderText}>
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </Text>
                    </View>
                )}
            </View>

            {/* Name & Info */}
            <Text style={styles.name}>{user?.name || "User"}</Text>
            <Text style={styles.bio}>{user?.bio || "No bio yet."}</Text>
            <Text style={styles.bio}>{user?.department || "No department yet."}</Text>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                <Pressable
                    style={styles.actionButton}
                    onPress={() => { /* Navigate to Edit Profile */ }}
                >
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                </Pressable>
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
                            userId: user?.$id
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
                    <Text style={styles.navTitle}>{user?.name}</Text>
                </View>
                <Pressable style={styles.settingsButton}>
                    <TintIcon name="settings" size={24} color={colors.text} />
                </Pressable>
            </View>

            {isPostsLoading ? (
                <View style={styles.loadingContainer}>
                    <LoadingSpinner />
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
    department: {
        color: colors.darkText, // Or primary if you want it to pop
        fontSize: 14,
        fontFamily: fonts.regular,
        marginBottom: 20,
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
});
