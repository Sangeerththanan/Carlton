namespace Carlton.CustomerSelfService.Features.Bookings.Enums;

public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4
}

public enum PaymentStatus
{
    Pending = 1,
    Paid = 2,
    Refunded = 3,
    Failed = 4
}

public enum BookingClass
{
    Economy = 1,
    Business = 2,
    First = 3
}
