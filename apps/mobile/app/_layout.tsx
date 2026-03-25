import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/lib/auth-context";
import { queryClient } from "../src/lib/query-client";

export default function RootLayout() {
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#FFFFFF" },
            headerTintColor: "#111827",
            headerTitleStyle: { fontWeight: "600" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="service/[id]"
            options={{ title: "Service Details" }}
          />
          <Stack.Screen
            name="book/[serviceId]"
            options={{ title: "Book Service" }}
          />
          <Stack.Screen
            name="provider/[id]"
            options={{ title: "Provider Profile" }}
          />
          <Stack.Screen
            name="dashboard"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
