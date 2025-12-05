import TintIcon from '@/components/Icon';
import LoadingSpinner from '@/components/LoadingSpinner';
import PrimaryBtn from '@/components/PrimaryBtn';
import TextPut from '@/components/TextPut';
import TintAlert from '@/components/TintAlert';
import { useAuth } from '@/context/AuthContext';
import { borderRadius, colors, fonts } from "@/theme/theme";
import { parseAuthError } from '@/utils/authErrors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {

  const router = useRouter();

  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [alert, setAlert] = useState<{ message: string; type?: "error" | "success" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (email: string, password: string, name: string) => {
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);
      await register(email, password, name);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Registration failed:", error);
      const msg = parseAuthError(error);
      setErrorMessage(msg);
      setAlert({ message: msg, type: "error" });
    }
  }

  const validateForm = () => {
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!fullName.trim()) {
      setFullNameError("Full Name is required");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Email is invalid");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    return valid;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {alert ?
        <TintAlert
          message={alert?.message || ""}
          type={alert?.type}
          visible={!!alert}
          onClose={() => setAlert(null)}
        />
        : null}

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
          {fullNameError ? (
            <Text style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}>
              {fullNameError}
            </Text>
          ) : null}

          {/* Email */}
          <TextPut
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          {emailError ? (
            <Text style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}>
              {emailError}
            </Text>
          ) : null}

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
          {passwordError ? (
            <Text style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}>
              {passwordError}
            </Text>
          ) : null}

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
          {confirmPasswordError ? (
            <Text style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}>
              {confirmPasswordError}
            </Text>
          ) : null}

          {/* Register Button */}
          <PrimaryBtn
            title={loading ? <LoadingSpinner /> : "Create Account"}
            onPress={() => {
              handleRegister(email, password, fullName)
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
