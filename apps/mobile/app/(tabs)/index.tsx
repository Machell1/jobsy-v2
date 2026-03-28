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
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet } from "../../src/lib/api";
import { useAuth } from "../../src/hooks/useAuth";
import type { Service, Category } from "@jobsy/shared";
import { formatCurrency, DEFAULT_CATEGORIES } from "@jobsy/shared";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");

  const {
    data: featuredServices,
    isLoading: servicesLoading,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ["services", "featured"],
    queryFn: async () => {
      const res = await apiGet<Service[]>("/services?sort=rating&limit=10");
      return res.success ? res.data : [];
    },
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiGet<Category[]>("/services/categories");
      return res.success ? res.data : [];
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchServices(), refetchCategories()]);
    setRefreshing(false);
  }, [refetchServices, refetchCategories]);

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  const getCategoryIcon = (slug: string): keyof typeof Feather.glyphMap => {
    const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
      "home-cleaning": "home",
      plumbing: "tool",
      electrical: "zap",
      landscaping: "sun",
      painting: "edit-3",
      moving: "truck",
      tutoring: "book-open",
      photography: "camera",
      catering: "coffee",
      "beauty-hair": "scissors",
      "auto-repair": "settings",
      "tech-support": "monitor",
      "pet-care": "heart",
      "fitness-training": "activity",
      "event-planning": "calendar",
      construction: "hard-drive",
      tailoring: "layers",
      other: "grid",
    };
    return iconMap[slug] ?? "grid";
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
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
        <View style={[styles.serviceImage, styles.servicePlaceholder]}>
          <Feather name="image" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.serviceParish} numberOfLines={1}>
          {item.parish}
        </Text>
        <View style={styles.serviceBottom}>
          <Text style={styles.servicePrice}>
            {formatCurrency(item.priceMin, item.priceCurrency)}
          </Text>
          {item.averageRating != null && (
            <View style={styles.ratingContainer}>
              <Feather name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {item.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const displayCategories = categories?.length
    ? categories
    : DEFAULT_CATEGORIES.map((c, i) => ({
        id: String(i),
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: i,
        isActive: true,
        createdAt: new Date(),
      }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome to Jobsy"}
          </Text>
          <Text style={styles.subtitle}>Find the best services in Jamaica</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => {}}
        >
          <Feather name="bell" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {displayCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id ?? cat.slug}
            style={styles.categoryCard}
            onPress={() =>
              router.push(`/search?category=${cat.slug}`)
            }
            activeOpacity={0.7}
          >
            <View style={styles.categoryIconContainer}>
              <Feather
                name={getCategoryIcon(cat.slug)}
                size={22}
                color="#2563EB"
              />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Featured Services */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Services</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {servicesLoading ? (
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={featuredServices ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No services found</Text>
            </View>
          }
          scrollEnabled={false}
        />
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 14,
    height: 48,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  seeAll: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    width: 76,
    marginRight: 4,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },
  servicesContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },
  serviceCard: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceImage: {
    width: "100%",
    height: 130,
  },
  servicePlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: {
    padding: 12,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  serviceParish: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  serviceBottom: {
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  loader: {
    marginVertical: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    width: "100%",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
