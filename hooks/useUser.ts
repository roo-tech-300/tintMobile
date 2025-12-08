import { toggleFollowUser } from "@/utils/userOperations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleFollow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) => {
            return await toggleFollowUser(currentUserId, targetUserId);
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refresh UI
            // We might need to invalidate specific user queries or the feed
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.targetUserId] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.currentUserId] });
        },
        onError: (error) => {
            console.error("Error toggling follow:", error);
        }
    });
};
