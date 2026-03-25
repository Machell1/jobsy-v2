import { z } from "zod";

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  customerId: z.string().uuid(),
  providerId: z.string().uuid(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SUCCEEDED",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]),
  stripePaymentIntentId: z.string().optional(),
  stripeTransferId: z.string().optional(),
  platformFee: z.number().optional(),
  providerPayout: z.number().optional(),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreatePaymentIntentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
});

export const ConnectOnboardSchema = z.object({});

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;
export type ConnectOnboardInput = z.infer<typeof ConnectOnboardSchema>;
