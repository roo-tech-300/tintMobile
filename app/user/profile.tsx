import { pictureView } from "@/appwrite/apis/auth";
import PrimaryBtn from "@/components/PrimaryBtn";
import { useAuth } from "@/context/AuthContext";
import { colors, fonts } from "@/theme/theme";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
    const { user, logout } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (user?.avatar) {
                const url = await pictureView(user.avatar);
                setAvatarUrl(url ? url.toString() : null);
            }
        };
        fetchAvatar();
    }, [user?.avatar]);

    const userInitials = user?.name
        ?.split(" ")
        .map((name) => name.charAt(0).toUpperCase())
        .join("") || "U";

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{userInitials}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.name}>{user?.name || "User"}</Text>
                <Text style={styles.email}>{user?.email}</Text>

                <View style={styles.spacer} />

                <PrimaryBtn
                    title="Sign Out"
                    onPress={logout}
                    style={styles.logoutButton}
                    textStyle={styles.logoutButtonText}
                />
            </View>
        </SafeAreaView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.black,
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightBunker,
    },
    headerTitle: {
        fontSize: 24,
        color: colors.text,
        fontFamily: fonts.bold,
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: "center",
    },
    avatarContainer: {
        marginTop: 40,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: colors.lightBunker,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary, // Using primary color for placeholder
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.lightBunker,
    },
    avatarText: {
        fontSize: 40,
        color: "#fff",
        fontFamily: fonts.bold,
    },
    name: {
        fontSize: 28,
        color: colors.text,
        fontFamily: fonts.bold,
        marginBottom: 5,
        textAlign: "center",
    },
    email: {
        fontSize: 16,
        color: colors.darkText,
        fontFamily: fonts.regular,
        marginBottom: 30,
        textAlign: "center",
    },
    spacer: {
        flex: 1,
    },
    logoutButton: {
        backgroundColor: colors.lightBunker, // Slightly lighter background for the button instead of transparent
        borderWidth: 0,
        width: '100%',
        marginBottom: 20,
        paddingVertical: 18,
    },
    logoutButtonText: {
        color: '#FF4444', // Distinctive red for logout
        fontFamily: fonts.bold,
    }
});
