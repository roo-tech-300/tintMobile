import { pictureView } from "@/appwrite/apis/auth";
import TintIcon from "@/components/Icon";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useClearRecentSearches, useDeleteRecentSearch, useGetRecentSearches, useSaveRecentSearch, useSearchPosts, useSearchUsers } from "@/hooks/useSearch";
import { colors, fonts } from "@/theme/theme";
import { getAvatarColorForUser } from "@/utils/avatarColors";
import { getInitials } from "@/utils/stringUtils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RecentAvatar = ({ type, id, displayName, avatarId }: any) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (type === "user" && avatarId) {
      pictureView(avatarId).then(res => {
        if (isMounted && res) setUrl(res.toString());
      }).catch(e => console.log("Recent avatar error:", e));
    }
    return () => { isMounted = false; };
  }, [type, avatarId]);

  if (type === "user") {
    if (url) {
      return (
        <Image
          source={{ uri: url }}
          style={{ width: "100%", height: "100%", borderRadius: 24 }}
          contentFit="cover"
        />
      );
    }
    return <Text style={styles.avatarText}>{getInitials(displayName)}</Text>;
  }

  if (type === "post") {
    return <TintIcon name="document-text" size={18} color={colors.text} />;
  }

  return <TintIcon name="clock" size={18} color={colors.darkText} />;
};

const SearchUserResult = ({ item, type, typeIcon, id, displayName, displayUsername, displayInitials, onPress }: any) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (type === "user" && item.avatar) {
      pictureView(item.avatar).then(url => {
        if (isMounted && url) {
          setAvatarUrl(url.toString());
        }
      }).catch((e) => console.log("Error fetching avatar in search:", e));
    }
    return () => { isMounted = false; };
  }, [type, item.avatar]);

  return (
    <Pressable
      style={styles.searchItem}
      onPress={() => onPress(item, type as any)}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColorForUser(id) }]}>
        {type === "user" && avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: "100%", height: "100%", borderRadius: 24 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : type === "user" ? (
          <Text style={styles.avatarText}>{displayInitials}</Text>
        ) : (
          <TintIcon name={typeIcon!} size={20} color={colors.text} />
        )}
      </View>
      <View style={styles.searchItemContent}>
        <View style={styles.nameRow}>
          <Text style={styles.searchItemName} numberOfLines={1}>{displayName}</Text>
        </View>
        <Text style={styles.searchItemUsername} numberOfLines={1}>{displayUsername}</Text>
      </View>
    </Pressable>
  );
};

const Search = () => {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Queries using the new hooks
  const { data: recentSearches = [], isLoading: isLoadingRecent } = useGetRecentSearches(currentUser?.$id);
  const { data: userResults = [], isLoading: isLoadingUsers } = useSearchUsers(debouncedSearchQuery);
  const { data: postResults = [], isLoading: isLoadingPosts } = useSearchPosts(debouncedSearchQuery);

  // Mutations using the new hooks
  const { mutateAsync: saveSearchMutation } = useSaveRecentSearch();
  const { mutateAsync: deleteSearchMutation } = useDeleteRecentSearch();
  const { mutateAsync: clearAllMutation } = useClearRecentSearches();

  const handleResultPress = (item: any, type: "user" | "post") => {
    // We encode the type and ID into the search value so we can style recent searches properly
    // format: type|id|displayValue|avatarId
    const displayValue = type === "user" ? item.name : item.caption;
    const avatar = type === "user" ? (item.avatar || "") : "";
    const searchValue = `${type}|${item.$id}|${displayValue}|${avatar}`;

    if (searchValue && currentUser?.$id) {
      saveSearchMutation({ userId: currentUser.$id, searchValue });
    }

    if (type === "user") {
      router.push(`/user/${item.$id}`);
    } else if (type === "post") {
      router.push({
        pathname: "/post/post",
        params: { postId: item.$id }
      });
    }
  };

  const removeRecentSearch = (id: string) => {
    deleteSearchMutation(id);
  };

  const clearAllRecent = () => {
    if (currentUser?.$id) {
      clearAllMutation(currentUser.$id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return null;
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

  const renderSearchItem = (item: any, isRecent: boolean = false) => {
    let type: string;
    let displayName: string;
    let id: string;
    let displayUsername: string = "";
    let displayInitials: string = "";
    let isEncoded = false;

    if (isRecent) {
      // Check if it's an encoded string (type|id|name|avatar)
      let avatarId = "";
      if (item.searchValue.includes("|")) {
        const [t, i, n, a] = item.searchValue.split("|");
        type = t || "user";
        id = i || item.$id;
        displayName = n || item.searchValue;
        avatarId = a || "";
        isEncoded = true;
      } else {
        // Fallback for old/simple search strings
        type = "query";
        displayName = item.searchValue;
        id = item.$id;
      }

      return (
        <Pressable
          key={item.$id}
          style={styles.searchItem}
          onPress={() => isEncoded ? handleResultPress({ $id: id, name: displayName, caption: displayName, avatar: avatarId }, type as any) : setSearchQuery(item.searchValue)}
        >
          <View style={[styles.avatar, { backgroundColor: isEncoded ? getAvatarColorForUser(id) : colors.lightBunker }]}>
            <RecentAvatar type={type} id={id} displayName={displayName} avatarId={avatarId} />
          </View>
          <View style={styles.searchItemContent}>
            <View style={styles.nameRow}>
              <Text style={styles.searchItemName} numberOfLines={1}>{displayName}</Text>
              {isEncoded && (
                <View style={[styles.typeBadge, { backgroundColor: type === 'user' ? colors.primary + '20' : colors.background + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: type === 'user' ? colors.primary : colors.background }]}>
                    {type}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Pressable onPress={() => removeRecentSearch(item.$id)} style={styles.removeButton}>
            <TintIcon name="cross" size={16} color={colors.darkText} />
          </Pressable>
        </Pressable>
      );
    }

    type = item.caption ? "post" : "user";
    const typeIcon = getTypeIcon(type);
    id = item.$id;

    // Normalize display data
    displayName = type === "user" ? item.name : item.caption;
    displayUsername = type === "user" ? `@${item.username}` : `Posted by ${item.user?.name || 'Unknown'}`;
    displayInitials = type === "user" ? getInitials(item.name) : "PO";

    return (
      <SearchUserResult
        key={item.$id}
        item={item}
        type={type}
        typeIcon={typeIcon!}
        id={id}
        displayName={displayName}
        displayUsername={displayUsername}
        displayInitials={displayInitials}
        onPress={(item: any, type: any) => handleResultPress(item, type)}
      />
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
                Results ({(userResults?.length || 0) + (postResults?.length || 0)})
              </Text>
            </View>

            {(isLoadingUsers || isLoadingPosts) ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : ((userResults?.length || 0) > 0 || (postResults?.length || 0) > 0) ? (
              <View style={styles.searchList}>
                {userResults?.map((item: any) => renderSearchItem(item, false))}
                {postResults?.map((item: any) => renderSearchItem(item, false))}
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
        {searchQuery.trim().length === 0 && (
          <>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <Pressable onPress={clearAllRecent}>
                    <Text style={styles.clearButton}>Clear All</Text>
                  </Pressable>
                </View>
                <View style={styles.searchList}>
                  {recentSearches.map((item: any) => renderSearchItem(item, true))}
                </View>
              </View>
            )}

            {/* Recommended */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recommended</Text>
              </View>
              <View style={styles.emptyState}>
                <Text style={styles.emptySubtext}>Start typing to discover people and posts</Text>
              </View>
            </View>
          </>
        )}
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
