import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { Feather } from "@expo/vector-icons";
import { apiPost } from "../../src/lib/api";
import { queryClient } from "../../src/lib/query-client";

interface PaymentIntentResponse {
  clientSecret: string;
  ephemeralKey: string;
  customerId: string;
  amount: number;
  currency: string;
}

export default function CheckoutScreen() {
  const { bookingId, amount, currency } = useLocalSearchParams<{
    bookingId: string;
    amount: string;
    currency: string;
  }>();
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    void initSheet();
  }, [bookingId]);

  async function initSheet() {
    setLoading(true);
    try {
      const res = await apiPost<PaymentIntentResponse>(
        "/payments/create-intent",
        { bookingId }
      );

      if (!res.success) {
        Alert.alert("Payment Error", res.error?.message ?? "Could not initialise payment.");
        router.back();
        return;
      }

      const { clientSecret, ephemeralKey, customerId } = res.data;

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Jobsy",
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: { address: { country: "JM" } },
        appearance: {
          colors: {
            primary: "#2563EB",
            background: "#FFFFFF",
            componentBackground: "#F9FAFB",
            componentBorder: "#E5E7EB",
            componentDivider: "#E5E7EB",
            primaryText: "#111827",
            secondaryText: "#6B7280",
            componentText: "#111827",
            placeholderText: "#9CA3AF",
          },
          shapes: { borderRadius: 10 },
        },
      });

      if (error) {
        Alert.alert("Payment Error", error.message);
        router.back();
        return;
      }

      setReady(true);
    } catch {
      Alert.alert("Payment Error", "Something went wrong. Please try again.");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!ready) return;
    setPaying(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        // User cancelled — don't show an error, just let them retry
        if (error.code !== "Canceled") {
          Alert.alert("Payment Failed", error.message);
        }
        return;
      }

      // Payment succeeded
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      router.replace({
        pathname: "/checkout/success",
        params: { bookingId },
      });
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Preparing payment…</Text>
      </View>
    );
  }

  const displayAmount = amount
    ? new Intl.NumberFormat("en-JM", {
        style: "currency",
        currency: currency ?? "JMD",
      }).format(Number(amount) / 100)
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.lockRow}>
          <Feather name="lock" size={18} color="#2563EB" />
          <Text style={styles.secureText}>Secure payment powered by Stripe</Text>
        </View>

        {displayAmount && (
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount due</Text>
            <Text style={styles.amountValue}>{displayAmount}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.payButton, (!ready || paying) && styles.payButtonDisabled]}
        onPress={handlePay}
        disabled={!ready || paying}
        activeOpacity={0.8}
      >
        {paying ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.payButtonText}>
            Pay{displayAmount ? ` ${displayAmount}` : " Now"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  secureText: {
    fontSize: 13,
    color: "#6B7280",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  amountLabel: {
    fontSize: 15,
    color: "#374151",
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  payButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    fontSize: 15,
    color: "#6B7280",
  },
});
