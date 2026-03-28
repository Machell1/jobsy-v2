import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { apiGet, apiPost } from "../../../src/lib/api";
import { queryClient } from "../../../src/lib/query-client";
import type { Service, Category, CreateServiceInput } from "@jobsy/shared";
import { DEFAULT_CATEGORIES } from "@jobsy/shared";

export default function NewServiceScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [parish, setParish] = useState("");
  const [address, setAddress] = useState("");
  const [tags, setTags] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiGet<Category[]>("/services/categories");
      return res.success ? res.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateServiceInput) => {
      const res = await apiPost<Service>("/services", input);
      if (!res.success) {
        throw new Error(res.error.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      Alert.alert("Success", "Your service has been created!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a service title.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description.");
      return;
    }
    if (!categoryId) {
      Alert.alert("Error", "Please select a category.");
      return;
    }
    if (!priceMin || isNaN(Number(priceMin))) {
      Alert.alert("Error", "Please enter a valid minimum price.");
      return;
    }
    if (!parish.trim()) {
      Alert.alert("Error", "Please enter a parish.");
      return;
    }

    const input: CreateServiceInput = {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priceMin: Number(priceMin),
      priceMax: priceMax ? Number(priceMax) : undefined,
      priceCurrency: "JMD",
      priceUnit: "per_service",
      parish: parish.trim(),
      address: address.trim() || undefined,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    };

    createMutation.mutate(input);
  };

  const displayCategories = categories?.length
    ? categories
    : DEFAULT_CATEGORIES.map((c, i) => ({
        id: String(i),
        name: c.name,
        slug: c.slug,
      }));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Create Service",
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
          {displayCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id ?? cat.slug}
              style={[
                styles.categoryChip,
                categoryId === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  categoryId === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.name}
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
        <TextInput
          style={styles.input}
          placeholder="e.g. Kingston"
          placeholderTextColor="#9CA3AF"
          value={parish}
          onChangeText={setParish}
        />

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
          style={[
            styles.submitButton,
            createMutation.isPending && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          activeOpacity={0.8}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Create Service</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  categoriesRow: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 4,
  },
  categoryChipActive: {
    backgroundColor: "#2563EB",
  },
  categoryChipText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  priceRow: {
    flexDirection: "row",
    gap: 12,
  },
  priceField: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
