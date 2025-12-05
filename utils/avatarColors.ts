import { colors } from "@/theme/theme";

// Array of 5 vibrant colors for avatars
const AVATAR_COLORS = [
    colors.background,  // Purple
    colors.primary,     // Pink
    "#FF6B6B",         // Red/Coral
    "#4ECDC4",         // Teal
    "#9c7e05ff",         // Yellow
];

/**
 * Get a random avatar color from the predefined palette
 */
export const getRandomAvatarColor = (): string => {
    const randomIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
    return AVATAR_COLORS[randomIndex];
};

/**
 * Get a consistent avatar color based on a user ID or name
 * This ensures the same user always gets the same color
 */
export const getAvatarColorForUser = (userId: string): string => {
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use modulo to get an index within our color array
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};

export { AVATAR_COLORS };
