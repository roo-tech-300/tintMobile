import Constants from 'expo-constants';
import { ID } from 'react-native-appwrite';
import { databases, storage } from "../appwrite";


const extra = Constants.expoConfig?.extra as {
    databaseId: string;
    communitiesCollectionId: string;
    communityMembersCollectionId: string;
    mediaBucketId: string;
}



const { databaseId, communitiesCollectionId, communityMembersCollectionId, mediaBucketId } = extra;


export const createCommunity = async ({
    name,
    description,
    imageUri,
    creatorId
}: {
    name: string;
    description?: string;
    imageUri?: string;
    creatorId: string;
}) => {

    try {
        let coverImage = null;
        if (imageUri) {
            coverImage = await uploadCommunityImage(imageUri);
        }

        const community = await databases.createRow(
            databaseId,
            communitiesCollectionId,
            ID.unique(),
            {
                name,
                description: description || "",
                coverImage,
            }
        )

        await databases.createRow(
            databaseId,
            communityMembersCollectionId,
            ID.unique(),
            {
                community: community.$id,
                user: creatorId,
                role: 'admin'
            }
        )

    } catch (error) {
        console.error("Error creating community", error)
        throw error
    }
}


export const uploadCommunityImage = async (imageUri: string) => {
    try {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const fileExtension = imageUri.split('.').pop() || 'jpg';
        const fileName = `community_${Date.now()}.${fileExtension}`;

        const file = {
            name: fileName,
            type: blob.type || 'image/jpeg',
            size: blob.size,
            uri: imageUri
        };

        const uploadedFile = await storage.createFile(
            mediaBucketId,
            ID.unique(),
            file as any
        );

        return uploadedFile.$id;
    } catch (error) {
        console.error("Error uploading community image:", error);
        throw error;
    }
}