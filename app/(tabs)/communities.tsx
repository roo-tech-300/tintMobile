import TintIcon from "@/components/Icon";
import { borderRadius, colors, fonts } from "@/theme/theme";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Community {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  timeAgo?: string;
  members: number;
  unreadCount?: number;
  description?: string;
}

const Communities = () => {
  const [myCommunities] = useState<Community[]>([
    {
      id: "1",
      name: "Tech Enthusiasts",
      avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
      lastMessage: "Has anyone tried the new React compiler yet? It looks promising!",
      timeAgo: "2m",
      members: 1250,
      unreadCount: 3,
    },
    {
      id: "2",
      name: "Design Hub",
      avatar: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
      lastMessage: "Check out these new Figma plugins I found today.",
      timeAgo: "15m",
      members: 890,
    },
    {
      id: "3",
      name: "Startup Founders",
      avatar: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400",
      lastMessage: "Looking for a co-founder for a fintech app. DM me if interested.",
      timeAgo: "1h",
      members: 3400,
      unreadCount: 1,
    },
  ]);

  const [recommendedCommunities] = useState<Community[]>([
    {
      id: "4",
      name: "Gaming Lounge",
      avatar: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400",
      members: 5600,
      description: "The ultimate place for gamers to connect and play.",
    },
    {
      id: "5",
      name: "Book Club",
      avatar: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
      members: 450,
      description: "Monthly book discussions and reading challenges.",
    },
    {
      id: "6",
      name: "Photography",
      avatar: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      members: 1200,
      description: "Share your best shots and get feedback from pros.",
    },
  ]);

  const renderCommunityItem = (item: Community) => (
    <Pressable key={item.id} style={styles.communityItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.communityName}>{item.name}</Text>
          {item.timeAgo && <Text style={styles.timeAgo}>{item.timeAgo}</Text>}
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderRecommendedItem = (item: Community) => (
    <Pressable key={item.id} style={styles.recommendedItem}>
      <Image source={{ uri: item.avatar }} style={styles.recommendedAvatar} />
      <View style={styles.recommendedContent}>
        <Text style={styles.communityName}>{item.name}</Text>
        <Text style={styles.memberCount}>{item.members.toLocaleString()} members</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
      <Pressable style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <Pressable style={styles.createButton}>
          <TintIcon name="add" size={25} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* My Communities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Communities</Text>
          <View style={styles.listContent}>
            {myCommunities.map(renderCommunityItem)}
          </View>
        </View>

        {/* Recommended Communities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <View style={styles.listContent}>
            {recommendedCommunities.map(renderRecommendedItem)}
          </View>
        </View>
      </ScrollView>
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
  },
  timeAgo: {
    fontSize: 12,
    color: colors.darkText,
    fontFamily: fonts.regular,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: colors.darkText,
    fontFamily: fonts.regular,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 10,
    color: colors.text,
    fontFamily: fonts.bold,
  },
  recommendedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.lightBunker,
    borderRadius: borderRadius.small,
    marginBottom: 12,
  },
  recommendedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: colors.black,
  },
  recommendedContent: {
    flex: 1,
    marginRight: 12,
  },
  memberCount: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fonts.bold,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: colors.darkText,
    fontFamily: fonts.regular,
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
