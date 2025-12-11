import Constants from 'expo-constants';
import { ID } from "react-native-appwrite";
import { account, databases, storage } from "../appwrite";

const extra = Constants.expoConfig?.extra as {
    databaseId: string;
    usersCollectionId: string;
    mediaBucketId: string;
};

const { databaseId, usersCollectionId, mediaBucketId } = extra;

export async function registerUser(
    email: string,
    password: string,
    name: string
) {
    try {
        const user = await account.create(
            ID.unique(),
            email,
            password,
            name
        );

        const dbUser = await databases.createRow(
            databaseId,
            usersCollectionId,
            user.$id,
            {
                name: name,
                email: email,
                password: password
            }
        );

        const session = loginUser(email, password);

        return session;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

export async function loginUser(
    email: string,
    password: string
) {
    try {
        const session = await account.createEmailPasswordSession(
            email,
            password
        );
        return session
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}

export async function logoutUser() {
    return await account.deleteSession('current');
}

export async function getCurrentUser() {
    try {
        return await account.get();
    } catch {
        return null;
    }
}

export async function getDbUser(id: string) {
    try {
        const user = await databases.getRow(
            databaseId,
            usersCollectionId,
            id
        )
        return user;
    } catch (error) {
        console.error("Error getting user", error)
        return null;
    }
}

export async function updateDbUser(
    userId: string,
    data: any
) {
    try {
        const user = await databases.updateRow(
            databaseId,
            usersCollectionId,
            userId,
            data
        )
        return user;
    } catch (error) {
        console.error("Error updating user", error)
        throw error;
    }
}

export async function uploadAvatar(fileUri: string): Promise<string> {
    try {
        // Fetch the file from the local URI
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Extract file extension from URI
        const fileExtension = fileUri.split('.').pop() || 'jpg';
        const fileName = `avatar_${Date.now()}.${fileExtension}`;

        // For React Native, we need to create a file object compatible with Appwrite
        const file = {
            name: fileName,
            type: blob.type || 'image/jpeg',
            size: blob.size,
            uri: fileUri
        };

        // Upload to Appwrite storage
        const uploadedFile = await storage.createFile(
            mediaBucketId,
            ID.unique(),
            file as any
        );



        return uploadedFile.$id;
    } catch (error) {
        console.error("Error uploading avatar:", error);
        throw error;
    }
}

export async function sendPasswordReset(email: string) {
    try {
        await account.createRecovery(
            email,
            'https://tintcomplete.com'
        );

        return {
            success: true,
            message: 'Password reset link sent'
        }
    } catch (error) {
        console.error("Error sending password reset", error)
        return {
            success: false,
            message: 'Error sending password reset'
        }
    }
}

export async function getMediaResource(fileId: string) {
    try {
        const fileMeta = await storage.getFile(mediaBucketId, fileId);
        const url = await storage.getFileViewURL(mediaBucketId, fileId);
        console.log("Media resources", url.toString())
        return {
            id: fileId,
            uri: url.toString(),
            type: fileMeta.mimeType.startsWith('video/') ? 'video' : 'image',
        };
    } catch (error) {
        console.error("Error getting media resource", error);
        return null;
    }
}

export async function pictureView(storageId: string) {
    try {
        const file = await storage.getFileViewURL(mediaBucketId, storageId);
        return file;
    } catch (error) {
        console.error("Error getting file", error)
        return null;
    }
}