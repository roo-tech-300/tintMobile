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


export default function LoginScreen() {

  const router = useRouter();
  const { login } = useAuth();


  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [alert, setAlert] = useState<{ message: string; type?: "error" | "success" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const isValid = validateForm();
    if (!isValid) return;
    try {
      setLoading(true);
      await login(email, password);
      console.log("Login successful");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
      const msg = parseAuthError(error);
      setErrorMessage(msg);
      setAlert({ message: msg, type: "error" });
    }
  }

  const validateForm = () => {
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError('');
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required")
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Email is invalid")
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required")
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
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
          <Text style={styles.title}>Welcome Back to Tint</Text>
          <Text style={styles.subtitle}>Connect And Discover Communities In FUT Minna</Text>

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

          <View style={styles.passwordContainer}>
            <TextPut
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{ flex: 1, marginBottom: 0, fontSize: 16, padding: 12 }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <TintIcon name="eye-crossed" size={20} color={colors.primary} /> : <TintIcon name="eye" size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={{ color: "red", alignSelf: "flex-start", marginBottom: 10 }}>
              {passwordError}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('./forgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryBtn
            title={loading ? <LoadingSpinner /> : "Login"}
            onPress={() => {
              handleLogin(email, password);
            }}
            style={styles.loginButton}
            textStyle={styles.loginText}
          />

          <Text style={styles.bottomText}>
            Don't have an account?{' '}
            <Text
              style={styles.link}
              onPress={() => router.push('./register')}
            >
              Sign Up
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
    backgroundColor: colors.background, // dark purple
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
  input: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.small,
    padding: 12,
    height: 50,
    fontSize: 16,
    color: colors.black,
    fontFamily: fonts.regular,
    width: '100%',
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    marginBottom: 10,
    justifyContent: "space-between",
    paddingRight: 12,
    backgroundColor: colors.text,
    borderRadius: borderRadius.small,
  },
  icon: {
    color: colors.darkText,
    height: 20,
    paddingHorizontal: 10,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: colors.darkText,
    fontSize: 12,
  },
  loginButton: {
    width: '80%',
    marginBottom: 12,
    // PrimaryBtn already sets padding, borderRadius and backgroundColor,
    // but we keep backgroundColor here to ensure the same accent if needed.
    backgroundColor: colors.primary,
  },
  loginText: {
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
