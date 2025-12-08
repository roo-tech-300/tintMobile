import { getDbUser, getMediaResource, pictureView } from '@/appwrite/apis/auth';
import { useAuth } from '@/context/AuthContext';
import { useEditedPost } from '@/hooks/usePosts';
import { useToggleFollow } from '@/hooks/useUser';
import { getAvatarColorForUser } from '@/utils/avatarColors'; // You might need to export this if not already
import { timeAgo } from '@/utils/dateUtils';
import { getInitials } from '@/utils/stringUtils';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import LoadingSpinner from './LoadingSpinner';
import Post from './Post';

interface FeedItemProps {
    post: any;
    user?: any;
    isVisible?: boolean;
}

const FeedItem: React.FC<FeedItemProps> = ({ post, isVisible = true }) => {
    const { user } = useAuth();
    const { mutate: editPost } = useEditedPost();
    const { mutate: toggleFollow } = useToggleFollow();
    const [mediaItems, setMediaItems] = useState<{ uri: string; type: string }[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<URL | null>(null);
    const [userInitials, setUserInitials] = useState("");
    const [userName, setUserName] = useState("Tint User");
    const [author, setAuthor] = useState<any>(null);
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
                let fetchedUser = null;

                if (post.user && typeof post.user === 'object') {
                    fetchedUser = post.user;
                } else if (typeof post.user === 'string') {
                    fetchedUser = await getDbUser(post.user);
                }

                if (fetchedUser) {
                    setAuthor(fetchedUser);
                    setUserName(fetchedUser.name || "Tint User");
                    setUserInitials(getInitials(fetchedUser.name || "Tint User"));
                    if (fetchedUser.avatar) {
                        const url = await pictureView(fetchedUser.avatar);
                        setAvatarUrl(url);
                    }
                } else {
                    // Fallback
                    setUserName("Unknown User");
                    setUserInitials("??");
                }

            } catch (e) {
                console.error("Error loading feed item:", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [post]);

    const handleLike = () => {
        if (!user) return;

        const currentLikes = post.likes || [];
        const isLiked = currentLikes.includes(user.$id);

        let newLikes;
        if (isLiked) {
            newLikes = currentLikes.filter((id: string) => id !== user.$id);
        } else {
            newLikes = [...currentLikes, user.$id];
        }

        editPost({
            postId: post.$id,
            data: { likes: newLikes }
        });
    };

    const handleFollow = () => {
        // console.log('Handle Follow Called. User:', user?.$id, 'Author:', author?.$id);
        if (!user || !author) {
            // console.log("Follow aborted: Missing user or author");
            return;
        }

        // Optimistic Update
        const currentFollowers = author.followers || [];
        const isFollowing = currentFollowers.includes(user.$id);

        let newFollowers;
        if (isFollowing) {
            newFollowers = currentFollowers.filter((id: string) => id !== user.$id);
        } else {
            newFollowers = [...currentFollowers, user.$id];
        }

        // Update local state immediately
        setAuthor({
            ...author,
            followers: newFollowers
        });

        // console.log('We dey following');
        toggleFollow(
            { currentUserId: user.$id, targetUserId: author.$id },
            {
                onError: (error) => {
                    console.error("Follow failed, reverting", error);
                    // Revert
                    setAuthor({
                        ...author,
                        followers: currentFollowers
                    });
                }
            }
        );
    };

    if (loading) {
        return <View style={{ padding: 20 }}><LoadingSpinner /></View>;
    }

    const postUserId = author ? author.$id : (typeof post.user === 'string' ? post.user : post.user?.$id);
    const isFollowing = author?.followers?.includes(user?.$id);

    return (
        <Post
            userName={userName}
            userInitials={userInitials}
            timeAgo={timeAgo(post.createdAt || post.$createdAt)}
            caption={post.caption}
            avatarColor={getAvatarColorForUser(postUserId || "unknown")}
            mediaItems={mediaItems}
            avatar={avatarUrl ? avatarUrl.toString() : null}
            isUser={user?.$id === postUserId}
            isVisible={isVisible}
            likes={post.likes || []}
            currentUserId={user?.$id}
            onLike={handleLike}
            isFollowing={isFollowing || false}
            onFollow={handleFollow}
        />
    );
};

export default FeedItem;
