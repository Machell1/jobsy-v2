import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.message ?? "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <LinearGradient
          colors={["#1E40AF", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandHeader}
        >
          <Text style={styles.logo}>Jobsy</Text>
          <Text style={styles.brandTagline}>Jamaica&apos;s Service Marketplace</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#1E40AF", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1 },
  brandHeader: {
    paddingTop: 70, paddingBottom: 40, alignItems: "center",
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  logo: { fontSize: 38, fontWeight: "900", color: "#FFFFFF", letterSpacing: -1 },
  brandTagline: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  formContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 4 },
  form: { marginTop: 24 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6, marginTop: 16 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#111827", height: "100%" },
  forgotPassword: {
    fontSize: 14, color: "#2563EB", fontWeight: "600",
    textAlign: "right", marginTop: 12,
  },
  loginButton: { borderRadius: 14, marginTop: 24, overflow: "hidden" },
  loginButtonGradient: { paddingVertical: 16, alignItems: "center", borderRadius: 14 },
  buttonDisabled: { opacity: 0.7 },
  loginButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 28, paddingBottom: 30 },
  footerText: { fontSize: 14, color: "#6B7280" },
  footerLink: { fontSize: 14, color: "#2563EB", fontWeight: "700" },
});
