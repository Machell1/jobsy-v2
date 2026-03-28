import { StripeProvider as NativeStripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import type { ReactNode } from "react";

const publishableKey =
  (Constants.expoConfig?.extra?.stripePublishableKey as string | undefined) ??
  "";

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
