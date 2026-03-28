import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centeredContainer}>
        <Feather name="user" size={48} color="#D1D5DB" />
        <Text style={styles.centeredTitle}>Sign in to view your profile</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress: () => void;
  }[] = [
    {
      icon: "edit",
      label: "Edit Profile",
      onPress: () => router.push("/edit-profile"),
    },
    ...(user.role === "PROVIDER"
      ? [
          {
            icon: "briefcase" as keyof typeof Feather.glyphMap,
            label: "Provider Dashboard",
            onPress: () => router.push("/dashboard"),
          },
          {
            icon: "dollar-sign" as keyof typeof Feather.glyphMap,
            label: "Earnings",
            onPress: () => router.push("/dashboard/earnings"),
          },
        ]
      : []),
    {
      icon: "settings",
      label: "Settings",
      onPress: () => router.push("/settings"),
    },
    {
      icon: "help-circle",
      label: "Help & Support",
      onPress: () => router.push("/help"),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <LinearGradient
        colors={["#1E40AF", "#2563EB", "#3B82F6"]}
        style={styles.profileHeader}
      >
        {user.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role.charAt(0) + user.role.slice(1).toLowerCase()}</Text>
        </View>
        {user.parish && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color="#6B7280" />
            <Text style={styles.locationText}>{user.parish}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <Feather name={item.icon} size={20} color="#374151" />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.6}
      >
        <Feather name="log-out" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Jobsy v2.0.0</Text>
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
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 28,
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuItemLabel: {
    fontSize: 15,
    color: "#111827",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 20,
  },
});
