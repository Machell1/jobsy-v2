export const BookingStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DECLINED: "DECLINED",
  DISPUTED: "DISPUTED",
  REVIEWED: "REVIEWED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> =
  {
    [BookingStatus.PENDING]: [
      BookingStatus.ACCEPTED,
      BookingStatus.DECLINED,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.ACCEPTED]: [
      BookingStatus.IN_PROGRESS,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.IN_PROGRESS]: [
      BookingStatus.COMPLETED,
      BookingStatus.DISPUTED,
    ],
    [BookingStatus.COMPLETED]: [BookingStatus.REVIEWED, BookingStatus.DISPUTED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.DECLINED]: [],
    [BookingStatus.DISPUTED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.REVIEWED]: [],
  };

export const BOOKING_STATUSES = Object.values(BookingStatus);
