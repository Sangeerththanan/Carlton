using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;

public class LeisurePlanLegDto
{
    public string Flag { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Days { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class LeisurePlanDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string PlanType { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string DepartureAirport { get; set; } = string.Empty;
    public string Destinations { get; set; } = string.Empty;
    public string DateRange { get; set; } = string.Empty;
    public string Passengers { get; set; } = string.Empty;
    public string HeroImage { get; set; } = string.Empty;
    public decimal EstimatedCost { get; set; }
    public decimal Budget { get; set; }
    public List<LeisurePlanLegDto> Legs { get; set; } = new();
    public List<string> Activities { get; set; } = new();
    public List<AIFlightDto> Flights { get; set; } = new();
    public List<AIHotelDto> Hotels { get; set; } = new();
    public Dictionary<string, List<AIDayDto>> Itinerary { get; set; } = new();
    public List<AIMealPlanDto> MealPlan { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public string? ConfirmedOn { get; set; }
    public string? CancelledOn { get; set; }
}

public class LeisurePlanStatsDto
{
    public int TotalPlans { get; set; }
    public int Booked { get; set; }
    public decimal TotalSaved { get; set; }
    public int PendingBookings { get; set; }
    public int CancelledPlans { get; set; }
    public int PastPlans { get; set; }
}

public class CreateLeisurePlanDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(100)]
    public string PlanType { get; set; } = string.Empty;

    [StringLength(50)]
    public string Tier { get; set; } = "Standard";

    [StringLength(200)]
    public string DepartureAirport { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Destinations { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [StringLength(200)]
    public string Passengers { get; set; } = string.Empty;

    public decimal EstimatedCost { get; set; }

    public decimal Budget { get; set; }

    public List<LeisurePlanLegDto> Legs { get; set; } = new();

    public List<string> Activities { get; set; } = new();

    public List<AIFlightDto> Flights { get; set; } = new();

    public List<AIHotelDto> Hotels { get; set; } = new();

    public Dictionary<string, List<AIDayDto>> Itinerary { get; set; } = new();

    public List<AIMealPlanDto> MealPlan { get; set; } = new();
}

public class CancelLeisurePlanDto
{
    [StringLength(500)]
    public string? Reason { get; set; }
}
public class AILeisurePlanRequestDto
{
    [Required]
    public List<AILeisurePlanDestinationDto> Destinations { get; set; } = new();

    public decimal Budget { get; set; }
    public string Currency { get; set; } = "USD";
    public string DepartureAirport { get; set; } = string.Empty;
    public List<string> LocalTransportation { get; set; } = new();
    public List<string> Experiences { get; set; } = new();
    public List<string> SpecialRequirements { get; set; } = new();
    public string AdditionalNotes { get; set; } = string.Empty;
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Adults { get; set; }
    public int Children { get; set; }
    public int Infants { get; set; }
    public List<string> MealPreferences { get; set; } = new();

    // Room Preferences
    public int SingleRooms { get; set; }
    public int TwinRooms { get; set; }
    public int DoubleRooms { get; set; }
    public int TripleRooms { get; set; }
    public int FamilyRooms { get; set; }
    public int Suites { get; set; }
    public int Dormitories { get; set; }
}

public class AILeisurePlanDestinationDto
{
    public string Country { get; set; } = string.Empty;
    public int Days { get; set; }
}

public class AIHotelSearchRequestDto
{
    [Required]
    public string City { get; set; } = string.Empty;
    public decimal BudgetPerNight { get; set; }
    public int Adults { get; set; }
    public int Children { get; set; }
    public int Infants { get; set; }
    public string Currency { get; set; } = "USD";
}

public class AIActivityOptionDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public List<AITagDto> Tags { get; set; } = new();
}

public class AIActivitySearchRequestDto
{
    [Required]
    public string City { get; set; } = string.Empty;
    public int Adults { get; set; }
    public int Children { get; set; }
}

// ─── Full AI-generated plan DTOs ──────────────────────────────────────────────

public class AIFlightDto
{
    public string Label { get; set; } = string.Empty;    // OUTBOUND / CONNECTING / RETURN
    public string Route { get; set; } = string.Empty;    // LHR → BKK
    public string Date { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Dep { get; set; } = string.Empty;
    public string Arr { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string FromCity { get; set; } = string.Empty;
    public string ToCity { get; set; } = string.Empty;
    public string Stops { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public string Price { get; set; } = string.Empty;
}

public class AIHotelDto
{
    public string City { get; set; } = string.Empty;     // e.g. "BANGKOK, THAILAND"
    public string Nights { get; set; } = string.Empty;   // e.g. "5 NIGHTS"
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Stars { get; set; }
    public string Price { get; set; } = string.Empty;    // e.g. "£180/night"
    public string Badge { get; set; } = "Best Match";
    public List<string> Amenities { get; set; } = new();
    public string ImageUrl { get; set; } = string.Empty;
}

public class AIActivitySlotDto
{
    public string Title { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public List<AITagDto> Tags { get; set; } = new();
    public string ImageUrl { get; set; } = string.Empty;
}

public class AITagDto
{
    public string Label { get; set; } = string.Empty;
    public string Color { get; set; } = "#f0e4c2";
}

public class AIDayDto
{
    public int Day { get; set; }
    public AIActivitySlotDto Morning { get; set; } = new();
    public AIActivitySlotDto Afternoon { get; set; } = new();
    public AIActivitySlotDto Evening { get; set; } = new();
}

public class AIMealPlanDto
{
    public string City { get; set; } = string.Empty;
    public string Plan { get; set; } = string.Empty;
}

public class AIFullPlanDto
{
    public string Title { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string DepartureAirport { get; set; } = string.Empty;
    public string Destinations { get; set; } = string.Empty;
    public string DateRange { get; set; } = string.Empty;
    public string Passengers { get; set; } = string.Empty;
    public string HeroImage { get; set; } = string.Empty;
    public string PlanType { get; set; } = "AI Generated";
    public string Status { get; set; } = "Pending";
    public decimal Budget { get; set; }
    public decimal EstimatedCost { get; set; }
    public List<LeisurePlanLegDto> Legs { get; set; } = new();
    public List<string> Activities { get; set; } = new();
    public List<AIFlightDto> Flights { get; set; } = new();
    public List<AIHotelDto> Hotels { get; set; } = new();
    public Dictionary<string, List<AIDayDto>> Itinerary { get; set; } = new();
    public List<AIMealPlanDto> MealPlan { get; set; } = new();
}
