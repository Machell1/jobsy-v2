export declare const ErrorCodes: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly EMAIL_EXISTS: "EMAIL_EXISTS";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED";
    readonly BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND";
    readonly INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION";
    readonly CANNOT_BOOK_OWN_SERVICE: "CANNOT_BOOK_OWN_SERVICE";
    readonly REVIEW_ALREADY_EXISTS: "REVIEW_ALREADY_EXISTS";
    readonly REVIEW_EDIT_WINDOW_CLOSED: "REVIEW_EDIT_WINDOW_CLOSED";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly STRIPE_ERROR: "STRIPE_ERROR";
    readonly UPLOAD_FAILED: "UPLOAD_FAILED";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
//# sourceMappingURL=api-error-codes.d.ts.map