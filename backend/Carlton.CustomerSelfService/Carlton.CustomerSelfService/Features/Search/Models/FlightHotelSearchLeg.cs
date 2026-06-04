namespace Carlton.CustomerSelfService.Features.Search.Models;

public class FlightHotelSearchLeg
{
    public string DeviceId { get; set; } = string.Empty;
    public Guid SearchId { get; set; }
    public int Sequence { get; set; }
    public string? FromLocation { get; set; }
    public string? ToLocation { get; set; }
    public DateTime? DepartureDate { get; set; }

    public FlightHotelSearch Search { get; set; } = null!;
}
