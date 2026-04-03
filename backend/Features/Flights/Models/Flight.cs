using System.ComponentModel.DataAnnotations;

namespace backend.Features.Flights.Models;

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
}
