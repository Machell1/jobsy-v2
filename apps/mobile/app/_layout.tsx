import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/lib/auth-context";
import { queryClient } from "../src/lib/query-client";
import { StripeProvider } from "../src/providers/StripeProvider";

export default function RootLayout() {
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StripeProvider>
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
            <Stack.Screen
              name="edit-profile"
              options={{ title: "Edit Profile" }}
            />
            <Stack.Screen
              name="settings"
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="help"
              options={{ title: "Help & Support" }}
            />
            <Stack.Screen
              name="checkout/[bookingId]"
              options={{ title: "Payment", headerBackVisible: false }}
            />
            <Stack.Screen
              name="checkout/success"
              options={{ title: "Booking Confirmed", headerShown: false }}
            />
          </Stack>
        </StripeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
