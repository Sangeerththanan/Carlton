namespace Carlton.CustomerSelfService.Features.Search.Models;

public class FlightSearch
{
    public string DeviceId { get; set; } = string.Empty;
    public Guid SearchId { get; set; }
    public string? FromLocation { get; set; }
    public string? ToLocation { get; set; }
    public string TripType { get; set; } = "one-way";
    public DateTime? DepartureDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public int Adults { get; set; } = 1;
    public int Children { get; set; }
    public int Infants { get; set; }
    public string? CabinClass { get; set; }
    public string? Airlines { get; set; }
    public bool DirectOnly { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<FlightSearchLeg> Legs { get; set; } = new List<FlightSearchLeg>();
}
