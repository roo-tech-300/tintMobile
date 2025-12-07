import { pictureView } from "@/appwrite/apis/auth";
import FeedItem from "@/components/FeedItem";
import { HomeHeader } from "@/components/HomeHeader";
import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import { TintHighlightCard } from "@/components/TintHighlightCard";
import { useAuth } from "@/context/AuthContext";
import { useGetPosts } from "@/hooks/usePosts";
import { borderRadius, colors, fonts } from "@/theme/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {

  const { user, logout } = useAuth();
  const { data: posts, isLoading: isPostsLoading } = useGetPosts();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const userInitials = user?.name?.split(" ").map((name) => name.charAt(0).toUpperCase()).join("") || "U";

  React.useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.avatar) {
        const url = await pictureView(user.avatar);
        // Ensure url is a string (it might be a URL object)
        setAvatarUrl(url ? url.toString() : null);
      }
    };
    fetchAvatar();
  }, [user?.avatar]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

        <HomeHeader initials={userInitials} avatar={avatarUrl} />

        {/* Tint Highlight */}
        <View style={styles.highlight}>
          <View style={styles.highlightTitle}>
            <Text style={{ color: colors.text, fontSize: 24, fontFamily: fonts.bold }}>Tint Highlight</Text>
            <View style={{ width: 30, height: 30, backgroundColor: colors.lightBunker, borderRadius: borderRadius.round, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TintIcon name="angle-small-right" size={18} color={colors.primary} />
            </View>
          </View>

          {/* Tint highlight Cardssss */}
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


        {/* Posts Feed */}
        {isPostsLoading ? (
          <View style={{ padding: 20 }}>
            <LoadingSpinner size="large" color={colors.primary} />
          </View>
        ) : (
          posts?.map((post: any) => (
            <FeedItem key={post.$id} post={post} user = {user} />
          ))
        )}
      </ScrollView>
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
  highlightCard: {
    paddingVertical: 10,
    width: 117,
    height: 160,
    backgroundColor: colors.lightBunker,
    borderRadius: borderRadius.small,
    marginTop: 20,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  highlightCardIcon: {
    width: 33,
    height: 33,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightHeading: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: 10,
  },
  highlightText: {
    color: colors.darkText,
    fontSize: 14,
    fontFamily: fonts.regular,
    width: 80,
    textAlign: "center"
  },
  readMore: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  header: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    color: colors.text,
  },

  headerRight: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
  },

  post: {
    backgroundColor: colors.lightBunker,
    width: "90%",
    marginHorizontal: 'auto',
    padding: 5
  },
  postUser: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  body: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  bodyText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 26,
  },
});


