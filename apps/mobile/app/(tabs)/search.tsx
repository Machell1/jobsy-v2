import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import type { Service, Category, PaginatedResponse } from "@jobsy/shared";
import { formatCurrency, DEFAULT_CATEGORIES } from "@jobsy/shared";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    params.category ?? ""
  );

  const buildQueryString = useCallback(() => {
    const parts: string[] = [];
    if (query.trim()) parts.push(`q=${encodeURIComponent(query.trim())}`);
    if (selectedCategory) parts.push(`category=${selectedCategory}`);
    parts.push("limit=20");
    return parts.length > 0 ? `?${parts.join("&")}` : "";
  }, [query, selectedCategory]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["services", "search", query, selectedCategory],
    queryFn: async () => {
      const res = await apiGet<Service[]>(`/services${buildQueryString()}`);
      return res.success ? res.data : [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiGet<Category[]>("/categories");
      return res.success ? res.data : [];
    },
  });

  const displayCategories = categories?.length
    ? categories
    : DEFAULT_CATEGORIES.map((c, i) => ({
        id: String(i),
        name: c.name,
        slug: c.slug,
      }));

  const handleSearch = () => {
    refetch();
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => router.push(`/service/${item.id}`)}
      activeOpacity={0.7}
    >
      {item.images?.[0] ? (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.serviceImage, styles.imagePlaceholder]}>
          <Feather name="image" size={24} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.serviceDetails}>
        <Text style={styles.serviceTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>
            {formatCurrency(item.priceMin, item.priceCurrency)}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color="#9CA3AF" />
            <Text style={styles.serviceLocation}>{item.parish}</Text>
          </View>
        </View>
        {item.averageRating != null && (
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {item.averageRating.toFixed(1)} ({item.totalReviews})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Feather
            name="search"
            size={18}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedCategory && styles.filterChipActive,
          ]}
          onPress={() => setSelectedCategory("")}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedCategory && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {displayCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id ?? cat.slug}
            style={[
              styles.filterChip,
              selectedCategory === cat.slug && styles.filterChipActive,
            ]}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === cat.slug ? "" : cat.slug
              )
            }
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat.slug && styles.filterChipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
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
  searchBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    height: "100%",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 4,
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
  },
  filterChipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  serviceItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  serviceImage: {
    width: 110,
    height: 120,
  },
  imagePlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  serviceDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
    lineHeight: 16,
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  serviceLocation: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#374151",
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
