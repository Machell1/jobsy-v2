import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet, apiPost, apiPatch } from "../../../src/lib/api";
import { queryClient } from "../../../src/lib/query-client";
import type { Service, Category, CreateServiceInput } from "@jobsy/shared";

const PARISHES = [
  "Kingston", "St. Andrew", "St. Thomas", "Portland", "St. Mary",
  "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland",
  "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine",
];

const PRICE_UNITS = [
  { value: "per_service", label: "Per Service" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "per_project", label: "Per Project" },
];

export default function NewServiceScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = !!editId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceUnit, setPriceUnit] = useState("per_service");
  const [parish, setParish] = useState("");
  const [address, setAddress] = useState("");
  const [tags, setTags] = useState("");
  const [showParishPicker, setShowParishPicker] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiGet<Category[]>("/services/categories");
      return res.success ? res.data : [];
    },
  });

  // Load existing service data when editing
  const { data: existingService } = useQuery({
    queryKey: ["service", editId],
    queryFn: async () => {
      const res = await apiGet<Service>(`/services/${editId}`);
      return res.success ? res.data : null;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingService) {
      setTitle(existingService.title);
      setDescription(existingService.description);
      setCategoryId(existingService.categoryId);
      setPriceMin(String(existingService.priceMin));
      setPriceMax(existingService.priceMax ? String(existingService.priceMax) : "");
      setPriceUnit(existingService.priceUnit || "per_service");
      setParish(existingService.parish);
      setAddress(existingService.address ?? "");
      setTags(existingService.tags?.join(", ") ?? "");
    }
  }, [existingService]);

  const saveMutation = useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      const res = isEditing
        ? await apiPatch<Service>(`/services/${editId}`, input)
        : await apiPost<Service>("/services", input);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      Alert.alert(
        "Success",
        isEditing ? "Service updated!" : "Service created!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return Alert.alert("Error", "Please enter a service title.");
    if (!description.trim()) return Alert.alert("Error", "Please enter a description.");
    if (!categoryId) return Alert.alert("Error", "Please select a category.");
    if (!priceMin || isNaN(Number(priceMin))) return Alert.alert("Error", "Please enter a valid minimum price.");
    if (!parish) return Alert.alert("Error", "Please select a parish.");

    const input: CreateServiceInput = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priceMin: Number(priceMin),
      priceMax: priceMax ? Number(priceMax) : undefined,
      priceCurrency: "JMD",
      priceUnit,
      parish,
      address: address.trim() || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };

    saveMutation.mutate(input);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? "Edit Service" : "Create Service",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#111827",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Professional House Cleaning"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your service in detail..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Category *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {(categories ?? []).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.categoryChipText, categoryId === cat.id && styles.categoryChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Pricing Unit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {PRICE_UNITS.map((pu) => (
            <TouchableOpacity
              key={pu.value}
              style={[styles.categoryChip, priceUnit === pu.value && styles.categoryChipActive]}
              onPress={() => setPriceUnit(pu.value)}
            >
              <Text style={[styles.categoryChipText, priceUnit === pu.value && styles.categoryChipTextActive]}>
                {pu.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.priceRow}>
          <View style={styles.priceField}>
            <Text style={styles.label}>Min Price (JMD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="5000"
              placeholderTextColor="#9CA3AF"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.priceField}>
            <Text style={styles.label}>Max Price (JMD)</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor="#9CA3AF"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Parish *</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowParishPicker(!showParishPicker)}
        >
          <Feather name="map-pin" size={18} color="#6B7280" />
          <Text style={[styles.pickerText, !parish && { color: "#9CA3AF" }]}>
            {parish || "Select parish"}
          </Text>
          <Feather name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        {showParishPicker && (
          <View style={styles.pickerList}>
            {PARISHES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.pickerItem, parish === p && styles.pickerItemActive]}
                onPress={() => { setParish(p); setShowParishPicker(false); }}
              >
                <Text style={[styles.pickerItemText, parish === p && { color: "#2563EB", fontWeight: "600" }]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Street address (optional)"
          placeholderTextColor="#9CA3AF"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Tags (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. cleaning, residential, deep-clean"
          placeholderTextColor="#9CA3AF"
          value={tags}
          onChangeText={setTags}
        />

        <TouchableOpacity
          style={[styles.submitButton, saveMutation.isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={saveMutation.isPending}
          activeOpacity={0.8}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? "Update Service" : "Create Service"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827" },
  textArea: { height: 120, paddingTop: 12 },
  categoriesRow: { gap: 8, paddingVertical: 4 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F3F4F6", marginRight: 4 },
  categoryChipActive: { backgroundColor: "#2563EB" },
  categoryChipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  categoryChipTextActive: { color: "#FFFFFF" },
  priceRow: { flexDirection: "row", gap: 12 },
  priceField: { flex: 1 },
  pickerButton: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  pickerText: { flex: 1, fontSize: 15, color: "#111827" },
  pickerList: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, marginTop: 4, maxHeight: 200 },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  pickerItemActive: { backgroundColor: "#EFF6FF" },
  pickerItemText: { fontSize: 14, color: "#374151" },
  submitButton: { backgroundColor: "#2563EB", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 28 },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
