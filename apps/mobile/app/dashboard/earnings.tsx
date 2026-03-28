import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import { formatCurrency, formatDate } from "@jobsy/shared";

type EarningsSummary = {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
};

type PayoutRecord = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function EarningsScreen() {
  const {
    data: summary,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["earnings-summary"],
    queryFn: async () => {
      const res = await apiGet<EarningsSummary>("/users/dashboard");
      if (res.success) return res.data;
      return {
        totalEarnings: 0,
        thisMonthEarnings: 0,
        pendingPayouts: 0,
        completedPayouts: 0,
      };
    },
  });

  const { data: payouts } = useQuery({
    queryKey: ["payouts"],
    queryFn: async () => {
      const res = await apiGet<PayoutRecord[]>("/bookings?status=COMPLETED&limit=20");
      return res.success ? res.data : [];
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Earnings",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#111827",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : (
          <>
            {/* Total Earnings Card */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(summary?.totalEarnings ?? 0)}
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Feather name="calendar" size={20} color="#2563EB" />
                <Text style={styles.statAmount}>
                  {formatCurrency(summary?.thisMonthEarnings ?? 0)}
                </Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="clock" size={20} color="#D97706" />
                <Text style={styles.statAmount}>
                  {formatCurrency(summary?.pendingPayouts ?? 0)}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Feather name="check-circle" size={20} color="#059669" />
                <Text style={styles.statAmount}>
                  {formatCurrency(summary?.completedPayouts ?? 0)}
                </Text>
                <Text style={styles.statLabel}>Paid Out</Text>
              </View>
            </View>

            {/* Payout History */}
            <Text style={styles.sectionTitle}>Payout History</Text>
            {payouts && payouts.length > 0 ? (
              payouts.map((payout) => (
                <View key={payout.id} style={styles.payoutItem}>
                  <View style={styles.payoutLeft}>
                    <Feather
                      name={
                        payout.status === "completed"
                          ? "check-circle"
                          : "clock"
                      }
                      size={18}
                      color={
                        payout.status === "completed" ? "#10B981" : "#D97706"
                      }
                    />
                    <View>
                      <Text style={styles.payoutAmount}>
                        {formatCurrency(payout.amount)}
                      </Text>
                      <Text style={styles.payoutDate}>
                        {formatDate(payout.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.payoutBadge,
                      {
                        backgroundColor:
                          payout.status === "completed"
                            ? "#D1FAE5"
                            : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.payoutBadgeText,
                        {
                          color:
                            payout.status === "completed"
                              ? "#065F46"
                              : "#92400E",
                        },
                      ]}
                    >
                      {payout.status}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="dollar-sign" size={40} color="#D1D5DB" />
                <Text style={styles.emptyText}>No payouts yet</Text>
                <Text style={styles.emptySubtext}>
                  Complete bookings to start earning
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 60,
  },
  totalCard: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  payoutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  payoutDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  payoutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  payoutBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
