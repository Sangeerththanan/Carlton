using System;
using System.Collections.Generic;

namespace Carlton.CustomerSelfService.Features.TravelPlans.Dtos;

// What we SEND to the frontend (response)
public class TravelPlanDto
{
    public int Id { get; set; }
    public string TripName { get; set; } = string.Empty;
    public string TripType { get; set; } = string.Empty;
    public string CabinClass { get; set; } = string.Empty;
    public string? PreferredAirline { get; set; }
    public int Adults { get; set; }
    public int Children { get; set; }
    public int Infants { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string BudgetType { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal MaxBudget { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TravelPlanFlightDto> Flights { get; set; } = new();
}

// What we RECEIVE from the frontend (request body)
public class CreateTravelPlanDto
{
    public string TripName { get; set; } = string.Empty;
    public string TripType { get; set; } = "MultiCity";
    public string CabinClass { get; set; } = "Economy";
    public string? PreferredAirline { get; set; }
    public int Adults { get; set; } = 1;
    public int Children { get; set; } = 0;
    public int Infants { get; set; } = 0;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string BudgetType { get; set; } = "Maximum";
    public string Currency { get; set; } = "USD";
    public decimal MaxBudget { get; set; }
    public string? Notes { get; set; }
    public List<CreateTravelPlanFlightDto> Flights { get; set; } = new();
}

public class TravelPlanFlightDto
{
    public int Id { get; set; }
    public int FlightOrder { get; set; }
    public string DepartureAirport { get; set; } = string.Empty;
    public string ArrivalAirport { get; set; } = string.Empty;
    public DateTime? FromDate { get; set; }
}

public class CreateTravelPlanFlightDto
{
    public int FlightOrder { get; set; }
    public string DepartureAirport { get; set; } = string.Empty;
    public string ArrivalAirport { get; set; } = string.Empty;
    public DateTime? FromDate { get; set; }
}