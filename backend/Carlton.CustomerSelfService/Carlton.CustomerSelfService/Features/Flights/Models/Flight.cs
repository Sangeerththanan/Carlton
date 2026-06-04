using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Flights.Models;

public class Flight
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
    public int Stops { get; set; } = 0;

    [Required]
    public bool HasCheckInBaggage { get; set; } = false;

    [Required]
    public bool HasHandLuggage { get; set; } = true;
}
