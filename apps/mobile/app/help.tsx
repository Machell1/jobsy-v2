import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const FAQ_ITEMS = [
  {
    q: "How do I book a service?",
    a: "Browse services on the Home or Search tab, tap on a service you like, and press 'Book Now'. Choose your preferred date, time, and add any notes for the provider.",
  },
  {
    q: "How do I become a service provider?",
    a: "Register with a Provider account, then go to your Dashboard to create service listings. Customers will be able to find and book your services.",
  },
  {
    q: "How do payments work?",
    a: "Payments are processed securely through Stripe. Customers pay when booking, and providers receive payouts after the service is completed.",
  },
  {
    q: "How do I cancel a booking?",
    a: "Go to the Bookings tab, find the booking you want to cancel, and tap 'Cancel'. Note that cancellation policies may apply depending on how close to the service date you cancel.",
  },
  {
    q: "How do I contact a provider?",
    a: "You can message providers directly through the Messages tab after making a booking. You can also view their profile and contact information.",
  },
  {
    q: "Is Jobsy available outside Jamaica?",
    a: "Currently, Jobsy is only available in Jamaica. We plan to expand to other Caribbean nations in the future.",
  },
];

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Contact */}
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => Linking.openURL("mailto:support@jobsyja.com")}
        >
          <View style={styles.contactLeft}>
            <View style={styles.iconCircle}>
              <Feather name="mail" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@jobsyja.com</Text>
            </View>
          </View>
          <Feather name="external-link" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactItem, { borderBottomWidth: 0 }]}
          onPress={() => Linking.openURL("https://www.jobsyja.com")}
        >
          <View style={styles.contactLeft}>
            <View style={styles.iconCircle}>
              <Feather name="globe" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>www.jobsyja.com</Text>
            </View>
          </View>
          <Feather name="external-link" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      <View style={styles.section}>
        {FAQ_ITEMS.map((faq, index) => (
          <View
            key={index}
            style={[
              styles.faqItem,
              index === FAQ_ITEMS.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>2.0.0</Text>
        </View>
        <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.aboutLabel}>Made in</Text>
          <Text style={styles.aboutValue}>Jamaica 🇯🇲</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginLeft: 20, marginTop: 24, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  section: { backgroundColor: "#FFFFFF", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  contactItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  contactLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 15, fontWeight: "500", color: "#111827" },
  contactValue: { fontSize: 13, color: "#6B7280", marginTop: 1 },
  faqItem: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  faqQuestion: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 6 },
  faqAnswer: { fontSize: 14, color: "#6B7280", lineHeight: 20 },
  aboutRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  aboutLabel: { fontSize: 14, color: "#6B7280" },
  aboutValue: { fontSize: 14, color: "#111827", fontWeight: "500" },
});
