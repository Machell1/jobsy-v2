export declare const BookingStatus: {
    readonly PENDING: "PENDING";
    readonly ACCEPTED: "ACCEPTED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
    readonly DECLINED: "DECLINED";
    readonly DISPUTED: "DISPUTED";
    readonly REVIEWED: "REVIEWED";
};
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
export declare const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]>;
export declare const BOOKING_STATUSES: ("PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED" | "REVIEWED")[];
//# sourceMappingURL=booking-status.d.ts.map