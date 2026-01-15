import FeedItem from "@/components/FeedItem";
import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetPosts } from "@/hooks/usePosts";
import { colors } from "@/theme/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function PostPage() {
    const { postId, userId } = useLocalSearchParams<{ postId: string, userId?: string }>();
    const router = useRouter();
    const { data: allPosts, isLoading } = useGetPosts();

    const postsToRender = useMemo(() => {
        if (!allPosts) return [];

        let filteredPosts = allPosts;
        if (userId) {
            filteredPosts = allPosts.filter((p: any) => {
                const pUserId = typeof p.user === 'string' ? p.user : p.user?.$id;
                return pUserId === userId;
            });
        }

        const startIndex = filteredPosts.findIndex((p: any) => p.$id === postId);
        if (startIndex === -1) return [];

        return filteredPosts.slice(startIndex);
    }, [allPosts, userId, postId]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <TintIcon name="angle-small-left" size={30} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Posts</Text>
            </View>
            <FlatList
                data={postsToRender}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                    <View style={styles.postContainer}>
                        <FeedItem post={item} isVisible={true} />
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Post not found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text,
        marginLeft: 10,
    },
    backButton: {
        padding: 5,
    },
    listContent: {
        paddingBottom: 20,
    },
    postContainer: {
        marginBottom: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        color: colors.darkText,
        fontSize: 16,
    },
});
