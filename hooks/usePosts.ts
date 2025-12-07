import { createPost, getPosts } from "@/appwrite/apis/posts";
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