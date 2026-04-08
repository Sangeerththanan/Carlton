using backend.Features.Bookings.Dtos;
using backend.Features.Bookings.Models;
using backend.Features.Flights.Models;
using backend.Features.Login.Models;
using Microsoft.EntityFrameworkCore;
using backend.Features.Flights.Data;
using System.Text.Json;

namespace backend.Features.Bookings.Services;

public class BookingService : IBookingService
{
    private readonly FlightBookingDbContext _context;
    private readonly ILogger<BookingService> _logger;

    public BookingService(FlightBookingDbContext context, ILogger<BookingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<BookingDto>> GetCustomerBookingsAsync(int customerId)
    {
        var bookings = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .Where(b => b.CustomerId == customerId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();

        return bookings.Select(MapToBookingDto);
    }

    public async Task<BookingDto?> GetBookingByIdAsync(int bookingId, int customerId)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

        return booking != null ? MapToBookingDto(booking) : null;
    }

    public async Task<BookingDto> CreateBookingAsync(CreateBookingDto createBookingDto, int customerId)
    {
        // Validate customer exists
        var customer = await _context.Users.FindAsync(customerId);
        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found");
        }

        // Validate flight exists and has enough seats
        var flight = await _context.Flights.FindAsync(createBookingDto.FlightId);
        if (flight == null)
        {
            throw new InvalidOperationException("Flight not found");
        }

        if (flight.SeatsAvailable < createBookingDto.SeatsBooked)
        {
            throw new InvalidOperationException($"Not enough seats available. Available: {flight.SeatsAvailable}, Requested: {createBookingDto.SeatsBooked}");
        }

        // Calculate total price
        decimal totalPrice = flight.Price * createBookingDto.SeatsBooked;

        // Generate booking reference
        string bookingReference = GenerateBookingReference();

        // Create booking
        var booking = new Booking
        {
            CustomerId = customerId,
            FlightId = createBookingDto.FlightId,
            BookingReference = bookingReference,
            Status = "Confirmed",
            TotalPrice = totalPrice,
            SeatsBooked = createBookingDto.SeatsBooked,
            BookingDate = DateTime.UtcNow,
            PaymentStatus = "Pending",
            SpecialRequests = createBookingDto.SpecialRequests,
            PassengerNames = createBookingDto.PassengerNames,
            BookingClass = createBookingDto.BookingClass,
            ConfirmedAt = DateTime.UtcNow,
            IsPaid = false
        };

        // Update flight seats
        flight.SeatsAvailable -= createBookingDto.SeatsBooked;

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Bookings.Add(booking);
            _context.Flights.Update(flight);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Booking created successfully: {BookingReference}", bookingReference);
            
            // Reload with related data
            var createdBooking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Flight)
                .FirstAsync(b => b.Id == booking.Id);

            return MapToBookingDto(createdBooking);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating booking");
            throw;
        }
    }

    public async Task<BookingDto> CancelBookingAsync(int bookingId, int customerId, string? reason)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

        if (booking == null)
        {
            throw new InvalidOperationException("Booking not found");
        }

        if (booking.Status == "Cancelled")
        {
            throw new InvalidOperationException("Booking is already cancelled");
        }

        if (booking.Status == "Completed")
        {
            throw new InvalidOperationException("Cannot cancel completed booking");
        }

        // Update booking status
        booking.Status = "Cancelled";
        booking.CancelledAt = DateTime.UtcNow;
        booking.CancellationReason = reason;

        // Return seats to flight
        booking.Flight.SeatsAvailable += booking.SeatsBooked;

        // Calculate refund (70% of total price for demo purposes)
        booking.RefundAmount = booking.TotalPrice * 0.7m;
        booking.RefundedAt = DateTime.UtcNow;
        booking.PaymentStatus = "Refunded";

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _context.Bookings.Update(booking);
            _context.Flights.Update(booking.Flight);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Booking cancelled successfully: {BookingReference}", booking.BookingReference);

            return MapToBookingDto(booking);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error cancelling booking");
            throw;
        }
    }

    public async Task<IEnumerable<FlightSearchResultDto>> GetAvailableFlightsAsync(FlightSearchDto searchDto)
    {
        var query = _context.Flights.AsQueryable();

        if (!string.IsNullOrEmpty(searchDto.Departure))
        {
            query = query.Where(f => f.Departure.Contains(searchDto.Departure));
        }

        if (!string.IsNullOrEmpty(searchDto.Destination))
        {
            query = query.Where(f => f.Destination.Contains(searchDto.Destination));
        }

        if (searchDto.DepartureDateFrom.HasValue)
        {
            query = query.Where(f => f.DepartureTime >= searchDto.DepartureDateFrom.Value);
        }

        if (searchDto.DepartureDateTo.HasValue)
        {
            query = query.Where(f => f.DepartureTime <= searchDto.DepartureDateTo.Value);
        }

        if (searchDto.MinSeatsAvailable.HasValue)
        {
            query = query.Where(f => f.SeatsAvailable >= searchDto.MinSeatsAvailable.Value);
        }

        if (searchDto.MaxPrice.HasValue)
        {
            query = query.Where(f => f.Price <= searchDto.MaxPrice.Value);
        }

        var flights = await query
            .Where(f => f.SeatsAvailable > 0)
            .OrderBy(f => f.DepartureTime)
            .ToListAsync();

        return flights.Select(f => new FlightSearchResultDto
        {
            Id = f.Id,
            FlightNumber = f.FlightNumber,
            Departure = f.Departure,
            Destination = f.Destination,
            DepartureTime = f.DepartureTime,
            ArrivalTime = f.ArrivalTime,
            Price = f.Price,
            SeatsAvailable = f.SeatsAvailable,
            PricePerSeat = f.Price
        });
    }

    private static BookingDto MapToBookingDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            BookingReference = booking.BookingReference,
            CustomerId = booking.CustomerId,
            CustomerName = booking.Customer.Name,
            FlightId = booking.FlightId,
            FlightNumber = booking.Flight.FlightNumber,
            Departure = booking.Flight.Departure,
            Destination = booking.Flight.Destination,
            DepartureTime = booking.Flight.DepartureTime,
            ArrivalTime = booking.Flight.ArrivalTime,
            Status = booking.Status,
            TotalPrice = booking.TotalPrice,
            SeatsBooked = booking.SeatsBooked,
            BookingDate = booking.BookingDate,
            PaymentStatus = booking.PaymentStatus,
            SpecialRequests = booking.SpecialRequests,
            PassengerNames = booking.PassengerNames,
            BookingClass = booking.BookingClass,
            ConfirmedAt = booking.ConfirmedAt,
            CancelledAt = booking.CancelledAt,
            CancellationReason = booking.CancellationReason,
            IsPaid = booking.IsPaid,
            RefundAmount = booking.RefundAmount,
            RefundedAt = booking.RefundedAt
        };
    }

    private static string GenerateBookingReference()
    {
        // Generate booking reference in format: CA + random 8 digits
        Random random = new Random();
        return "CA" + random.Next(10000000, 99999999).ToString();
    }
}
