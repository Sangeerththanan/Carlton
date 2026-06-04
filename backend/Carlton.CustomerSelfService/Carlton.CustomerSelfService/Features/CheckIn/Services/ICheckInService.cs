using Carlton.CustomerSelfService.Features.CheckIn.Dtos;

namespace Carlton.CustomerSelfService.Features.CheckIn.Services;

public interface ICheckInService
{
    /// <summary>Look up a booking by booking reference + passenger last name (for the check-in form).</summary>
    Task<CheckInBookingDto?> LookupBookingAsync(string bookingReference, string lastName);

    /// <summary>Get all confirmed, upcoming bookings for a customer that are eligible or upcoming for check-in.</summary>
    Task<IEnumerable<CheckInBookingDto>> GetUpcomingBookingsAsync(int customerId);

    /// <summary>Submit check-in for a booking, optionally saving a seat number.</summary>
    Task<CheckInBookingDto> SubmitCheckInAsync(int bookingId, int customerId, string? seatNumber);
}
