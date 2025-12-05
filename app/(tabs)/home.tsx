import TintIcon from "@/components/Icon";
import Logo from "@/components/Logo";
import Post from "@/components/Post";
import { useAuth } from "@/context/AuthContext";
import { borderRadius, colors, fonts } from "@/theme/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo variant="image" size="medium" />
          <View style={styles.headerRight}>
            <TintIcon name="bell" size={25} color={colors.text} />
            <View style={styles.avatar}>
              <Text style={[styles.text, { fontSize: 16 }]}>EA</Text>
            </View>
          </View>
        </View>

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
            <View style={styles.highlightCard}>
              <View style={styles.highlightCardIcon}>
                <TintIcon name="newspaper" size={17} color={colors.text} />
              </View>
              <Text style={styles.highlightHeading}>Acute News</Text>
              <Text style={styles.highlightText}>
                {(() => {
                  const fullText = "SUG has not accepted School's proposal on school fee";
                  const maxLength = 43;
                  if (fullText.length > maxLength) {
                    return (
                      <>
                        {fullText.substring(0, maxLength)}...{' '}
                        <Text style={styles.readMore}>Read more</Text>
                      </>
                    );
                  }
                  return fullText;
                })()}
              </Text>
            </View>
            <View style={styles.highlightCard}>
              <View style={styles.highlightCardIcon}>
                <TintIcon name="calendar-day" size={17} color={colors.text} />
              </View>
              <Text style={styles.highlightHeading}>Events</Text>
              <Text style={styles.highlightText}>
                {(() => {
                  const fullText = "E-Natale cup on Saturday at 4pm";
                  const maxLength = 43;
                  if (fullText.length > maxLength) {
                    return (
                      <>
                        {fullText.substring(0, maxLength)}...{' '}
                        <Text style={styles.readMore}>Read more</Text>
                      </>
                    );
                  }
                  return fullText;
                })()}
              </Text>
            </View>
            <View style={styles.highlightCard}>
              <View style={styles.highlightCardIcon}>
                <TintIcon name="bell" size={17} color={colors.text} />
              </View>
              <Text style={styles.highlightHeading}>Notifications</Text>
              <Text style={styles.highlightText}>
                {(() => {
                  const fullText = "Emmanuel John started following you";
                  const maxLength = 43;
                  if (fullText.length > maxLength) {
                    return (
                      <>
                        {fullText.substring(0, maxLength)}...{' '}
                        <Text style={styles.readMore}>Read more</Text>
                      </>
                    );
                  }
                  return fullText;
                })()}
              </Text>
            </View>
          </ScrollView>
        </View>


        {/* Posts Feed */}
        <Post
          userName="Sokbat Sultan"
          userInitials="SS"
          timeAgo="2h Ago"
          caption="We are preparing for the next game and we decided before we travell to Abuja why don't we enjoy a bit of nature, that was when we saw John comming back ffrom church jnbhbyu nu"
          avatarColor={colors.background}
          showFollowButton={true}
          images={[
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"
          ]}
        />

        <Post
          userName="John Doe"
          userInitials="JD"
          timeAgo="5h Ago"
          caption="Just finished an amazing workout session! Feeling pumped and ready to take on the world. Remember, consistency is key to success!"
          avatarColor={colors.primary}
          images={[
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
          ]}
        />

        <Post
          userName="Sarah Williams"
          userInitials="SW"
          timeAgo="1d Ago"
          caption="Beautiful sunset today at the beach. Nature never fails to amaze me with its incredible beauty and peaceful vibes."
          avatarColor="#FF6B6B"
          showFollowButton={true}
          images={[
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"
          ]}
        />
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


