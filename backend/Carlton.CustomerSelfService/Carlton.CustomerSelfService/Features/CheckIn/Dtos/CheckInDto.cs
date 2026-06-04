using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.CheckIn.Dtos;

public class CheckInLookupRequestDto
{
    [Required]
    [StringLength(20, MinimumLength = 3)]
    public string BookingReference { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string LastName { get; set; } = string.Empty;
}

public class CheckInSubmitDto
{
    [Required]
    public int BookingId { get; set; }

    [StringLength(10)]
    public string? SeatNumber { get; set; }
}

public class CheckInBookingDto
{
    public int Id { get; set; }
    public string BookingReference { get; set; } = string.Empty;
    public string PassengerName { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string Departure { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public string? BookingClass { get; set; }
    public bool IsCheckedIn { get; set; }
    public string? SeatNumber { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsEligibleForCheckIn { get; set; }
    public string CheckInWindowMessage { get; set; } = string.Empty;
}
