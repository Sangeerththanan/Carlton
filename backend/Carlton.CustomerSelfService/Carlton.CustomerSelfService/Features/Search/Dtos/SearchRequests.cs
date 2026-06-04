using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Search.Dtos;

public class FlightSearchLegDto
{
    public string? From { get; set; }
    public string? To { get; set; }
    public DateTime? DepartureDate { get; set; }
}

public class FlightSearchRequestDto
{
    [Required]
    [MaxLength(128)]
    public string DeviceId { get; set; } = string.Empty;

    public string? From { get; set; }
    public string? To { get; set; }
    public string TripType { get; set; } = "one-way";
    public DateTime? DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public int Adults { get; set; } = 1;
    public int Children { get; set; }
    public int Infants { get; set; }
    public string? CabinClass { get; set; }
    public string? Airlines { get; set; }
    public bool DirectOnly { get; set; }
    public List<FlightSearchLegDto> Legs { get; set; } = new();
}

public class HotelSearchRequestDto
{
    [Required]
    [MaxLength(128)]
    public string DeviceId { get; set; } = string.Empty;

    public string? Destination { get; set; }
    public DateTime? CheckInDate { get; set; }
    public DateTime? CheckOutDate { get; set; }
    public int Adults { get; set; } = 1;
    public int Children { get; set; }
    public int Infants { get; set; }
    public int RoomsStandard { get; set; }
    public int RoomsDeluxe { get; set; }
    public int RoomsSuite { get; set; }
    public int RoomsFamily { get; set; }
    public List<string> MealPreferences { get; set; } = new();
}

public class FlightHotelSearchRequestDto
{
    [Required]
    [MaxLength(128)]
    public string DeviceId { get; set; } = string.Empty;

    public string? From { get; set; }
    public string? To { get; set; }
    public string TripType { get; set; } = "round-trip";
    public DateTime? DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public int Adults { get; set; } = 1;
    public int Children { get; set; }
    public int Infants { get; set; }
    public string? Airlines { get; set; }
    public List<string> MealPreferences { get; set; } = new();
    public bool DirectOnly { get; set; }
    public List<FlightSearchLegDto> Legs { get; set; } = new();
}

public class CarSearchRequestDto
{
    [Required]
    [MaxLength(128)]
    public string DeviceId { get; set; } = string.Empty;

    public string? PickupLocation { get; set; }
    public string? ReturnLocation { get; set; }
    public DateTime? PickupDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string? PickupTime { get; set; }
    public string? ReturnTime { get; set; }
    public bool DifferentReturn { get; set; }
    public bool DriverAge30To65 { get; set; }
}
