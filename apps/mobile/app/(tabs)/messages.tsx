import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../src/hooks/useAuth";
import { apiGet } from "../../src/lib/api";
import { formatRelativeTime } from "@jobsy/shared";

type Booking = {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  status: string;
  scheduledDate: string;
  notes?: string;
  service?: { title: string; images: { url: string }[] };
  customer?: { name: string; avatarUrl?: string };
  provider?: { name: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
};

export default function MessagesScreen() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    data: bookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["bookings", "messages"],
    queryFn: async () => {
      const res = await apiGet<Booking[]>("/bookings?limit=50");
      if (!res.success) return [];
      return res.data;
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
      <View style={styles.centered}>
        <Feather name="lock" size={48} color="#D1D5DB" />
        <Text style={styles.centeredTitle}>Sign in to view messages</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const conversations = (bookings ?? []).filter(
    (b) => b.status !== "CANCELLED"
  );

  if (conversations.length === 0) {
    return (
      <View style={styles.centered}>
        <Feather name="message-circle" size={56} color="#D1D5DB" />
        <Text style={styles.centeredTitle}>No conversations yet</Text>
        <Text style={styles.centeredSubtitle}>
          When you book a service or receive a booking, your conversations will
          appear here.
        </Text>
      </View>
    );
  }

  const getOtherParty = (booking: Booking) => {
    const isProvider = user?.role === "PROVIDER";
    return isProvider ? booking.customer : booking.provider;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "#16A34A";
      case "PENDING":
        return "#F59E0B";
      case "COMPLETED":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  const renderConversation = ({ item }: { item: Booking }) => {
    const other = getOtherParty(item);
    const name = other?.name ?? "Unknown";
    const initial = name.charAt(0).toUpperCase();

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/service/${item.serviceId}`)}
        activeOpacity={0.6}
      >
        {other?.avatarUrl ? (
          <Image source={{ uri: other.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.conversationTime}>
              {formatRelativeTime(item.updatedAt)}
            </Text>
          </View>
          <Text style={styles.conversationService} numberOfLines={1}>
            {item.service?.title ?? "Service booking"}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text style={styles.statusText}>
              {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={renderConversation}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.headerNote}>
            Conversations are based on your bookings
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  listContent: { paddingBottom: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#F9FAFB" },
  centeredTitle: { fontSize: 18, fontWeight: "600", color: "#374151", marginTop: 16 },
  centeredSubtitle: { fontSize: 14, color: "#9CA3AF", textAlign: "center", marginTop: 8, lineHeight: 20 },
  primaryButton: { backgroundColor: "#2563EB", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, marginTop: 20 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  headerContainer: { paddingVertical: 12 },
  headerNote: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
  conversationItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  conversationContent: { flex: 1, marginLeft: 14 },
  conversationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  conversationName: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1 },
  conversationTime: { fontSize: 12, color: "#9CA3AF", marginLeft: 8 },
  conversationService: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, color: "#6B7280" },
});
