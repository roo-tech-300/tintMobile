import TintIcon from '@/components/Icon';
import PrimaryBtn from '@/components/PrimaryBtn';
import TextPut from '@/components/TextPut';
import { borderRadius, colors, fonts } from "@/theme/theme";
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from 'expo-router';

export default function LoginScreen() {

  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <Text style={styles.title}>Welcome Back to Tint</Text>
          <Text style={styles.subtitle}>Connect And Discover Communities On Campus</Text>

          <TextPut 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail} 
          />
          
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

          <TouchableOpacity style={styles.forgotButton} >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryBtn
            title="Login"
            onPress={() => {
              // TODO: handle login
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
