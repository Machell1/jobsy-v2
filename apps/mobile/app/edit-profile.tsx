import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../src/hooks/useAuth";
import { apiPatch } from "../src/lib/api";

const PARISHES = [
  "Kingston",
  "St. Andrew",
  "St. Thomas",
  "Portland",
  "St. Mary",
  "St. Ann",
  "Trelawny",
  "St. James",
  "Hanover",
  "Westmoreland",
  "St. Elizabeth",
  "Manchester",
  "Clarendon",
  "St. Catherine",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [parish, setParish] = useState(user?.parish ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [showParishPicker, setShowParishPicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiPatch("/users/profile", {
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        parish: parish || undefined,
        address: address.trim() || undefined,
      });

      if (!res.success) {
        Alert.alert("Error", res.error.message);
        return;
      }

      await refreshUser();
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Feather name="user" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Text style={styles.label}>Phone</Text>
        <View style={styles.inputContainer}>
          <Feather name="phone" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (876) 000-0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Bio</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.label}>Parish</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowParishPicker(!showParishPicker)}
        >
          <Feather name="map-pin" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <Text style={[styles.input, !parish && { color: "#9CA3AF" }]}>
            {parish || "Select your parish"}
          </Text>
          <Feather name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {showParishPicker && (
          <View style={styles.pickerList}>
            {PARISHES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.pickerItem,
                  parish === p && styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setParish(p);
                  setShowParishPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    parish === p && styles.pickerItemTextSelected,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <Feather name="home" size={18} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address (optional)"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 40 },
  avatarSection: { alignItems: "center", paddingVertical: 24, backgroundColor: "#FFFFFF" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 34, fontWeight: "700", color: "#FFFFFF" },
  form: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6, marginTop: 16 },
  inputContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, height: 50,
  },
  textAreaContainer: { height: 110, alignItems: "flex-start", paddingVertical: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#111827", height: "100%" },
  textArea: { height: 86 },
  pickerList: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 12, marginTop: 4, maxHeight: 200,
  },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  pickerItemSelected: { backgroundColor: "#EFF6FF" },
  pickerItemText: { fontSize: 14, color: "#374151" },
  pickerItemTextSelected: { color: "#2563EB", fontWeight: "600" },
  saveButton: {
    backgroundColor: "#2563EB", paddingVertical: 16, borderRadius: 12,
    alignItems: "center", marginHorizontal: 20, marginTop: 28,
  },
  buttonDisabled: { opacity: 0.7 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
