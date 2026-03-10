import { createCommunity, getCommunities, getCommunityMembersCount, getUserCommunities, joinCommunity } from "@/appwrite/apis/communities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetCommunities = () => {
    return useQuery({
        queryKey: ["communities"],
        queryFn: getCommunities,
    });
};

export const useGetUserCommunities = (userId?: string) => {
    return useQuery({
        queryKey: ["userCommunities", userId],
        queryFn: () => getUserCommunities(userId!),
        enabled: !!userId,
    });
};

export const useGetCommunityMembersCount = (communityId: string) => {
    return useQuery({
        queryKey: ["communityMembers", communityId],
        queryFn: () => getCommunityMembersCount(communityId),
        enabled: !!communityId,
    });
};

export const useCreateCommunity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; description?: string; imageUri?: string; creatorId: string }) =>
            createCommunity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communities"] });
            queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
        },
    });
};

export const useJoinCommunity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ communityId, userId }: { communityId: string; userId: string }) =>
            joinCommunity(communityId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communities"] });
            queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
            queryClient.invalidateQueries({ queryKey: ["communityMembers"] });
        },
    });
};
