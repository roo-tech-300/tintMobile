import TintIcon from "@/components/Icon";
import { colors, fonts } from "@/theme/theme";
import { getAvatarColorForUser } from "@/utils/avatarColors";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchItem {
  id: string;
  name: string;
  username: string;
  initials: string;
  type: "user" | "community" | "post" | "event";
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([
    { id: "1", name: "Sarah Williams", username: "@sarahw", initials: "SW", type: "user" },
    { id: "2", name: "Tech Enthusiasts", username: "250 members", initials: "TE", type: "community" },
    { id: "3", name: "How to build a startup", username: "Posted 2h ago", initials: "HT", type: "post" },
  ]);

  const [recommendedSearches] = useState<SearchItem[]>([
    { id: "4", name: "Emma Johnson", username: "@emmaj", initials: "EJ", type: "user" },
    { id: "5", name: "Design Community", username: "1.2k members", initials: "DC", type: "community" },
    { id: "6", name: "Hackathon 2024", username: "Dec 15, 2024", initials: "H2", type: "event" },
    { id: "7", name: "Top 10 productivity tips", username: "Posted 1d ago", initials: "T1", type: "post" },
    { id: "8", name: "Fitness Meetup", username: "Dec 10, 2024", initials: "FM", type: "event" },
    { id: "9", name: "Lisa Anderson", username: "@lisaa", initials: "LA", type: "user" },
  ]);

  const removeRecentSearch = (id: string) => {
    setRecentSearches(recentSearches.filter(item => item.id !== id));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
  };

  // All available search items (simulating database)
  const allSearchItems: SearchItem[] = [
    // Users
    { id: "1", name: "Sarah Williams", username: "@sarahw", initials: "SW", type: "user" },
    { id: "4", name: "Emma Johnson", username: "@emmaj", initials: "EJ", type: "user" },
    { id: "9", name: "Lisa Anderson", username: "@lisaa", initials: "LA", type: "user" },
    { id: "10", name: "Michael Chen", username: "@michaelc", initials: "MC", type: "user" },
    { id: "11", name: "David Brown", username: "@davidb", initials: "DB", type: "user" },

    // Communities
    { id: "2", name: "Tech Enthusiasts", username: "250 members", initials: "TE", type: "community" },
    { id: "5", name: "Design Community", username: "1.2k members", initials: "DC", type: "community" },
    { id: "12", name: "Fitness Lovers", username: "890 members", initials: "FL", type: "community" },
    { id: "13", name: "Startup Founders", username: "3.5k members", initials: "SF", type: "community" },

    // Posts
    { id: "3", name: "How to build a startup", username: "Posted 2h ago", initials: "HT", type: "post" },
    { id: "7", name: "Top 10 productivity tips", username: "Posted 1d ago", initials: "T1", type: "post" },
    { id: "14", name: "Best coding practices 2024", username: "Posted 3h ago", initials: "BC", type: "post" },
    { id: "15", name: "Design trends to watch", username: "Posted 5h ago", initials: "DT", type: "post" },

    // Events
    { id: "6", name: "Hackathon 2024", username: "Dec 15, 2024", initials: "H2", type: "event" },
    { id: "8", name: "Fitness Meetup", username: "Dec 10, 2024", initials: "FM", type: "event" },
    { id: "16", name: "Tech Conference", username: "Jan 20, 2025", initials: "TC", type: "event" },
    { id: "17", name: "Design Workshop", username: "Dec 18, 2024", initials: "DW", type: "event" },
  ];

  // Filter search results based on query
  const searchResults = searchQuery.trim()
    ? allSearchItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const getTypeIcon = (type: SearchItem["type"]) => {
    switch (type) {
      case "user":
        return null; // Users show initials
      case "community":
        return "users-alt";
      case "post":
        return "search";
      case "event":
        return "calendar-day";
      default:
        return "search";
    }
  };



  const renderSearchItem = (item: SearchItem, showRemove: boolean = false) => {
    const typeIcon = getTypeIcon(item.type);

    return (
      <Pressable key={item.id} style={styles.searchItem}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColorForUser(item.id) }]}>
          {item.type === "user" ? (
            <Text style={styles.avatarText}>{item.initials}</Text>
          ) : (
            <TintIcon name={typeIcon!} size={20} color={colors.text} />
          )}
        </View>
        <View style={styles.searchItemContent}>
          <View style={styles.nameRow}>
            <Text style={styles.searchItemName}>{item.name}</Text>
          </View>
          <Text style={styles.searchItemUsername}>{item.username}</Text>
        </View>
        {showRemove && (
          <Pressable onPress={() => removeRecentSearch(item.id)} style={styles.removeButton}>
            <TintIcon name="cross" size={16} color={colors.darkText} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TintIcon name="search" size={20} color={colors.darkText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for people or topics..."
              placeholderTextColor={colors.darkText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <TintIcon name="cross-circle" size={20} color={colors.darkText} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Results - Show when typing */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Results ({searchResults.length})
              </Text>
            </View>
            {searchResults.length > 0 ? (
              <View style={styles.searchList}>
                {searchResults.map(item => renderSearchItem(item, false))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <TintIcon name="search" size={48} color={colors.darkText} />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try searching for something else</Text>
              </View>
            )}
          </View>
        )}

        {/* Recent Searches - Hide when searching */}
        {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <Pressable onPress={clearAllRecent}>
                <Text style={styles.clearButton}>Clear All</Text>
              </Pressable>
            </View>
            <View style={styles.searchList}>
              {recentSearches.map(item => renderSearchItem(item, true))}
            </View>
          </View>
        )}

        {/* Recommended */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended</Text>
          </View>
          <View style={styles.searchList}>
            {recommendedSearches.map(item => renderSearchItem(item, false))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  header: {
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
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.darkText,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightBunker,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily: fonts.bold,
  },
  clearButton: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  searchList: {
    paddingHorizontal: 20,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  searchItemContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  searchItemName: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bold,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: colors.black,
    fontSize: 10,
    fontFamily: fonts.bold,
    textTransform: "uppercase",
  },
  searchItemUsername: {
    color: colors.darkText,
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.darkText,
    fontSize: 14,
    textAlign: "center",
  },
});
