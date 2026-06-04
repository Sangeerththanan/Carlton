using System;

namespace Carlton.CustomerSelfService.Features.TravelPlans.Models;

// Each flight leg in a trip (e.g. LHR → CDG, CDG → FCD)
public class TravelPlanFlight
{
    public int Id { get; set; }
    public int TravelPlanId { get; set; }  
    public int FlightOrder { get; set; }   
    public string DepartureAirport { get; set; } = string.Empty;  
    public string ArrivalAirport { get; set; } = string.Empty;    
    public DateTime? FromDate { get; set; }

    // Navigation property back to the parent plan
    public TravelPlan TravelPlan { get; set; } = null!;
}