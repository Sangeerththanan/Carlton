using System;
using System.Collections.Generic;

namespace Carlton.CustomerSelfService.Features.TravelPlans.Models;

public class TravelPlan
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  
    public string TripName { get; set; } = string.Empty;
    public string TripType { get; set; } = "MultiCity"; 
    public string CabinClass { get; set; } = "Economy";
    public string? PreferredAirline { get; set; }

    // Passenger counts
    public int Adults { get; set; } = 1;
    public int Children { get; set; } = 0;
    public int Infants { get; set; } = 0;

    // Date range
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }

    // Budget
    public string BudgetType { get; set; } = "Maximum";
    public string Currency { get; set; } = "USD";
    public decimal MaxBudget { get; set; }

    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // each plan has multiple flights
    public List<TravelPlanFlight> Flights { get; set; } = new();
}