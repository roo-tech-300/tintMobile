import TintIcon from '@/components/Icon';
import PrimaryBtn from '@/components/PrimaryBtn';
import TextPut from '@/components/TextPut';
import { borderRadius, colors, fonts } from "@/theme/theme";
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from 'expo-router';

export default function RegisterScreen() {

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>

          <Text style={styles.title}>Create Your Tint Account</Text>
          <Text style={styles.subtitle}>Join communities and connect with students</Text>

          {/* Full Name */}
          <TextPut 
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <TextPut 
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password */}
          <View style={styles.passwordContainer}>
            <TextPut
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{ flex: 1, marginBottom: 0, fontSize: 16, padding: 12 }}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <TintIcon name="eye-crossed" size={20} color={colors.primary} />
              ) : (
                <TintIcon name="eye" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.passwordContainer}>
            <TextPut
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              style={{ flex: 1, marginBottom: 0, fontSize: 16, padding: 12 }}
            />

            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? (
                <TintIcon name="eye-crossed" size={20} color={colors.primary} />
              ) : (
                <TintIcon name="eye" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <PrimaryBtn
            title="Create Account"
            onPress={() => {
              router.push("/auth/onboarding")
              // TODO: handle register logic
            }}
            style={styles.registerButton}
            textStyle={styles.registerText}
          />

          <Text style={styles.bottomText}>
            Already have an account?{' '}
            <Text 
              style={styles.link}
              onPress={() => router.push('./login')}
            >
              Login
            </Text>
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: colors.primary,
    fontSize: 22,
    marginBottom: 10,
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 30,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    marginBottom: 15,
    justifyContent: "space-between",
    paddingRight: 12,
    backgroundColor: colors.text,
    borderRadius: borderRadius.small,
  },

  registerButton: {
    width: '80%',
    marginBottom: 12,
    backgroundColor: colors.primary,
  },
  registerText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },

  bottomText: {
    color: colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
