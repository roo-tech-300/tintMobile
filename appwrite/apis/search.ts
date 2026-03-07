import Constants from 'expo-constants';
import { ID, Query } from "react-native-appwrite";
import { databases } from "../appwrite";
import { getDbUser } from './auth';

const extra = Constants.expoConfig?.extra as {
    databaseId: string;
    usersCollectionId: string;
    postsCollectionId: string;
    recentSearchCollectionId: string;
};

const { databaseId, usersCollectionId, postsCollectionId, recentSearchCollectionId } = extra;

export async function searchUsers(query: string) {
    try {
        if (!query.trim()) return [];
        const users = await databases.listRows(
            databaseId,
            usersCollectionId,
            [
                Query.or([
                    Query.contains("name", query),
                    Query.contains("username", query)
                ]),
                Query.limit(10)
            ]
        );
        return users?.rows || [];
    } catch (error) {
        console.error("Error searching users:", error);
        return [];
    }
}

export async function searchPosts(query: string) {
    try {
        if (!query.trim()) return [];
        const posts = await databases.listRows(
            databaseId,
            postsCollectionId,
            [
                Query.contains("caption", query),
                Query.limit(10)
            ]
        );

        if (!posts || !posts.rows) return [];

        const postsWithUsers = await Promise.all(posts.rows.map(async (post) => {
            const user = await getDbUser(post.user);
            return {
                ...post,
                user: user
            };
        }));

        return postsWithUsers;
    } catch (error) {
        console.error("Error searching posts:", error);
        return [];
    }
}

export async function saveRecentSearch(userId: string, searchValue: string) {
    if (!searchValue.trim()) return null;

        const existing = await databases.listRows(
            databaseId,
            recentSearchCollectionId,
            [
                Query.equal("user", userId),
                Query.equal("searchValue", searchValue)
            ]
        );
    try {
        if (existing && existing.total > 0) {
            return existing.rows[0];
        }

        const recentSearch = await databases.createRow(
            databaseId,
            recentSearchCollectionId,
            ID.unique(),
            {
                user: userId,
                searchValue: searchValue
            }
        );

        return recentSearch;
    } catch (error) {
        console.error("Error saving recent search:", error);
        throw error;
    }
}

export async function getRecentSearches(userId: string) {
    try {
        if (!userId) return [];
        const searches = await databases.listRows(
            databaseId,
            recentSearchCollectionId,
            [
                Query.orderDesc("$createdAt"),
                Query.limit(20)
            ]
        );
        console.log("Recent searches:", searches?.rows);
        return searches?.rows || [];
    } catch (error) {
        console.error("Error getting recent searches:", error);
        return [];
    }
}

export async function deleteRecentSearch(searchId: string) {
    try {
        await databases.deleteRow(
            databaseId,
            recentSearchCollectionId,
            searchId
        );
        return true;
    } catch (error) {
        console.error("Error deleting recent search:", error);
        return false;
    }
}

export async function clearRecentSearches(userId: string) {
    try {
        const searches = await getRecentSearches(userId);
        if (searches && searches.length > 0) {
            await Promise.all(searches.map(s => deleteRecentSearch(s.$id)));
        }
        return true;
    } catch (error) {
        console.error("Error clearing recent searches:", error);
        return false;
    }
}
