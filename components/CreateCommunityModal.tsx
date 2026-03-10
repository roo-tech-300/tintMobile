import TintIcon from "@/components/Icon";
import LoadingSpinner from "@/components/LoadingSpinner";
import PrimaryBtn from "@/components/PrimaryBtn";
import { useAuth } from "@/context/AuthContext";
import { useCreateCommunity } from "@/hooks/useCommunities";
import { borderRadius, colors, fonts } from "@/theme/theme";
import { getInitials } from "@/utils/stringUtils";
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CreateCommunityModalProps {
    visible: boolean;
    onClose: () => void;
}

export const CreateCommunityModal = ({ visible, onClose }: CreateCommunityModalProps) => {
    const { user } = useAuth();
    const { mutateAsync: createCommunity, isPending } = useCreateCommunity();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets) {
            setImageUri(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setImageUri(null);
    };

    const handleCreate = async () => {
        if (!name.trim() || !user?.$id) return;

        try {
            await createCommunity({
                name: name.trim(),
                description: description.trim(),
                imageUri: imageUri || undefined,
                creatorId: user.$id
            });
            onClose();
            setName("");
            setDescription("");
            setImageUri(null);
        } catch (error) {
            console.error("Failed to create community", error);
        }
    };

    const renderImagePlaceholder = () => {
        if (imageUri) {
            return <Image source={{ uri: imageUri }} style={styles.coverImage} />;
        }

        if (name.trim()) {
            return (
                <Text style={styles.initialsText}>
                    {getInitials(name)}
                </Text>
            );
        }

        return <TintIcon name="picture" size={40} color={colors.primary} />;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.header}>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <TintIcon name="cross" size={18} color={colors.text} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Create Community</Text>
                        <View style={{ width: 18 }} />
                    </View>

                    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.imagePickerSection}>
                            <Pressable style={styles.imagePicker} onPress={pickImage}>
                                <View style={styles.imagePlaceholder}>
                                    {renderImagePlaceholder()}
                                </View>
                                {imageUri && (
                                    <Pressable style={styles.removeImageBadge} onPress={removeImage}>
                                        <TintIcon name="cross" size={12} color="white" />
                                    </Pressable>
                                )}
                                {!imageUri && (
                                    <View style={styles.addIconBadge}>
                                        <TintIcon name="camera" size={14} color="white" />
                                    </View>
                                )}
                            </Pressable>
                            <Text style={styles.imagePickerLabel}>Community Avatar</Text>
                        </View>

                        <Text style={styles.label}>Community Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Computer Engineering 300 Level"
                            placeholderTextColor={colors.darkText}
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What is this community about?"
                            placeholderTextColor={colors.darkText}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                        />

                        <View style={styles.buttonContainer}>
                            <PrimaryBtn
                                title={isPending ? <LoadingSpinner color="white" /> : "Create Community"}
                                onPress={handleCreate}
                                disabled={isPending || !name.trim()}
                                style={[styles.createButton, (isPending || !name.trim()) && styles.disabledButton]}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    headerTitle: {
        color: colors.text,
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    closeButton: {
        padding: 5,
    },
    createActionBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    createActionText: {
        color: colors.primary,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    form: {
        flex: 1,
        padding: 20,
    },
    imagePickerSection: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    imagePicker: {
        width: 120,
        height: 120,
        backgroundColor: colors.lightBunker,
        borderRadius: 60,
        overflow: "visible",
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    imagePickerLabel: {
        color: colors.darkText,
        fontSize: 12,
        fontFamily: fonts.regular,
        marginTop: 10,
    },
    addIconBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.black,
    },
    removeImageBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: colors.error,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.black,
    },
    initialsText: {
        color: colors.primary,
        fontSize: 40,
        fontFamily: fonts.bold,
    },
    label: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.bold,
        marginBottom: 10,
        marginTop: 20,
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 60,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    input: {
        backgroundColor: colors.lightBunker,
        borderRadius: borderRadius.small,
        padding: 15,
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.regular,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    buttonContainer: {
        marginTop: 40,
        marginBottom: 30,
        alignItems: "center",
        width: "100%",
    },
    createButton: {
        width: "100%",
    },
    disabledButton: {
        opacity: 0.5,
    },
});
