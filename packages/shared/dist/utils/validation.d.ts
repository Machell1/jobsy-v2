/**
 * Validates Jamaican phone numbers.
 * Accepts formats: +1876XXXXXXX, 1876XXXXXXX, 876XXXXXXX, XXXXXXX
 */
export declare function isValidJamaicanPhone(phone: string): boolean;
export declare function isValidParish(parish: string): boolean;
/**
 * Trims whitespace and removes characters commonly used in XSS attacks.
 */
export declare function sanitizeString(str: string): string;
//# sourceMappingURL=validation.d.ts.map