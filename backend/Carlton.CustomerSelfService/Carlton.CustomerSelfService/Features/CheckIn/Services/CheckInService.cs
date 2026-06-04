using Carlton.CustomerSelfService.Data;
using Carlton.CustomerSelfService.Features.Bookings.Models;
using Carlton.CustomerSelfService.Features.CheckIn.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Carlton.CustomerSelfService.Features.CheckIn.Services;

public class CheckInService : ICheckInService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CheckInService> _logger;

    // Check-in window: opens 48 hours before departure, closes 1 hour before
    private static readonly TimeSpan CheckInOpens = TimeSpan.FromHours(48);
    private static readonly TimeSpan CheckInCloses = TimeSpan.FromHours(1);

    public CheckInService(ApplicationDbContext context, ILogger<CheckInService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CheckInBookingDto?> LookupBookingAsync(string bookingReference, string lastName)
    {
        var normalizedRef = bookingReference.Trim().ToUpperInvariant();
        var normalizedLastName = lastName.Trim().ToLowerInvariant();

        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .FirstOrDefaultAsync(b =>
                b.BookingReference.ToUpper() == normalizedRef &&
                b.Status == "Confirmed");

        if (booking == null) return null;

        // Validate last name against passenger name
        var passengerName = booking.PassengerNames ?? booking.Customer.Name;
        var nameParts = passengerName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var bookingLastName = nameParts.Last().ToLowerInvariant();

        if (bookingLastName != normalizedLastName) return null;

        return MapToCheckInDto(booking);
    }

    public async Task<IEnumerable<CheckInBookingDto>> GetUpcomingBookingsAsync(int customerId)
    {
        var now = DateTime.UtcNow;

        var bookings = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .Where(b =>
                b.CustomerId == customerId &&
                b.Status == "Confirmed" &&
                b.Flight.DepartureTime >= now)
            .OrderBy(b => b.Flight.DepartureTime)
            .ToListAsync();

        return bookings.Select(MapToCheckInDto);
    }

    public async Task<CheckInBookingDto> SubmitCheckInAsync(int bookingId, int customerId, string? seatNumber)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

        if (booking == null)
            throw new InvalidOperationException("Booking not found.");

        if (booking.Status != "Confirmed")
            throw new InvalidOperationException("Only confirmed bookings can be checked in.");

        if (booking.IsCheckedIn)
            throw new InvalidOperationException("This booking is already checked in.");

        var now = DateTime.UtcNow;
        var timeUntilDeparture = booking.Flight.DepartureTime - now;

        if (timeUntilDeparture > CheckInOpens)
            throw new InvalidOperationException($"Check-in is not open yet. It opens 48 hours before departure.");

        if (timeUntilDeparture < CheckInCloses)
            throw new InvalidOperationException("Check-in has closed. Please check in at the airport counter.");

        booking.IsCheckedIn = true;
        booking.CheckedInAt = now;
        booking.SeatNumber = seatNumber?.Trim().ToUpperInvariant();

        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Check-in completed for booking {BookingRef}, seat {Seat}",
            booking.BookingReference, booking.SeatNumber ?? "not assigned");

        return MapToCheckInDto(booking);
    }

    private static CheckInBookingDto MapToCheckInDto(Booking booking)
    {
        var now = DateTime.UtcNow;
        var timeUntilDeparture = booking.Flight.DepartureTime - now;
        var isEligible = timeUntilDeparture <= CheckInOpens && timeUntilDeparture >= CheckInCloses && !booking.IsCheckedIn;

        string windowMessage;
        if (booking.IsCheckedIn)
            windowMessage = "Already checked in";
        else if (timeUntilDeparture > CheckInOpens)
            windowMessage = $"Check-in opens in {(int)(timeUntilDeparture - CheckInOpens).TotalHours}h";
        else if (timeUntilDeparture < CheckInCloses)
            windowMessage = "Check-in closed";
        else
            windowMessage = "Check-in Open";

        return new CheckInBookingDto
        {
            Id = booking.Id,
            BookingReference = booking.BookingReference,
            PassengerName = booking.PassengerNames ?? booking.Customer.Name,
            FlightNumber = booking.Flight.FlightNumber,
            Departure = booking.Flight.Departure,
            Destination = booking.Flight.Destination,
            DepartureTime = booking.Flight.DepartureTime,
            BookingClass = booking.BookingClass,
            IsCheckedIn = booking.IsCheckedIn,
            SeatNumber = booking.SeatNumber,
            CheckedInAt = booking.CheckedInAt,
            Status = booking.Status,
            IsEligibleForCheckIn = isEligible,
            CheckInWindowMessage = windowMessage
        };
    }
}
