using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Bookings.Dtos;

public class BookingDto
{
    public int Id { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int FlightId { get; set; }
    public string FlightNumber { get; set; } = string.Empty;
    public string Departure { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public int SeatsBooked { get; set; }
    public DateTime BookingDate { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string? SpecialRequests { get; set; }
    public string? SelectedServices { get; set; }
    public string? PassengerNames { get; set; }
    public string? PassengerDetailsJson { get; set; }
    public string? PackageMetadataJson { get; set; }
    public string? RefundMetadataJson { get; set; }
    public string? PaymentMetadataJson { get; set; }
    public string? BookingClass { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public bool IsPaid { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundedAt { get; set; }
    public bool IsCheckedIn { get; set; }
    public string? SeatNumber { get; set; }
    public DateTime? CheckedInAt { get; set; }
}

public class CreateBookingDto
{
    [Required]
    public int FlightId { get; set; }
    
    [Required]
    [Range(1, 10)]
    public int SeatsBooked { get; set; }
    
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string BookingClass { get; set; } = "Economy";
    
    [StringLength(1000)]
    public string? SpecialRequests { get; set; }
    
    [Required]
    [StringLength(255, MinimumLength = 5)]
    public string PassengerNames { get; set; } = string.Empty;

    public string? PassengerDetailsJson { get; set; }

    public string? PackageMetadataJson { get; set; }

    public string? RefundMetadataJson { get; set; }

    public string? PaymentMetadataJson { get; set; }

    [Range(1, 20)]
    public int? AdultCount { get; set; }

    [Range(0, 20)]
    public int? ChildCount { get; set; }

    [Range(0, 20)]
    public int? InfantCount { get; set; }

    public bool? IsRoundTrip { get; set; }

    [StringLength(50)]
    public string? PackageId { get; set; }

    [StringLength(50)]
    public string? RefundId { get; set; }
}

public class CancelBookingDto
{
    [StringLength(500)]
    public string? Reason { get; set; }
}

public class UpgradeSeatDto
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string NewClass { get; set; } = string.Empty;
}

public class AddServicesDto
{
    [Required]
    public List<string> Services { get; set; } = new();
}

public class FlightSearchDto
{
    public string? Departure { get; set; }
    public string? Destination { get; set; }
    public DateTime? DepartureDateFrom { get; set; }
    public DateTime? DepartureDateTo { get; set; }
    public int? MinSeatsAvailable { get; set; }
    public decimal? MaxPrice { get; set; }
}

public class FlightSearchResultDto
{
    public int Id { get; set; }
    public string FlightNumber { get; set; } = string.Empty;
    public string Departure { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public decimal Price { get; set; }
    public int SeatsAvailable { get; set; }
    public decimal PricePerSeat { get; set; }
}

public class ServicePackageOptionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal PricePerPassenger { get; set; }
    public bool TopChoice { get; set; }
    public string[] Features { get; set; } = Array.Empty<string>();
}

public class RefundOptionDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal PricePerPassenger { get; set; }
    public bool Recommended { get; set; }
    public string[] Bullets { get; set; } = Array.Empty<string>();
}

public class BookingQuoteRequestDto
{
    [Required]
    public int FlightId { get; set; }

    [Range(1, 20)]
    public int AdultCount { get; set; } = 1;

    [Range(0, 20)]
    public int ChildCount { get; set; }

    [Range(0, 20)]
    public int InfantCount { get; set; }

    public bool IsRoundTrip { get; set; }

    [StringLength(50)]
    public string CabinClass { get; set; } = "Economy";

    [StringLength(50)]
    public string? PackageId { get; set; }

    [StringLength(50)]
    public string? RefundId { get; set; }
}

public class BookingQuoteDto
{
    public int AdultCount { get; set; }
    public int ChildCount { get; set; }
    public int InfantCount { get; set; }
    public decimal AdultMultiplier { get; set; }
    public decimal ChildMultiplier { get; set; }
    public decimal InfantMultiplier { get; set; }
    public string PassengerRateRuleLabel { get; set; } = string.Empty;
    public decimal AdultSubtotal { get; set; }
    public decimal ChildSubtotal { get; set; }
    public decimal InfantSubtotal { get; set; }
    public decimal BaseFare { get; set; }
    public decimal Taxes { get; set; }
    public decimal Fees { get; set; }
    public decimal PackageChargePerPassenger { get; set; }
    public decimal PackageChargeTotal { get; set; }
    public decimal RefundChargePerPassenger { get; set; }
    public decimal RefundChargeTotal { get; set; }
    public decimal Total { get; set; }
    public int PassengerCount { get; set; }
    public int PointsEarned { get; set; }
}
