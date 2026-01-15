import Constants from 'expo-constants';
import { ID, Query } from "react-native-appwrite";
import { databases, storage } from "../appwrite";
import { getDbUser } from './auth';

const extra = Constants.expoConfig?.extra as {
    databaseId: string;
    postsCollectionId: string;
    commentsCollectionId: string;
    mediaBucketId: string;
    savedPostsCollectionId: string;
};

const { databaseId, postsCollectionId, mediaBucketId, commentsCollectionId, savedPostsCollectionId } = extra;

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


        //create Post document
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
        // If media is not provided (e.g. liking, commenting), skip media logic.
        if (!data.media) {
            return await databases.updateRow(
                databaseId,
                postsCollectionId,
                postId,
                data
            );
        }

        const media = data.media ?? [];

        const existingMediaIds = media.filter((item: string) =>
            /^[a-zA-Z0-9]{20,}$/i.test(item)
        );

        const newMediaUris = media.filter((item: string) =>
            !/^[a-zA-Z0-9]{20,}$/i.test(item)
        );

        const uploadMediaIds = await Promise.all(
            newMediaUris.map(async (uri: string) => await uploadFile(uri))
        );

        const finalMediaIds = [...existingMediaIds, ...uploadMediaIds];

        const editedPost = await databases.updateRow(
            databaseId,
            postsCollectionId,
            postId,
            {
                ...data,
                media: finalMediaIds
            }
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
        const user = await getDbUser(post.user);
        return {
            ...post,
            user: user
        };
    } catch (error) {
        console.error("Error getting post:", error);
        throw error;
    }
}

export async function deletePost(postId: string) {
    try {

        const post: any = await getPost(postId);
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

export async function getPostComment(postId: string) {
    try {
        const com = await databases.listRows(
            databaseId,
            commentsCollectionId,
            [
                Query.equal("postId", postId)
            ]
        );
        let postComment: any[] = [];
        await Promise.all(
            com.rows.map(async (comment) => {

                const user = await getDbUser(comment.userId);

                postComment.push({
                    ...comment,
                    user: user
                });
            }));
        console.log("Post comments:", postComment);
        return postComment;
    } catch (error) {
        console.error("Error getting post comments:", error);
        throw error;
    }
}

export async function isLikedComment(commentId: string, userId: string) {
    try {
        const comment = await databases.getRow(
            databaseId,
            commentsCollectionId,
            commentId
        );
        const isLiked = comment.likes.includes(userId);
        return isLiked;
    } catch (error) {
        console.error("Error checking if comment is liked:", error);
        throw error;
    }
}

export async function likeComment(commentId: string, userId: string) {
    try {
        const comment = await databases.getRow(
            databaseId,
            commentsCollectionId,
            commentId
        );

        const isLiked = await isLikedComment(commentId, userId);
        const likes = comment.likes;
        if (isLiked) {
            likes.splice(likes.indexOf(userId), 1);
        } else {
            likes.push(userId);
        }
        const likedComment = await databases.updateRow(
            databaseId,
            commentsCollectionId,
            commentId,
            {
                likes: likes
            }
        );
        return likedComment;
    } catch (error) {
        console.error("Error liking comment:", error);
        throw error;
    }
}

export async function createPostComment(postId: string, userId: string, content: string, parentCommentId?: string) {
    try {

        const newComment = await databases.createRow(
            databaseId,
            commentsCollectionId,
            ID.unique(),
            {
                userId: userId,
                postId: postId,
                content: content,
                parentCommentId: parentCommentId,
            }
        );
        return newComment;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
}

export async function deleteComment(commentId: string) {
    try {
        const deletedComment = await databases.deleteRow(
            databaseId,
            commentsCollectionId,
            commentId
        );
        return deletedComment;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
}

export async function savePost(userId: string, postId: string) {
    try {
        // Check if already saved using listRows instead of relying on ID collision
        const existing = await isSavedPost(userId, postId);
        if (existing) {
            return existing;
        }

        return await databases.createRow(
            databaseId,
            savedPostsCollectionId,
            ID.unique(),
            { userId, postId }
        );
    } catch (error: any) {
        throw error;
    }
}

export async function unsavePost(userId: string, postId: string) {
    try {
        // Find the document ID first since we can't derive it from userId_postId anymore
        const savedPost = await isSavedPost(userId, postId);

        if (savedPost) {
            return await databases.deleteRow(
                databaseId,
                savedPostsCollectionId,
                savedPost.$id
            );
        }
        return null;
    } catch (error: any) {
        throw error;
    }
}

export async function isSavedPost(userId: string, postId: string) {
    try {
        const response = await databases.listRows(
            databaseId,
            savedPostsCollectionId,
            [
                Query.equal("userId", userId),
                Query.equal("postId", postId)
            ]
        );
        return response.rows[0] || null;
    } catch (error: any) {
        throw error;
    }
}
