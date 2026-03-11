import { pictureView } from "@/appwrite/apis/auth";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";
import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useGetCommunities, useGetUserCommunities, useJoinCommunity } from "@/hooks/useCommunities";
import { borderRadius, colors, fonts } from "@/theme/theme";
import { getInitials } from "@/utils/stringUtils";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper component to resolve and display community cover images
const CommunityAvatar = ({ coverImageId, name, size = 56 }: { coverImageId?: string; name: string; size?: number }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (coverImageId) {
      pictureView(coverImageId).then(url => {
        if (url) setImageUrl(url.toString());
      });
    }
  }, [coverImageId]);

  const borderRadiusVal = size / 2;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: borderRadiusVal }]}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.avatarPlaceholder, { width: size, height: size, borderRadius: borderRadiusVal }]}>
      <Text style={[styles.avatarPlaceholderText, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
    </View>
  );
};

// Helper to show member count
const MemberCount = ({ communityId }: { communityId: string }) => {
  // We'll just show a placeholder for now, you can integrate useGetCommunityMembersCount if needed
  return null;
};

const Communities = () => {
  const { user } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { data: allCommunities, isLoading: isAllLoading } = useGetCommunities();
  const { data: userCommunities, isLoading: isUserLoading } = useGetUserCommunities(user?.$id);
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();

  // Filter recommended = all communities minus the ones user already belongs to
  const userCommunityIds = new Set((userCommunities || []).map((c: any) => c.$id));
  const recommendedCommunities = (allCommunities || []).filter((c: any) => !userCommunityIds.has(c.$id));

  const handleJoin = (communityId: string) => {
    if (!user?.$id) return;
    joinCommunity({ communityId, userId: user.$id });
  };

  const renderCommunityItem = (item: any) => (
    <Pressable key={item.$id} style={styles.communityItem}>
      <CommunityAvatar coverImageId={item.coverImage} name={item.name} size={56} />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
        </View>
        {item.description ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );

  const renderRecommendedItem = (item: any) => (
    <Pressable key={item.$id} style={styles.recommendedItem}>
      <CommunityAvatar coverImageId={item.coverImage} name={item.name} size={50} />
      <View style={styles.recommendedContent}>
        <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        ) : null}
      </View>
      <Pressable style={styles.joinButton} onPress={() => handleJoin(item.$id)} disabled={isJoining}>
        <Text style={styles.joinButtonText}>Join</Text>
      </Pressable>
    </Pressable>
  );

  const isLoading = isAllLoading || isUserLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <Pressable style={styles.createButton} onPress={() => setIsModalVisible(true)}>
          <TintIcon name="add" size={25} color={colors.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* My Communities */}
          {userCommunities && userCommunities.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.listContent}>
                {userCommunities.map(renderCommunityItem)}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <TintIcon name="people" size={48} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Communities Yet</Text>
              <Text style={styles.emptyText}>
                Create or join a community to connect with people who share your interests.
              </Text>
              <Pressable style={styles.emptyCreateBtn} onPress={() => setIsModalVisible(true)}>
                <TintIcon name="add" size={18} color={colors.text} />
                <Text style={styles.emptyCreateBtnText}>Create a Community</Text>
              </Pressable>
            </View>
          )}

          {/* Recommended Communities */}
          {recommendedCommunities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <View style={styles.listContent}>
                {recommendedCommunities.map(renderRecommendedItem)}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <CreateCommunityModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Communities;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.bold,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.bold,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  communityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: colors.lightBunker,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  communityName: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.darkText,
    fontFamily: fonts.regular,
    flex: 1,
    marginRight: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  emptyText: {
    color: colors.darkText,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginTop: 10,
  },
  emptyCreateBtnText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  recommendedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.lightBunker,
    borderRadius: borderRadius.small,
    marginBottom: 12,
  },
  recommendedContent: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 12,
    color: colors.darkText,
    fontFamily: fonts.regular,
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
