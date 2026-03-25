import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import type { User, Service, Review } from "@jobsy/shared";
import { formatCurrency, formatDate } from "@jobsy/shared";

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      const res = await apiGet<User>(`/users/${id}`);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });

  const { data: services } = useQuery({
    queryKey: ["provider-services", id],
    queryFn: async () => {
      const res = await apiGet<Service[]>(`/services?providerId=${id}`);
      return res.success ? res.data : [];
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["provider-reviews", id],
    queryFn: async () => {
      const res = await apiGet<Review[]>(`/users/${id}/reviews?limit=10`);
      return res.success ? res.data : [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>Provider not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {provider.avatarUrl ? (
          <Image
            source={{ uri: provider.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {provider.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.providerName}>{provider.name}</Text>
        {provider.parish && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#6B7280" />
            <Text style={styles.locationText}>{provider.parish}</Text>
          </View>
        )}
        {provider.bio && (
          <Text style={styles.bio}>{provider.bio}</Text>
        )}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{services?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviews?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>

      {/* Services */}
      {services && services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceItem}
              onPress={() => router.push(`/service/${service.id}`)}
              activeOpacity={0.7}
            >
              {service.images?.[0] ? (
                <Image
                  source={{ uri: service.images[0].url }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.serviceImage, styles.servicePlaceholder]}
                >
                  <Feather name="image" size={20} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle} numberOfLines={1}>
                  {service.title}
                </Text>
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>
                <Text style={styles.servicePrice}>
                  {formatCurrency(service.priceMin, service.priceCurrency)}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Feather
                      key={i}
                      name="star"
                      size={14}
                      color={i < review.rating ? "#F59E0B" : "#D1D5DB"}
                    />
                  ))}
                </View>
                <Text style={styles.reviewDate}>
                  {formatDate(review.createdAt)}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  providerName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  bio: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  servicePlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  serviceDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  reviewComment: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginTop: 8,
  },
});
