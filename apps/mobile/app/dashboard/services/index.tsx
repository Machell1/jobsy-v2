import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet, apiDelete } from "../../../src/lib/api";
import { useAuth } from "../../../src/hooks/useAuth";
import { queryClient } from "../../../src/lib/query-client";
import type { Service } from "@jobsy/shared";
import { formatCurrency } from "@jobsy/shared";

export default function ManageServicesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: services,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-services", user?.id],
    queryFn: async () => {
      const res = await apiGet<Service[]>(`/users/${user!.id}/services`);
      return res.success ? res.data : [];
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await apiDelete(`/services/${serviceId}`);
      if (!res.success) throw new Error("Failed to delete service");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
    },
  });

  const handleDelete = (service: Service) => {
    Alert.alert(
      "Delete Service",
      `Are you sure you want to delete "${service.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(service.id),
        },
      ]
    );
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceRow}>
        {item.images?.[0] ? (
          <Image
            source={{ uri: item.images[0].url }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.serviceImage, styles.imagePlaceholder]}>
            <Feather name="image" size={20} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.servicePrice}>
            {formatCurrency(item.priceMin, item.priceCurrency)}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isActive ? "#10B981" : "#9CA3AF" },
              ]}
            />
            <Text style={styles.statusLabel}>
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/service/${item.id}`)}
        >
          <Feather name="eye" size={16} color="#6B7280" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/dashboard/services/new?editId=${item.id}`)}
        >
          <Feather name="edit-2" size={16} color="#2563EB" />
          <Text style={[styles.actionText, { color: "#2563EB" }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Feather name="trash-2" size={16} color="#DC2626" />
          <Text style={[styles.actionText, { color: "#DC2626" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "My Services",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#111827",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/dashboard/services/new")}
              style={styles.headerAction}
            >
              <Feather name="plus" size={22} color="#2563EB" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={services ?? []}
            keyExtractor={(item) => item.id}
            renderItem={renderService}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="package" size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No services yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first service listing
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => router.push("/dashboard/services/new")}
                >
                  <Text style={styles.createButtonText}>Create Service</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerAction: {
    padding: 8,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  serviceRow: {
    flexDirection: "row",
    gap: 12,
  },
  serviceImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  imagePlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: {
    flex: 1,
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
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
  createButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
