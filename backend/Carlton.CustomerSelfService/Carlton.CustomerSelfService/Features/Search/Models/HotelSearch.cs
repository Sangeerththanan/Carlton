namespace Carlton.CustomerSelfService.Features.Search.Models;

public class HotelSearch
{
    public string DeviceId { get; set; } = string.Empty;
    public Guid SearchId { get; set; }
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
    public string? MealPreferences { get; set; }
    public DateTime CreatedAt { get; set; }
}
