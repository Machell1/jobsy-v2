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
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { apiGet } from "../../src/lib/api";
import { useAuth } from "../../src/hooks/useAuth";
import type { Service, Category } from "@jobsy/shared";
import { formatCurrency, DEFAULT_CATEGORIES } from "@jobsy/shared";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.6;

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

  const getCategoryColor = (index: number): string[] => {
    const palettes = [
      ["#EFF6FF", "#2563EB"],
      ["#FEF3C7", "#D97706"],
      ["#ECFDF5", "#059669"],
      ["#FEE2E2", "#DC2626"],
      ["#F3E8FF", "#7C3AED"],
      ["#FFF7ED", "#EA580C"],
      ["#E0F2FE", "#0284C7"],
      ["#FCE7F3", "#DB2777"],
      ["#F0FDF4", "#16A34A"],
    ];
    return palettes[index % palettes.length];
  };

  const renderServiceCard = ({ item, index }: { item: Service; index: number }) => (
    <TouchableOpacity
      style={[styles.serviceCard, index === 0 && { marginLeft: 20 }]}
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
        <LinearGradient
          colors={["#E0E7FF", "#C7D2FE"]}
          style={[styles.serviceImage, styles.servicePlaceholder]}
        >
          <Feather name="briefcase" size={28} color="#6366F1" />
        </LinearGradient>
      )}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.serviceMetaRow}>
          <Feather name="map-pin" size={11} color="#9CA3AF" />
          <Text style={styles.serviceParish} numberOfLines={1}>
            {item.parish}
          </Text>
        </View>
        <View style={styles.serviceBottom}>
          <View style={styles.priceBadge}>
            <Text style={styles.servicePrice}>
              {formatCurrency(item.priceMin, item.priceCurrency)}
            </Text>
          </View>
          {item.averageRating != null && (
            <View style={styles.ratingContainer}>
              <Feather name="star" size={11} color="#F59E0B" />
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

  const SkeletonCard = () => (
    <View style={[styles.serviceCard, { marginLeft: 20 }]}>
      <View style={[styles.serviceImage, { backgroundColor: "#F3F4F6" }]} />
      <View style={styles.serviceInfo}>
        <View style={{ height: 14, backgroundColor: "#F3F4F6", borderRadius: 6, width: "80%" }} />
        <View style={{ height: 10, backgroundColor: "#F3F4F6", borderRadius: 6, width: "50%", marginTop: 8 }} />
        <View style={{ height: 12, backgroundColor: "#EFF6FF", borderRadius: 6, width: "40%", marginTop: 10 }} />
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <LinearGradient
        colors={["#1E40AF", "#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome to"}
            </Text>
            <Text style={styles.brandName}>
              {user ? "Jobsy" : "Jobsy"}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Feather name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>
          Jamaica&apos;s Service Marketplace
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="What service do you need?"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {displayCategories.slice(0, 10).map((cat, index) => {
          const [bgColor, iconColor] = getCategoryColor(index);
          return (
            <TouchableOpacity
              key={cat.id ?? cat.slug}
              style={styles.categoryCard}
              onPress={() => router.push(`/search?category=${cat.slug}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: bgColor }]}>
                <Feather
                  name={getCategoryIcon(cat.slug)}
                  size={22}
                  color={iconColor}
                />
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured Services */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Services</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {servicesLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      ) : (featuredServices ?? []).length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Feather name="briefcase" size={28} color="#93C5FD" />
          </View>
          <Text style={styles.emptyTitle}>No services yet</Text>
          <Text style={styles.emptyText}>
            Be the first to list a service on Jobsy
          </Text>
        </View>
      ) : (
        <FlatList
          data={featuredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
          scrollEnabled
        />
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/search")}
          >
            <LinearGradient
              colors={["#EFF6FF", "#DBEAFE"]}
              style={styles.quickActionIcon}
            >
              <Feather name="search" size={20} color="#2563EB" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Find Services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/bookings")}
          >
            <LinearGradient
              colors={["#ECFDF5", "#D1FAE5"]}
              style={styles.quickActionIcon}
            >
              <Feather name="calendar" size={20} color="#059669" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/messages")}
          >
            <LinearGradient
              colors={["#FEF3C7", "#FDE68A"]}
              style={styles.quickActionIcon}
            >
              <Feather name="message-circle" size={20} color="#D97706" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <LinearGradient
              colors={["#F3E8FF", "#E9D5FF"]}
              style={styles.quickActionIcon}
            >
              <Feather name="user" size={20} color="#7C3AED" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingBottom: 24 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: { fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  brandName: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  notificationBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 14,
    marginTop: 18, paddingHorizontal: 14, height: 50,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", marginLeft: 10, height: "100%" },

  // Sections
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20,
    marginTop: 24, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  seeAll: { fontSize: 14, color: "#2563EB", fontWeight: "600" },

  // Categories
  categoriesContainer: { paddingHorizontal: 20, gap: 12 },
  categoryCard: { alignItems: "center", width: 72 },
  categoryIconContainer: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  categoryName: { fontSize: 11, color: "#4B5563", textAlign: "center", fontWeight: "500" },

  // Services
  servicesContainer: { paddingRight: 20, gap: 14 },
  serviceCard: {
    width: CARD_WIDTH, backgroundColor: "#FFFFFF", borderRadius: 16,
    overflow: "hidden", marginRight: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  serviceImage: { width: "100%", height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  servicePlaceholder: { alignItems: "center", justifyContent: "center" },
  serviceInfo: { padding: 14 },
  serviceTitle: { fontSize: 15, fontWeight: "600", color: "#111827", lineHeight: 20 },
  serviceMetaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  serviceParish: { fontSize: 12, color: "#9CA3AF" },
  serviceBottom: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 10,
  },
  priceBadge: {
    backgroundColor: "#EFF6FF", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 8,
  },
  servicePrice: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 12, fontWeight: "600", color: "#374151" },

  // Empty State
  emptyState: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginTop: 14 },
  emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 4 },

  // Quick Actions
  quickActionsSection: { paddingHorizontal: 20, marginTop: 24 },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 },
  quickAction: {
    width: (SCREEN_WIDTH - 52) / 2, backgroundColor: "#FFFFFF",
    borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  quickActionIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  quickActionLabel: { fontSize: 14, fontWeight: "600", color: "#374151" },

  loader: { marginVertical: 40 },
});
