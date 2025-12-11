import { createPost, createPostComment, deleteComment, deletePost, editPost, getPostComment, getPosts, likeComment } from "@/appwrite/apis/posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreatePostParams {
    user: string;
    caption: string;
    media: string[];
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ user, caption, media }: CreatePostParams) => {
            return await createPost(user, caption, media);
        },
        onSuccess: () => {
            // Invalidate posts query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            console.error("Error creating post in mutation:", error);
        }
    });
};

export const useGetPosts = () => {
    return useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            return await getPosts();
        },
    });
};

export const useEditedPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, data }: { postId: string; data: any }) => {
            return await editPost(postId, data);
        },
        onMutate: async ({ postId, data }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["posts"] });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData(["posts"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["posts"], (old: any[]) => {
                if (!old) return [];
                return old.map((post) => {
                    if (post.$id === postId) {
                        return { ...post, ...data };
                    }
                    return post;
                });
            });

            // Return a context object with the snapshotted value
            return { previousPosts };
        },
        onError: (err, newPost, context) => {
            console.error("Error editing post in mutation:", err);
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure data consistency
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId }: { postId: string }) => {
            return await deletePost(postId);
        },
        onSuccess: () => {
            // Invalidate posts query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (error) => {
            console.error("Error deleting post in mutation:", error);
        }
    });
};

export const useCreatePostComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, userId, content }: { postId: string, userId: string, content: string }) => {
            return await createPostComment(postId, userId, content);
        },
        onSuccess: () => {
            // Invalidate posts query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
        onError: (error) => {
            console.error("Error creating post comment in mutation:", error);
        }
    });
};

export const useGetPostComments = (postId: string) => {
    return useQuery({
        queryKey: ["comments", postId],
        queryFn: async () => await getPostComment(postId),
        enabled: !!postId, // Only run when postId exists
    });
};

export const useLikeComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({commentId, userId}: {commentId: string, userId: string}) => {
            return await likeComment(commentId, userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
        onError: (error) => {
            console.error("Error liking comment in mutation:", error);
        }
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({commentId}: {commentId: string}) => {
            return await deleteComment(commentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
        onError: (error) => {
            console.error("Error deleting comment in mutation:", error);
        }
    });
};