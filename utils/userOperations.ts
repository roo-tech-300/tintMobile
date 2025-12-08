import { getDbUser, updateDbUser } from "@/appwrite/apis/auth";
import { DbUser } from "@/context/AuthContext";

/**
 * Toggles the follow status between the current user and a target user.
 * 
 * @param currentUserId The ID of the authenticated user performing the action.
 * @param targetUserId The ID of the user to follow or unfollow.
 * @returns An object indicating success and the new state, or throws an error.
 */
export async function toggleFollowUser(currentUserId: string, targetUserId: string) {
    try {
        if (!currentUserId || !targetUserId) throw new Error("Invalid user IDs");
        if (currentUserId === targetUserId) throw new Error("Cannot follow yourself");

        const [currentUser, targetUser] = await Promise.all([
            getDbUser(currentUserId),
            getDbUser(targetUserId)
        ]) as [DbUser | null, DbUser | null];

        if (!currentUser || !targetUser) throw new Error("User not found");

        // 2. Arrays from DB (default to empty if undefined)
        const myFollowing: string[] = currentUser.following || [];
        const targetFollowers: string[] = targetUser.followers || [];

        const isFollowing = myFollowing.includes(targetUserId);

        let newMyFollowing;
        let newTargetFollowers;

        if (isFollowing) {
            // Unfollow
            newMyFollowing = myFollowing.filter(id => id !== targetUserId);
            newTargetFollowers = targetFollowers.filter(id => id !== currentUserId);
        } else {
            // Follow
            newMyFollowing = [...myFollowing, targetUserId];
            newTargetFollowers = [...targetFollowers, currentUserId];
        }

        // 3. Update both documents
        // Using Promise.all for speed, though atomicity isn't guaranteed in pure Appwrite without functions.
        // It's acceptable for this level of app.
        await Promise.all([
            updateDbUser(currentUserId, { following: newMyFollowing }),
            updateDbUser(targetUserId, { followers: newTargetFollowers })
        ]);

        return {
            isFollowing: !isFollowing,
            myFollowing: newMyFollowing,
            targetFollowers: newTargetFollowers
        };

    } catch (error) {
        console.error("Error toggling follow:", error);
        throw error;
    }
}
