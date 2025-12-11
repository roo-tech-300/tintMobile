import { getMediaResource, pictureView } from "@/appwrite/apis/auth";
import FeedItem from "@/components/FeedItem";
import { HomeHeader } from "@/components/HomeHeader";
import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import { TintHighlightCard } from "@/components/TintHighlightCard";
import { useAuth } from "@/context/AuthContext";
import { useGetPosts } from "@/hooks/usePosts";
import { borderRadius, colors, fonts } from "@/theme/theme";
import { useIsFocused } from "@react-navigation/native";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { user } = useAuth();
  const { data: posts, isLoading: isPostsLoading } = useGetPosts();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [viewableItemId, setViewableItemId] = React.useState<string | null>(null);
  const isFocused = useIsFocused();

  const userInitials = user?.name?.split(" ").map((name) => name.charAt(0).toUpperCase()).join("") || "U";

  React.useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.avatar) {
        const url = await getMediaResource(user.avatar);
        setAvatarUrl(url?.uri ?? null);
        console.log("Avatar URL:", url?.uri);
      }
    };
    fetchAvatar();
  }, [user?.avatar]);

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 80
  }).current;

  const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length === 0) return;
    if (viewableItems.length > 0) {
      console.log("Viewable item changed to:", viewableItems[0].item.$id);
      setViewableItemId(viewableItems[0].item.$id);
    }
  }).current;

  const headerComponent = (
    <>
      <HomeHeader initials={userInitials} avatar={avatarUrl} />

      {/* Tint Highlight */}
      <View style={styles.highlight}>
        <View style={styles.highlightTitle}>
          <Text style={{ color: colors.text, fontSize: 24, fontFamily: fonts.bold }}>Tint Highlight</Text>
          <View style={{ width: 30, height: 30, backgroundColor: colors.lightBunker, borderRadius: borderRadius.round, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TintIcon name="angle-small-right" size={18} color={colors.primary} />
          </View>
        </View>

        {/* Tint highlight Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightCards}
        >
          <TintHighlightCard icon="newspaper" title="Acute News" text="SUG has not accepted School's proposal on school fee" />
          <TintHighlightCard icon="calendar-day" title="Events" text="E-Natale cup on Saturday at 4pm" />
          <TintHighlightCard icon="bell" title="Notifications" text="Emmanuel John started following you" />
        </ScrollView>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts || []}
        keyExtractor={(item: any) => item.$id}
        renderItem={({ item }: { item: any }) => (
          <FeedItem
            post={item}
            user={user}
            isVisible={isFocused && item.$id === viewableItemId}
          />
        )}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={
          isPostsLoading ? (
            <View style={{ padding: 20 }}>
              <LoadingSpinner size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.darkText }}>No posts found</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        extraData={{ viewableItemId, isFocused }}
      />
    </SafeAreaView>
  )
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    width: "100%",
    height: "100%",
  },
  text: {
    color: colors.text,
  },
  highlight: {
    padding: 20,
  },
  highlightTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  highlightCards: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 20,
  },
});


