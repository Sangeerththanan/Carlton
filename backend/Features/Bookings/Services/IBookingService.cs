using backend.Features.Bookings.Dtos;

namespace backend.Features.Bookings.Services;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetCustomerBookingsAsync(int customerId);
    Task<BookingDto?> GetBookingByIdAsync(int bookingId, int customerId);
    Task<BookingDto> CreateBookingAsync(CreateBookingDto createBookingDto, int customerId);
    Task<BookingDto> CancelBookingAsync(int bookingId, int customerId, string? reason);
    Task<IEnumerable<FlightSearchResultDto>> GetAvailableFlightsAsync(FlightSearchDto searchDto);
}
