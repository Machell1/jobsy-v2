import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import { useAuth } from "../../src/hooks/useAuth";
import type { Booking } from "@jobsy/shared";
import { formatCurrency, formatDate } from "@jobsy/shared";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#FEF3C7", text: "#92400E" },
  ACCEPTED: { bg: "#DBEAFE", text: "#1E40AF" },
  IN_PROGRESS: { bg: "#E0E7FF", text: "#3730A3" },
  COMPLETED: { bg: "#D1FAE5", text: "#065F46" },
  CANCELLED: { bg: "#FEE2E2", text: "#991B1B" },
  DECLINED: { bg: "#FEE2E2", text: "#991B1B" },
  DISPUTED: { bg: "#FDE68A", text: "#92400E" },
  REVIEWED: { bg: "#D1FAE5", text: "#065F46" },
};

export default function BookingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: bookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bookings", activeTab],
    queryFn: async () => {
      const statusParam = activeTab !== "all" ? `?status=${activeTab}` : "";
      const res = await apiGet<Booking[]>(`/bookings${statusParam}`);
      return res.success ? res.data : [];
    },
    enabled: isAuthenticated,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!isAuthenticated) {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="lock" size={48} color="#D1D5DB" />
        <Text style={styles.centeredTitle}>Sign in to view bookings</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusColor = STATUS_COLORS[item.status] ?? {
      bg: "#F3F4F6",
      text: "#374151",
    };
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/service/${item.serviceId}`)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingHeader}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
          >
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status.replace("_", " ")}
            </Text>
          </View>
          <Text style={styles.bookingDate}>
            {formatDate(item.scheduledDate)}
          </Text>
        </View>

        {item.scheduledTime && (
          <View style={styles.timeRow}>
            <Feather name="clock" size={14} color="#6B7280" />
            <Text style={styles.timeText}>{item.scheduledTime}</Text>
          </View>
        )}

        {item.notes && (
          <Text style={styles.notesText} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        <View style={styles.bookingFooter}>
          {item.totalAmount != null && (
            <Text style={styles.amountText}>
              {formatCurrency(item.totalAmount)}
            </Text>
          )}
          <Feather name="chevron-right" size={18} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Status Tabs */}
      <FlatList
        data={STATUS_TABS as unknown as (typeof STATUS_TABS)[number][]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.tabsContainer}
        renderItem={({ item: tab }) => (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Bookings List */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="calendar" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySubtitle}>
                Browse services to make your first booking
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  centeredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 4,
  },
  tabActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bookingDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  timeText: {
    fontSize: 13,
    color: "#374151",
  },
  notesText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 18,
  },
  bookingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  separator: {
    height: 12,
  },
  loader: {
    marginTop: 60,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
