using Carlton.CustomerSelfService.Features.Bookings.Dtos;

namespace Carlton.CustomerSelfService.Features.Bookings.Services;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetCustomerBookingsAsync(int customerId);
    Task<BookingDto?> GetBookingByIdAsync(int bookingId, int customerId);
    Task<BookingDto> CreateBookingAsync(CreateBookingDto createBookingDto, int customerId);
    Task<int> GetGuestCheckoutUserIdAsync(CancellationToken cancellationToken = default);
    Task<BookingDto> CancelBookingAsync(int bookingId, int customerId, string? reason);
    Task<BookingDto> UpgradeSeatAsync(int bookingId, int customerId, string newClass);
    Task<BookingDto> AddServicesAsync(int bookingId, int customerId, List<string> services);
    Task<IEnumerable<FlightSearchResultDto>> GetAvailableFlightsAsync(FlightSearchDto searchDto);
    Task<IEnumerable<ServicePackageOptionDto>> GetServicePackagesAsync();
    Task<IEnumerable<RefundOptionDto>> GetRefundOptionsAsync();
    Task<BookingQuoteDto> GetBookingQuoteAsync(BookingQuoteRequestDto quoteRequest);
}
