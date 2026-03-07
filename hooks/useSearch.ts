import { clearRecentSearches, deleteRecentSearch, getRecentSearches, saveRecentSearch, searchPosts, searchUsers } from "@/appwrite/apis/search";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSearchUsers = (query: string) => {
    return useQuery({
        queryKey: ["searchUsers", query],
        queryFn: () => searchUsers(query),
        enabled: query.trim().length > 0,
    });
};

export const useSearchPosts = (query: string) => {
    return useQuery({
        queryKey: ["searchPosts", query],
        queryFn: () => searchPosts(query),
        enabled: query.trim().length > 0,
    });
};

export const useGetRecentSearches = (userId?: string) => {
    return useQuery({
        queryKey: ["recentSearches", userId],
        queryFn: () => getRecentSearches(userId!),
        enabled: !!userId,
    });
};

export const useSaveRecentSearch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, searchValue }: { userId: string; searchValue: string }) =>
            saveRecentSearch(userId, searchValue),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ["recentSearches", userId] });
        },
    });
};

export const useDeleteRecentSearch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (searchId: string) => deleteRecentSearch(searchId),
        onSuccess: (_, searchId) => {
            // Since we don't have the userId here easily without passing it, 
            // we can invalidate all recentSearches or expect the consumer to handle specific keys
            queryClient.invalidateQueries({ queryKey: ["recentSearches"] });
        },
    });
};

export const useClearRecentSearches = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => clearRecentSearches(userId),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ["recentSearches", userId] });
        },
    });
};
