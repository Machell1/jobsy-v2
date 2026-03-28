import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function CheckoutSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name="check" size={40} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>
        Your booking is confirmed. The provider will be in touch shortly.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/bookings")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>View My Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.homeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  homeButton: {
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  homeText: {
    fontSize: 15,
    color: "#6B7280",
  },
});
