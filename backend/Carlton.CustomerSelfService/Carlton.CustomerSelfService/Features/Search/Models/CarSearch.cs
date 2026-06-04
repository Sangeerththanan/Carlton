namespace Carlton.CustomerSelfService.Features.Search.Models;

public class CarSearch
{
    public string DeviceId { get; set; } = string.Empty;
    public Guid SearchId { get; set; }
    public string? PickupLocation { get; set; }
    public string? ReturnLocation { get; set; }
    public DateTime? PickupDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public TimeSpan? PickupTime { get; set; }
    public TimeSpan? ReturnTime { get; set; }
    public bool DifferentReturn { get; set; }
    public bool DriverAge30To65 { get; set; }
    public DateTime CreatedAt { get; set; }
}
