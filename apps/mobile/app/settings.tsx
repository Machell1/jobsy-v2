import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../src/hooks/useAuth";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(auth)/login");
            } catch {
              Alert.alert("Error", "Failed to delete account.");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Feather name="bell" size={20} color="#374151" />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={pushEnabled ? "#2563EB" : "#F3F4F6"}
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Feather name="mail" size={20} color="#374151" />
            <Text style={styles.settingLabel}>Email Notifications</Text>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={emailEnabled ? "#2563EB" : "#F3F4F6"}
          />
        </View>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <Feather name="smartphone" size={20} color="#374151" />
            <Text style={styles.settingLabel}>SMS Notifications</Text>
          </View>
          <Switch
            value={smsEnabled}
            onValueChange={setSmsEnabled}
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={smsEnabled ? "#2563EB" : "#F3F4F6"}
          />
        </View>
      </View>

      {/* Privacy */}
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.settingLeft}>
            <Feather name="lock" size={20} color="#374151" />
            <Text style={styles.settingLabel}>Change Password</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.settingLeft}>
            <Feather name="eye-off" size={20} color="#374151" />
            <Text style={styles.settingLabel}>Profile Visibility</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Account */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email ?? "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>
            {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "—"}
          </Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Account Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
      </View>

      {/* Danger */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Feather name="trash-2" size={18} color="#DC2626" />
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginLeft: 20, marginTop: 24, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  section: { backgroundColor: "#FFFFFF", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  settingLabel: { fontSize: 15, color: "#111827" },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500" },
  statusBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#16A34A" },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32, marginHorizontal: 20, paddingVertical: 14, backgroundColor: "#FEF2F2", borderRadius: 12 },
  deleteText: { fontSize: 15, fontWeight: "600", color: "#DC2626" },
});
