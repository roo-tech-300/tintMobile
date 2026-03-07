import { updateAccountName, updateDbUser, uploadAvatar } from "@/appwrite/apis/auth";
import { toggleFollowUser } from "@/utils/userOperations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleFollow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) => {
            return await toggleFollowUser(currentUserId, targetUserId);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.targetUserId] });
            queryClient.invalidateQueries({ queryKey: ["user", variables.currentUserId] });
        },
        onError: (error) => {
            console.error("Error toggling follow:", error);
        }
    });
};

interface UpdateProfileParams {
    userId: string;
    data: {
        name: string;
        username: string;
        bio: string;
        avatar?: string;
    };
    newAvatarUri?: string | null;
    refreshUser: () => Promise<void>;
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, data, newAvatarUri, refreshUser }: UpdateProfileParams) => {
            let avatarId = data.avatar;

            // 1. Upload Avatar if local file URI exists
            if (newAvatarUri && newAvatarUri.startsWith('file://')) {
                avatarId = await uploadAvatar(newAvatarUri);
            }

            // 2. Update DB row
            const updatedDbUser = await updateDbUser(userId, {
                ...data,
                avatar: avatarId
            });

            // 3. Update Auth side (Name only)
            // Note: In a production app, we'd check if name actually changed
            await updateAccountName(data.name);

            // 4. Force refresh the AuthContext global state
            await refreshUser();

            return updatedDbUser;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });
};
