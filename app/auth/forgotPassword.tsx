import { sendPasswordReset } from '@/appwrite/apis/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import PrimaryBtn from '@/components/PrimaryBtn';
import TextPut from '@/components/TextPut';
import TintAlert from '@/components/TintAlert';
import { colors, fonts } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function forgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ message: string; type?: "error" | "success" | "info" } | null>(null);

    const handleSendLink = async () => {
        if (!email) {
            setAlert({ message: "Please enter your email", type: "error" });
            return;
        }
        try {
            setLoading(true);
            const result = await sendPasswordReset(email);
            console.log("Send link pressed for:", email);
            setLoading(false);

            if (result.success) {
                setAlert({ message: result.message, type: "success" });
            } else {
                setAlert({ message: result.message, type: "error" });
            }

        } catch (error) {
            console.error("Error", error)
            setLoading(false)
            setAlert({ message: "An unexpected error occurred", type: "error" });
        }

    };

    return (
        <SafeAreaView style={styles.wrapper} edges={['top', 'bottom']}>
            <TintAlert
                visible={!!alert}
                message={alert?.message || ""}
                type={alert?.type}
                onClose={() => setAlert(null)}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.slide}>
                        <Text style={styles.h1}>Forgot Password</Text>
                        <Text style={[styles.h2, { marginBottom: 24 }]}>Enter your email to reset your password</Text>

                        <TextPut
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={{ alignItems: "center", marginTop: 30, paddingBottom: 20, marginBottom: 10, width: '100%' }}>
                        <PrimaryBtn
                            title={loading ? <LoadingSpinner /> : "Send Link"}
                            onPress={handleSendLink}
                            style={{ width: "80%" }}
                        />

                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.skipText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: colors.background },
    slide: {
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    h1: {
        color: colors.primary,
        fontSize: 22,
        fontFamily: fonts.bold,
        marginBottom: 8,
    },
    h2: {
        color: colors.text,
        fontSize: 14,
        textAlign: 'center',
    },
    skipText: {
        marginTop: 10,
        fontSize: 14,
        color: colors.darkText,
    }
});
