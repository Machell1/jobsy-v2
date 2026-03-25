import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import { useAuth } from "../../src/hooks/useAuth";
import type { Booking } from "@jobsy/shared";
import { formatCurrency } from "@jobsy/shared";

type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "PROVIDER") {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="lock" size={48} color="#D1D5DB" />
        <Text style={styles.centeredTitle}>Provider Access Required</Text>
        <Text style={styles.centeredSubtitle}>
          This dashboard is only available to service providers.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.primaryButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await apiGet<DashboardStats>("/provider/dashboard/stats");
      if (res.success) return res.data;
      return {
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
      };
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["dashboard-recent-bookings"],
    queryFn: async () => {
      const res = await apiGet<Booking[]>(
        "/bookings?role=provider&limit=5&sort=newest"
      );
      return res.success ? res.data : [];
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statCards = [
    {
      label: "Total Bookings",
      value: String(stats?.totalBookings ?? 0),
      icon: "calendar" as const,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      label: "Pending",
      value: String(stats?.pendingBookings ?? 0),
      icon: "clock" as const,
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      label: "Completed",
      value: String(stats?.completedBookings ?? 0),
      icon: "check-circle" as const,
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      label: "Earnings",
      value: formatCurrency(stats?.totalEarnings ?? 0),
      icon: "dollar-sign" as const,
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Dashboard",
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
        <Text style={styles.greeting}>
          Welcome, {user.name.split(" ")[0]}
        </Text>

        {/* Stats Grid */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
              <View
                key={stat.label}
                style={[styles.statCard, { backgroundColor: stat.bg }]}
              >
                <Feather name={stat.icon} size={22} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/dashboard/services/new")}
          >
            <Feather name="plus-circle" size={24} color="#2563EB" />
            <Text style={styles.actionLabel}>New Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/dashboard/services")}
          >
            <Feather name="list" size={24} color="#2563EB" />
            <Text style={styles.actionLabel}>My Services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/dashboard/earnings")}
          >
            <Feather name="trending-up" size={24} color="#2563EB" />
            <Text style={styles.actionLabel}>Earnings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings */}
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {recentBookings && recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingItem}>
              <View style={styles.bookingLeft}>
                <Text style={styles.bookingStatus}>
                  {booking.status.replace("_", " ")}
                </Text>
                {booking.totalAmount != null && (
                  <Text style={styles.bookingAmount}>
                    {formatCurrency(booking.totalAmount)}
                  </Text>
                )}
              </View>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent bookings</Text>
          </View>
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
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  centeredTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  centeredSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  loader: {
    marginVertical: 40,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 14,
    alignItems: "flex-start",
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  bookingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  bookingLeft: {
    gap: 2,
  },
  bookingStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  bookingAmount: {
    fontSize: 13,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
