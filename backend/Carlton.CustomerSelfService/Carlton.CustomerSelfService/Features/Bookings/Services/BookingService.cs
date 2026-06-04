using Carlton.CustomerSelfService.Features.Bookings.Dtos;
using Carlton.CustomerSelfService.Features.Bookings.Models;
using Carlton.CustomerSelfService.Features.Login.Data;
using Microsoft.EntityFrameworkCore;
using Carlton.CustomerSelfService.Data;
using System.Text.Json;

namespace Carlton.CustomerSelfService.Features.Bookings.Services;

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BookingService> _logger;

    public BookingService(ApplicationDbContext context, ILogger<BookingService> logger)
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

    public async Task<int> GetGuestCheckoutUserIdAsync(CancellationToken cancellationToken = default)
    {
        var id = await _context.Users.AsNoTracking()
            .Where(u => u.Username == DataSeeder.GuestCheckoutUsername)
            .Select(u => u.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (id == 0)
        {
            throw new InvalidOperationException(
                "Guest checkout is not configured. Ensure the guest_checkout user exists (run application seeding).");
        }

        return id;
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

        var passengerBreakdown = ParsePassengerBreakdown(createBookingDto.PassengerDetailsJson);
        var quoteRequest = new BookingQuoteRequestDto
        {
            FlightId = createBookingDto.FlightId,
            AdultCount = createBookingDto.AdultCount
                ?? passengerBreakdown.adultCount
                ?? Math.Max(1, createBookingDto.SeatsBooked),
            ChildCount = createBookingDto.ChildCount
                ?? passengerBreakdown.childCount
                ?? 0,
            InfantCount = createBookingDto.InfantCount
                ?? passengerBreakdown.infantCount
                ?? 0,
            IsRoundTrip = createBookingDto.IsRoundTrip ?? false,
            CabinClass = createBookingDto.BookingClass,
            PackageId = !string.IsNullOrWhiteSpace(createBookingDto.PackageId)
                ? createBookingDto.PackageId
                : ExtractStringFromJson(createBookingDto.PackageMetadataJson, "selectedPackageId"),
            RefundId = !string.IsNullOrWhiteSpace(createBookingDto.RefundId)
                ? createBookingDto.RefundId
                : ExtractStringFromJson(createBookingDto.RefundMetadataJson, "selectedRefundId"),
        };

        var quote = await GetBookingQuoteAsync(quoteRequest);
        var seatsToBook = Math.Max(1, quote.PassengerCount);

        if (flight.SeatsAvailable < seatsToBook)
        {
            throw new InvalidOperationException($"Not enough seats available. Available: {flight.SeatsAvailable}, Requested: {seatsToBook}");
        }

        // Persist the same total used in backend quote response.
        decimal totalPrice = quote.Total;

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
            SeatsBooked = seatsToBook,
            BookingDate = DateTime.UtcNow,
            PaymentStatus = "Paid",
            SpecialRequests = createBookingDto.SpecialRequests,
            PassengerNames = createBookingDto.PassengerNames,
            PassengerDetailsJson = createBookingDto.PassengerDetailsJson,
            PackageMetadataJson = createBookingDto.PackageMetadataJson,
            RefundMetadataJson = createBookingDto.RefundMetadataJson,
            PaymentMetadataJson = createBookingDto.PaymentMetadataJson,
            BookingClass = createBookingDto.BookingClass,
            ConfirmedAt = DateTime.UtcNow,
            IsPaid = true
        };

        // Update flight seats
        flight.SeatsAvailable -= seatsToBook;

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

    public async Task<BookingDto> UpgradeSeatAsync(int bookingId, int customerId, string newClass)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

        if (booking == null)
        {
            throw new InvalidOperationException("Booking not found");
        }

        if (booking.Status != "Confirmed")
        {
            throw new InvalidOperationException("Can only upgrade confirmed bookings");
        }

        if (booking.BookingClass == newClass)
        {
            return MapToBookingDto(booking); // No change needed
        }

        decimal oldClassFee = booking.BookingClass switch
        {
            "Premium Economy" => 85m * booking.SeatsBooked,
            "Business Class" => 250m * booking.SeatsBooked,
            "First Class" => 600m * booking.SeatsBooked,
            _ => 0m
        };

        decimal newClassFee = newClass switch
        {
            "Premium Economy" => 85m * booking.SeatsBooked,
            "Business Class" => 250m * booking.SeatsBooked,
            "First Class" => 600m * booking.SeatsBooked,
            _ => 0m
        };

        booking.BookingClass = newClass;
        booking.TotalPrice = booking.TotalPrice - oldClassFee + newClassFee;

        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();

        return MapToBookingDto(booking);
    }

    public async Task<BookingDto> AddServicesAsync(int bookingId, int customerId, List<string> services)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Flight)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);

        if (booking == null)
        {
            throw new InvalidOperationException("Booking not found");
        }

        if (booking.Status != "Confirmed")
        {
            throw new InvalidOperationException("Can only add services to confirmed bookings");
        }

        // Get the string corresponding to the service list
        string additionalRequests = string.Join(", ", services);
        if (string.IsNullOrEmpty(booking.SelectedServices))
        {
            booking.SelectedServices = additionalRequests;
        }
        else
        {
            booking.SelectedServices += ", " + additionalRequests;
        }

        // Add some arbitrary fee for services
        decimal servicesFee = services.Count * 25m; // Arbitrary $25 per service
        booking.TotalPrice += servicesFee;

        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();

        return MapToBookingDto(booking);
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

    public async Task<IEnumerable<ServicePackageOptionDto>> GetServicePackagesAsync()
    {
        var rows = await _context.ServicePackageCatalogItems
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .ToListAsync();

        return rows.Select(row => new ServicePackageOptionDto
        {
            Id = row.Code,
            Name = row.Name,
            PricePerPassenger = row.PricePerPassenger,
            TopChoice = row.TopChoice,
            Features = DeserializeStringArray(row.FeaturesJson)
        });
    }

    public async Task<IEnumerable<RefundOptionDto>> GetRefundOptionsAsync()
    {
        var rows = await _context.RefundOptionCatalogItems
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .ToListAsync();

        return rows.Select(row => new RefundOptionDto
        {
            Id = row.Code,
            Title = row.Title,
            PricePerPassenger = row.PricePerPassenger,
            Recommended = row.Recommended,
            Bullets = DeserializeStringArray(row.BulletsJson)
        });
    }

    public async Task<BookingQuoteDto> GetBookingQuoteAsync(BookingQuoteRequestDto quoteRequest)
    {
        var flight = await _context.Flights.FindAsync(quoteRequest.FlightId);
        if (flight == null)
        {
            throw new InvalidOperationException("Flight not found");
        }

        var adultCount = Math.Max(1, quoteRequest.AdultCount);
        var childCount = Math.Max(0, quoteRequest.ChildCount);
        var infantCount = Math.Max(0, quoteRequest.InfantCount);
        var passengerCount = adultCount + childCount + infantCount;

        var (adultMultiplier, childMultiplier, infantMultiplier, label) = GetPassengerRateRule(flight.Airline);
        var tripMultiplier = quoteRequest.IsRoundTrip ? 2m : 1m;

        var adultSubtotal = adultCount * flight.Price * adultMultiplier * tripMultiplier;
        var childSubtotal = childCount * flight.Price * childMultiplier * tripMultiplier;
        var infantSubtotal = infantCount * flight.Price * infantMultiplier * tripMultiplier;
        var baseFare = adultSubtotal + childSubtotal + infantSubtotal;

        var taxes = Math.Round(baseFare * 0.2584m, 2, MidpointRounding.AwayFromZero);
        var fees = 40m;

        var packageOption = await _context.ServicePackageCatalogItems
            .Where(x => x.IsActive)
            .FirstOrDefaultAsync(option => option.Code == quoteRequest.PackageId);
        var refundOption = await _context.RefundOptionCatalogItems
            .Where(x => x.IsActive)
            .FirstOrDefaultAsync(option => option.Code == quoteRequest.RefundId);

        var packageChargePerPassenger = packageOption?.PricePerPassenger ?? 0m;
        var refundChargePerPassenger = refundOption?.PricePerPassenger ?? 0m;
        var packageChargeTotal = packageChargePerPassenger * passengerCount;
        var refundChargeTotal = refundChargePerPassenger * passengerCount;

        var total = baseFare + taxes + fees + packageChargeTotal + refundChargeTotal;

        return new BookingQuoteDto
        {
            AdultCount = adultCount,
            ChildCount = childCount,
            InfantCount = infantCount,
            AdultMultiplier = adultMultiplier,
            ChildMultiplier = childMultiplier,
            InfantMultiplier = infantMultiplier,
            PassengerRateRuleLabel = label,
            AdultSubtotal = adultSubtotal,
            ChildSubtotal = childSubtotal,
            InfantSubtotal = infantSubtotal,
            BaseFare = baseFare,
            Taxes = taxes,
            Fees = fees,
            PackageChargePerPassenger = packageChargePerPassenger,
            PackageChargeTotal = packageChargeTotal,
            RefundChargePerPassenger = refundChargePerPassenger,
            RefundChargeTotal = refundChargeTotal,
            Total = total,
            PassengerCount = passengerCount,
            PointsEarned = (int)Math.Round(total * 0.342m, MidpointRounding.AwayFromZero),
        };
    }

    private static (decimal adultMultiplier, decimal childMultiplier, decimal infantMultiplier, string label) GetPassengerRateRule(string? airline)
    {
        var normalized = (airline ?? string.Empty).Trim().ToLowerInvariant();
        return normalized switch
        {
            "british airways" => (1m, 0.75m, 0.1m, "British Airways family fare rule"),
            "emirates" => (1m, 0.75m, 0.1m, "Emirates family fare rule"),
            "qatar airways" => (1m, 0.75m, 0.1m, "Qatar Airways family fare rule"),
            _ => (1m, 0.75m, 0.1m, "Standard family fare rule"),
        };
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
            SelectedServices = booking.SelectedServices,
            PassengerNames = booking.PassengerNames,
            PassengerDetailsJson = booking.PassengerDetailsJson,
            PackageMetadataJson = booking.PackageMetadataJson,
            RefundMetadataJson = booking.RefundMetadataJson,
            PaymentMetadataJson = booking.PaymentMetadataJson,
            BookingClass = booking.BookingClass,
            ConfirmedAt = booking.ConfirmedAt,
            CancelledAt = booking.CancelledAt,
            CancellationReason = booking.CancellationReason,
            IsPaid = booking.IsPaid,
            RefundAmount = booking.RefundAmount,
            RefundedAt = booking.RefundedAt,
            IsCheckedIn = booking.IsCheckedIn,
            SeatNumber = booking.SeatNumber,
            CheckedInAt = booking.CheckedInAt
        };
    }

    private static string GenerateBookingReference()
    {
        // Generate booking reference in format: CA + random 8 digits
        Random random = new Random();
        return "CA" + random.Next(10000000, 99999999).ToString();
    }

    private static string? ExtractStringFromJson(string? json, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind == JsonValueKind.Object
                && doc.RootElement.TryGetProperty(propertyName, out var property)
                && property.ValueKind == JsonValueKind.String)
            {
                return property.GetString();
            }
        }
        catch
        {
            // Ignore malformed metadata and continue with fallback defaults.
        }

        return null;
    }

    private static (int? adultCount, int? childCount, int? infantCount) ParsePassengerBreakdown(string? passengerDetailsJson)
    {
        if (string.IsNullOrWhiteSpace(passengerDetailsJson))
        {
            return (null, null, null);
        }

        try
        {
            using var doc = JsonDocument.Parse(passengerDetailsJson);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                return (null, null, null);
            }

            var adultCount = 0;
            var childCount = 0;
            var infantCount = 0;

            foreach (var item in doc.RootElement.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object
                    || !item.TryGetProperty("passengerType", out var typeElement)
                    || typeElement.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                var passengerType = typeElement.GetString()?.Trim().ToLowerInvariant();
                switch (passengerType)
                {
                    case "adult":
                        adultCount++;
                        break;
                    case "child":
                        childCount++;
                        break;
                    case "infant":
                        infantCount++;
                        break;
                }
            }

            if (adultCount + childCount + infantCount == 0)
            {
                return (null, null, null);
            }

            return (adultCount, childCount, infantCount);
        }
        catch
        {
            return (null, null, null);
        }
    }

    private static string[] DeserializeStringArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            return JsonSerializer.Deserialize<string[]>(json) ?? [];
        }
        catch
        {
            return [];
        }
    }
}
