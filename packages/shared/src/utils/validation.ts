import { JAMAICA_PARISHES } from "../constants/jamaica-parishes";

/**
 * Validates Jamaican phone numbers.
 * Accepts formats: +1876XXXXXXX, 1876XXXXXXX, 876XXXXXXX, XXXXXXX
 */
export function isValidJamaicanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return /^(\+?1)?876\d{7}$/.test(cleaned) || /^\d{7}$/.test(cleaned);
}

export function isValidParish(parish: string): boolean {
  return (JAMAICA_PARISHES as readonly string[]).includes(parish);
}

/**
 * Trims whitespace and removes characters commonly used in XSS attacks.
 */
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}
