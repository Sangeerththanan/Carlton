using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Flights.Dtos;

public class FlightDto
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(10)]
    public string FlightNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Departure { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Destination { get; set; } = string.Empty;
    
    [Required]
    public DateTime DepartureTime { get; set; }
    
    [Required]
    public DateTime ArrivalTime { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int SeatsAvailable { get; set; }

    [Required]
    [MaxLength(100)]
    public string Airline { get; set; } = "Unknown Airline";

    [Required]
    [Range(0, 3)]
    public int Stops { get; set; }

    [Required]
    public bool HasCheckInBaggage { get; set; }

    [Required]
    public bool HasHandLuggage { get; set; }
}

public class CreateFlightDto
{
    [Required]
    [MaxLength(10)]
    public string FlightNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Departure { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Destination { get; set; } = string.Empty;
    
    [Required]
    public DateTime DepartureTime { get; set; }
    
    [Required]
    public DateTime ArrivalTime { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int SeatsAvailable { get; set; }

    [MaxLength(100)]
    public string? Airline { get; set; }

    [Range(0, 3)]
    public int? Stops { get; set; }

    public bool? HasCheckInBaggage { get; set; }

    public bool? HasHandLuggage { get; set; }
}

public class UpdateFlightDto
{
    [Required]
    [MaxLength(10)]
    public string FlightNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Departure { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Destination { get; set; } = string.Empty;
    
    [Required]
    public DateTime DepartureTime { get; set; }
    
    [Required]
    public DateTime ArrivalTime { get; set; }
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public int SeatsAvailable { get; set; }

    [MaxLength(100)]
    public string? Airline { get; set; }

    [Range(0, 3)]
    public int? Stops { get; set; }

    public bool? HasCheckInBaggage { get; set; }

    public bool? HasHandLuggage { get; set; }
}