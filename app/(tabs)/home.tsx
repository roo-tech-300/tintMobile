import PrimaryBtn from "@/components/PrimaryBtn";
import { useAuth } from "@/context/AuthContext";
import { View, Text, StyleSheet, StatusBar } from "react-native";

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Back 👋</Text>
        <Text style={styles.headerSubtitle}>Hope you're having a great day!</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.bodyText}>
          This is your home screen. More features coming soon 🚀
        </Text>
      </View>



                <PrimaryBtn
                  title="Logout"
                  onPress={() => {
                    handleLogout();
                  }}
                  
                />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FE",
  },

  header: {
    backgroundColor: "#4B7BE5",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
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


