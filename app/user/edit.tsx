import { pictureView } from "@/appwrite/apis/auth";
import TintIcon from '@/components/Icon';
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile } from "@/hooks/useUser";
import { borderRadius, colors, fonts } from '@/theme/theme';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfile = () => {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (user?.avatar) {
                setIsLoadingAvatar(true);
                try {
                    const url = await pictureView(user.avatar);
                    setAvatarUri(url ? url.toString() : null);
                } catch (e) {
                    console.error("Failed to fetch avatar", e);
                } finally {
                    setIsLoadingAvatar(false);
                }
            }
        };
        fetchAvatar();
    }, [user?.avatar]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!user?.$id) return;

        updateProfile({
            userId: user.$id,
            data: {
                name,
                username,
                bio,
                avatar: user.avatar
            },
            newAvatarUri: avatarUri,
            refreshUser
        }, {
            onSuccess: () => {
                router.back();
            },
            onError: (error: any) => {
                Alert.alert("Error", error.message || "Failed to update profile.");
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Nav Bar */}
                <View style={styles.navBar}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <TintIcon name="angle-small-left" size={30} color={colors.text} />
                    </Pressable>
                    <Text style={styles.navTitle}>Edit Profile</Text>
                    <View style={{ width: 30 }} /> {/* Spacer */}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <Pressable onPress={pickImage} style={styles.avatarWrapper}>
                            {avatarUri ? (
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarPlaceholderText}>
                                        {name?.charAt(0).toUpperCase() || "U"}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <TintIcon name="camera" size={16} color="white" />
                            </View>
                        </Pressable>
                        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Your Name"
                                placeholderTextColor={colors.darkText}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                placeholderTextColor={colors.darkText}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="@username"
                                placeholderTextColor={colors.darkText}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <Pressable
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <LoadingSpinner color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 5,
    },
    navTitle: {
        color: colors.text,
        fontSize: 18,
        fontFamily: fonts.bold,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: colors.primary,
    },
    avatarPlaceholder: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: colors.text,
        fontSize: 48,
        fontFamily: fonts.bold,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.black,
    },
    changePhotoText: {
        color: colors.primary,
        marginTop: 12,
        fontFamily: fonts.bold,
        fontSize: 16,
    },
    form: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: colors.darkText,
        fontSize: 14,
        fontFamily: fonts.bold,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        color: colors.text,
        padding: 15,
        fontSize: 16,
        fontFamily: fonts.regular,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 25,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "white",
        fontSize: 18,
        fontFamily: fonts.bold,
    },
});
