import Constants from 'expo-constants';
import { ID, Query } from 'react-native-appwrite';
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
                user: creatorId, // Add user here too
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

export const getCommunities = async () => {
    try {
        const communities = await databases.listRows(databaseId, communitiesCollectionId);
        return communities.rows;
    } catch (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
}

export const getUserCommunities = async (userId: string) => {
    try {
        const memberships = await databases.listRows(
            databaseId,
            communityMembersCollectionId,
            [Query.equal("user", userId)]
        );

        if (memberships.total === 0) return [];

        const communityIds = memberships.rows.map(m => m.community);

        // Fetch community details for each membership
        const communities = await Promise.all(
            communityIds.map(async (id) => {
                try {
                    return await databases.getRow(databaseId, communitiesCollectionId, id);
                } catch (e) {
                    return null;
                }
            })
        );

        return communities.filter(c => c !== null);
    } catch (error) {
        console.error("Error fetching user communities:", error);
        throw error;
    }
}

export const joinCommunity = async (communityId: string, userId: string) => {
    try {
        // Check if already a member
        const existing = await databases.listRows(
            databaseId,
            communityMembersCollectionId,
            [
                Query.equal("community", communityId),
                Query.equal("user", userId)
            ]
        );

        if (existing.total > 0) return existing.rows[0];

        return await databases.createRow(
            databaseId,
            communityMembersCollectionId,
            ID.unique(),
            {
                community: communityId,
                user: userId,
                role: 'member'
            }
        );
    } catch (error) {
        console.error("Error joining community:", error);
        throw error;
    }
}

export const getCommunityMembersCount = async (communityId: string) => {
    try {
        const members = await databases.listRows(
            databaseId,
            communityMembersCollectionId,
            [Query.equal("community", communityId)]
        );
        return members.total;
    } catch (error) {
        console.error("Error getting community members count:", error);
        return 0;
    }
}