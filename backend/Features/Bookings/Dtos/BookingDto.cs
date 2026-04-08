using System.ComponentModel.DataAnnotations;

namespace backend.Features.Bookings.Dtos;

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
    public string? PassengerNames { get; set; }
    public string? BookingClass { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public bool IsPaid { get; set; }
    public decimal? RefundAmount { get; set; }
    public DateTime? RefundedAt { get; set; }
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
}

public class CancelBookingDto
{
    [StringLength(500)]
    public string? Reason { get; set; }
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
