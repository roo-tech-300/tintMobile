import Constants from 'expo-constants';
import { ID } from "react-native-appwrite";
import { databases, storage } from "../appwrite";
import { getDbUser } from './auth';

const extra = Constants.expoConfig?.extra as {
    databaseId: string;
    postsCollectionId: string;
    mediaBucketId: string;
};

const { databaseId, postsCollectionId, mediaBucketId } = extra;

export async function uploadFile(fileUri: string) {
    try {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        const fileExtension = fileUri.split('.').pop() || 'jpg';
        const fileName = `media_${Date.now()}.${fileExtension}`;

        const file = {
            name: fileName,
            type: blob.type || 'image/jpeg',
            size: blob.size,
            uri: fileUri
        };

        const uploadedFile = await storage.createFile(
            mediaBucketId,
            ID.unique(),
            file as any
        );

        return uploadedFile.$id;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

export async function createPost(
    user: string,
    caption: string,
    media: string[]
) {
    try {
        // Upload all media files first
        const mediaIds = await Promise.all(
            media.map(async (uri) => {
                return await uploadFile(uri);
            })
        );


        // Create the post document
        console.log("Creating post...", { databaseId, postsCollectionId, user, caption, mediaIds });

        // Create the post document
        const uniqueId = ID.unique();
        console.log("Generated ID:", uniqueId);

        const post = await databases.createRow(
            databaseId,
            postsCollectionId,
            uniqueId,
            {
                user: user,
                caption: caption,
                media: mediaIds,
            }
        );

        return post;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
}

export async function getPosts() {
    try {
        const posts = await databases.listRows(databaseId, postsCollectionId);

        const postsWithUsers = await Promise.all(posts.rows.map(async (post) => {
            const user = await getDbUser(post.user);
            return {
                ...post,
                user: user
            };
        }));

        return postsWithUsers;
    } catch (error) {
        console.error("Error getting posts:", error);
        throw error;
    }
}

export async function editPost(postId: string, data: any) {
    try {
        const editedPost = await databases.updateRow(
            databaseId,
            postsCollectionId,
            postId,
            data
        );
        return editedPost;
    } catch (error) {
        console.error("Error editing post:", error);
        throw error;
    }
}

export async function getPost(postId: string) {
    try {
        const post = await databases.getRow(
            databaseId,
            postsCollectionId,
            postId
        );
        return post;
    } catch (error) {
        console.error("Error getting post:", error);
        throw error;
    }
}

export async function deletePost(postId: string) {
    try {

        const post = await getPost(postId);
        if (post.media && Array.isArray(post.media)) {
            await Promise.all(
                post.media.map(async (mediaId: string) => {
                    try {
                        await storage.deleteFile(mediaBucketId, mediaId);
                    } catch (e) {
                        console.error("Error deleting media file:", mediaId, e);
                    }
                })
            );
        }
        const deletedPost = await databases.deleteRow(
            databaseId,
            postsCollectionId,
            postId
        );
        return deletedPost;
    } catch (error) {
        console.error("Error deleting post:", error);
        throw error;
    }
}