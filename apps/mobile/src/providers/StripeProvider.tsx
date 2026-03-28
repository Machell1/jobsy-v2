import { StripeProvider as NativeStripeProvider } from "@stripe/stripe-react-native";
import type { ReactNode } from "react";

// EXPO_PUBLIC_ prefix makes this available at build time via Expo's env convention.
// Set via EAS secret: eas secret:create --scope project --name STRIPE_PUBLISHABLE_KEY --value pk_live_xxx
// The eas.json production build profile maps it to EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY.
const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

interface Props {
  children: ReactNode;
}

export function StripeProvider({ children }: Props) {
  return (
    <NativeStripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.jobsyja.app"
      urlScheme="jobsy"
    >
      {children}
    </NativeStripeProvider>
  );
}
