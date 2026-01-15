import { borderRadius, colors } from "@/theme/theme"
import { useRouter } from "expo-router"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import TintIcon from "./Icon"
import Logo from "./Logo"

export const HomeHeader = ({ initials, avatar }: { initials: string, avatar?: string | null }) => {

  const router = useRouter()
  return (
    <View style={styles.header}>
      <Logo variant="image" size="medium" />
      <View style={styles.headerRight}>
        <TintIcon name="bell" size={25} color={colors.text} />
        <Pressable style={styles.avatar} onPress={() => { router.push("/user/profile")}}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: '100%', height: '100%', }}
            />
          ) : (
            <Text style={[styles.text, { fontSize: 16 }]}>{initials}</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create(
  {
    text: {
      color: colors.text,
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
      overflow: "hidden",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  }
)