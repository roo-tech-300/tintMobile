import { getDbUser, getMediaResource, pictureView } from '@/appwrite/apis/auth';
import { useAuth } from '@/context/AuthContext';
import { getAvatarColorForUser } from '@/utils/avatarColors'; // You might need to export this if not already
import { timeAgo } from '@/utils/dateUtils';
import { getInitials } from '@/utils/stringUtils';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import LoadingSpinner from './LoadingSpinner';
import Post from './Post';

interface FeedItemProps {
    post: any;  
    user: any;
}

const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
    const { user } = useAuth();
    const [mediaItems, setMediaItems] = useState<{ uri: string; type: string }[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<URL | null>(null);
    const [userInitials, setUserInitials] = useState("");
    const [userName, setUserName] = useState("Tint User");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Resolve images/videos
                if (post.media && post.media.length > 0) {
                    const items = await Promise.all(
                        post.media.map(async (fileId: string) => {
                            const resource = await getMediaResource(fileId);
                            return resource;
                        })
                    );
                    setMediaItems(items.filter((item): item is { uri: string; type: string } => item !== null));
                }

                // Resolve User Data
                let name = "Unknown User";
                let userId = typeof post.user === 'object' ? post.user.$id : post.user;


                try {
                    // If post.user is just an ID (string), fetch the full user object
                    if (typeof post.user === 'string') {
                        const dbUser = await getDbUser(post.user);
                        if (dbUser) {
                            name = dbUser.name || "Tint User";
                            if (dbUser.avatar) {
                                const url = await pictureView(dbUser.avatar);
                                console.log("Avatar URL:", url);
                                setAvatarUrl(url);
                            }
                        }
                    } else if (typeof post.user === 'object') {
                        // If it's already an object (relationship expanded), use it directly
                        name = post.user.name || "Appwrite User";
                        if (post.user.avatar) {
                            const url = await pictureView(post.user.avatar);
                            setAvatarUrl(url);
                        }
                    }
                } catch (userError) {
                    console.error("Error fetching user details for post:", userError);
                }

                setUserInitials(getInitials(name));
                setUserName(name);

            } catch (e) {
                console.error("Error loading feed item:", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [post]);

    if (loading) {
        // Optional: Render nothing or a skeleton. Post component might need data.
        return <View style={{ padding: 20 }}><LoadingSpinner /></View>;
    }

    return (
        <Post
            userName={userName}
            userInitials={userInitials}
            timeAgo={timeAgo(post.createdAt || post.$createdAt)}
            caption={post.caption}
            avatarColor={getAvatarColorForUser(typeof post.user === 'object' ? post.user.$id : post.user || "unknown")}
            mediaItems={mediaItems}
            avatar={avatarUrl ? avatarUrl.toString() : null}
            isUser={user?.$id === post.user}
        />
    );
};

export default FeedItem;
