export const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
};
