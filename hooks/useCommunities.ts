import { createCommunity } from "@/appwrite/apis/communities";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateCommunity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; description?: string; imageUri?: string; creatorId: string }) =>
            createCommunity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communities"] });
        },
    });
};
