"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_STATUSES = exports.BOOKING_STATUS_TRANSITIONS = exports.BookingStatus = void 0;
exports.BookingStatus = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    DECLINED: "DECLINED",
    DISPUTED: "DISPUTED",
    REVIEWED: "REVIEWED",
};
exports.BOOKING_STATUS_TRANSITIONS = {
    [exports.BookingStatus.PENDING]: [
        exports.BookingStatus.ACCEPTED,
        exports.BookingStatus.DECLINED,
        exports.BookingStatus.CANCELLED,
    ],
    [exports.BookingStatus.ACCEPTED]: [
        exports.BookingStatus.IN_PROGRESS,
        exports.BookingStatus.CANCELLED,
    ],
    [exports.BookingStatus.IN_PROGRESS]: [
        exports.BookingStatus.COMPLETED,
        exports.BookingStatus.DISPUTED,
    ],
    [exports.BookingStatus.COMPLETED]: [exports.BookingStatus.REVIEWED, exports.BookingStatus.DISPUTED],
    [exports.BookingStatus.CANCELLED]: [],
    [exports.BookingStatus.DECLINED]: [],
    [exports.BookingStatus.DISPUTED]: [exports.BookingStatus.COMPLETED, exports.BookingStatus.CANCELLED],
    [exports.BookingStatus.REVIEWED]: [],
};
exports.BOOKING_STATUSES = Object.values(exports.BookingStatus);
//# sourceMappingURL=booking-status.js.map