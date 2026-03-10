export const getInitials = (name?: string): string => {
    if (!name || name.trim() === "") return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    } else {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
};
