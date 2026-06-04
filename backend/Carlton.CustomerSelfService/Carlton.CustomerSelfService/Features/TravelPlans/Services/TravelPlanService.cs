using Carlton.CustomerSelfService.Data;
using Carlton.CustomerSelfService.Features.TravelPlans.Dtos;
using Carlton.CustomerSelfService.Features.TravelPlans.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Carlton.CustomerSelfService.Features.TravelPlans.Services;

public class TravelPlanService : ITravelPlanService
{
    private readonly AppDbContext _db;

    public TravelPlanService(AppDbContext db)
    {
        _db = db;
    }

    // Get all plans for a specific user
    public async Task<List<TravelPlanDto>> GetAllAsync(string userId)
    {
        var plans = await _db.TravelPlans
            .Where(p => p.UserId == userId)
            .Include(p => p.Flights)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return plans.Select(MapToDto).ToList();
    }

    // Get a single plan (only if it belongs to this user)
    public async Task<TravelPlanDto?> GetByIdAsync(int id, string userId)
    {
        var plan = await _db.TravelPlans
            .Include(p => p.Flights)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        return plan == null ? null : MapToDto(plan);
    }

    // Create a new plan
    public async Task<TravelPlanDto> CreateAsync(string userId, CreateTravelPlanDto dto)
    {
        var plan = new TravelPlan
        {
            UserId = userId,
            TripName = dto.TripName,
            TripType = dto.TripType,
            CabinClass = dto.CabinClass,
            PreferredAirline = dto.PreferredAirline,
            Adults = dto.Adults,
            Children = dto.Children,
            Infants = dto.Infants,
            FromDate = dto.FromDate,
            ToDate = dto.ToDate,
            BudgetType = dto.BudgetType,
            Currency = dto.Currency,
            MaxBudget = dto.MaxBudget,
            Notes = dto.Notes,
            Flights = dto.Flights.Select(f => new TravelPlanFlight
            {
                FlightOrder = f.FlightOrder,
                DepartureAirport = f.DepartureAirport,
                ArrivalAirport = f.ArrivalAirport,
                FromDate = f.FromDate
            }).ToList()
        };

        _db.TravelPlans.Add(plan);
        await _db.SaveChangesAsync();

        return MapToDto(plan);
    }

    // Update an existing plan (only if it belongs to this user)
    public async Task<TravelPlanDto?> UpdateAsync(int id, string userId, CreateTravelPlanDto dto)
    {
        var plan = await _db.TravelPlans
            .Include(p => p.Flights)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan == null) return null;

        plan.TripName = dto.TripName;
        plan.TripType = dto.TripType;
        plan.CabinClass = dto.CabinClass;
        plan.PreferredAirline = dto.PreferredAirline;
        plan.Adults = dto.Adults;
        plan.Children = dto.Children;
        plan.Infants = dto.Infants;
        plan.FromDate = dto.FromDate;
        plan.ToDate = dto.ToDate;
        plan.BudgetType = dto.BudgetType;
        plan.Currency = dto.Currency;
        plan.MaxBudget = dto.MaxBudget;
        plan.Notes = dto.Notes;

        // Replace legs
        if (plan.Flights.Count > 0)
        {
            _db.TravelPlanFlights.RemoveRange(plan.Flights);
        }

        plan.Flights = dto.Flights.Select(f => new TravelPlanFlight
        {
            FlightOrder = f.FlightOrder,
            DepartureAirport = f.DepartureAirport,
            ArrivalAirport = f.ArrivalAirport,
            FromDate = f.FromDate
        }).ToList();

        await _db.SaveChangesAsync();
        return MapToDto(plan);
    }

    // Delete a plan (only if it belongs to this user)
    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var plan = await _db.TravelPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (plan == null) return false;

        _db.TravelPlans.Remove(plan);
        await _db.SaveChangesAsync();
        return true;
    }

    // Helper: convert a TravelPlan entity to a TravelPlanDto
    private static TravelPlanDto MapToDto(TravelPlan plan) => new()
    {
        Id = plan.Id,
        TripName = plan.TripName,
        TripType = plan.TripType,
        CabinClass = plan.CabinClass,
        PreferredAirline = plan.PreferredAirline,
        Adults = plan.Adults,
        Children = plan.Children,
        Infants = plan.Infants,
        FromDate = plan.FromDate,
        ToDate = plan.ToDate,
        BudgetType = plan.BudgetType,
        Currency = plan.Currency,
        MaxBudget = plan.MaxBudget,
        Notes = plan.Notes,
        CreatedAt = plan.CreatedAt,
        Flights = plan.Flights
            .OrderBy(f => f.FlightOrder)
            .Select(f => new TravelPlanFlightDto
        {
            Id = f.Id,
            FlightOrder = f.FlightOrder,
            DepartureAirport = f.DepartureAirport,
            ArrivalAirport = f.ArrivalAirport,
            FromDate = f.FromDate
        }).ToList()
    };
}