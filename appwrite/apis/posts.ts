import Constants from 'expo-constants';
import { ID } from "react-native-appwrite";
import { databases, storage } from "../appwrite";

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
        return posts.rows;
    } catch (error) {
        console.error("Error getting posts:", error);
        throw error;
    }
}