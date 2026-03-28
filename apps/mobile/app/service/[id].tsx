import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import { useAuth } from "../../src/hooks/useAuth";
import type { Service, User, Review } from "@jobsy/shared";
import { formatCurrency, formatDate } from "@jobsy/shared";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [imageIndex, setImageIndex] = useState(0);

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const res = await apiGet<Service>(`/services/${id}`);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });

  const { data: provider } = useQuery({
    queryKey: ["provider", service?.providerId],
    queryFn: async () => {
      const res = await apiGet<User>(`/users/${service?.providerId}`);
      return res.success ? res.data : null;
    },
    enabled: !!service?.providerId,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await apiGet<Review[]>(`/reviews/service/${id}?limit=5`);
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

  if (!service) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="alert-circle" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>Service not found</Text>
      </View>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }
    router.push(`/book/${service.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        {service.images?.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setImageIndex(idx);
              }}
            >
              {service.images.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.url }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {service.images.length > 1 && (
              <View style={styles.dotsContainer}>
                {service.images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === imageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noImage}>
            <Feather name="image" size={48} color="#9CA3AF" />
          </View>
        )}

        {/* Service Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{service.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{service.parish}</Text>
            </View>
            {service.averageRating != null && (
              <View style={styles.ratingRow}>
                <Feather name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {service.averageRating.toFixed(1)} ({service.totalReviews}{" "}
                  reviews)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting at</Text>
            <Text style={styles.price}>
              {formatCurrency(service.priceMin, service.priceCurrency)}
            </Text>
            {service.priceMax && (
              <Text style={styles.priceRange}>
                {" "}
                - {formatCurrency(service.priceMax, service.priceCurrency)}
              </Text>
            )}
          </View>

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{service.description}</Text>

          {service.tags?.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.tagsRow}>
                {service.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Provider Info */}
        {provider && (
          <TouchableOpacity
            style={styles.providerCard}
            onPress={() => router.push(`/provider/${provider.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.providerLeft}>
              {provider.avatarUrl ? (
                <Image
                  source={{ uri: provider.avatarUrl }}
                  style={styles.providerAvatar}
                />
              ) : (
                <View
                  style={[styles.providerAvatar, styles.avatarPlaceholder]}
                >
                  <Text style={styles.avatarInitial}>
                    {provider.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.providerName}>{provider.name}</Text>
                {provider.parish && (
                  <Text style={styles.providerParish}>{provider.parish}</Text>
                )}
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionLabel}>Recent Reviews</Text>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Feather
                        key={i}
                        name="star"
                        size={14}
                        color={
                          i < review.rating ? "#F59E0B" : "#D1D5DB"
                        }
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

      {/* Book Now Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPriceLabel}>From</Text>
          <Text style={styles.footerPrice}>
            {formatCurrency(service.priceMin, service.priceCurrency)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 100,
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
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 260,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  noImage: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 16,
    gap: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
  },
  priceRange: {
    fontSize: 16,
    color: "#6B7280",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: "#374151",
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  providerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  providerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  providerParish: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  reviewsSection: {
    padding: 20,
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
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  footerPriceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
