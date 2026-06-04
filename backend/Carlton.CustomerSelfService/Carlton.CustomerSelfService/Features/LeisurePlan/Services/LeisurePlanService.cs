using Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;
using Carlton.CustomerSelfService.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Services;

public class LeisurePlanService : ILeisurePlanService
{
    private readonly ApplicationDbContext _context;
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<LeisurePlanService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public LeisurePlanService(ApplicationDbContext context, IOpenAIService openAIService, ILogger<LeisurePlanService> logger)
    {
        _context = context;
        _openAIService = openAIService;
        _logger = logger;
    }

    public async Task<LeisurePlanStatsDto> GetStatsAsync(int userId)
    {
        var plans = await _context.LeisurePlans
            .Where(p => p.CustomerId == userId)
            .ToListAsync();

        var now = DateTime.UtcNow;

        // Auto-classify plans that have passed their end date as "Past"
        var booked = plans.Count(p => p.Status == "Confirmed" && p.EndDate >= now);
        var totalPlans = plans.Count;
        var pendingBookings = plans.Count(p => p.Status == "Pending");
        var cancelledPlans = plans.Count(p => p.Status == "Cancelled");
        var pastPlans = plans.Count(p => p.Status == "Confirmed" && p.EndDate < now);

        // TotalSaved = sum of (Budget - EstimatedCost) for plans where budget > cost
        var totalSaved = plans
            .Where(p => p.Budget > p.EstimatedCost)
            .Sum(p => p.Budget - p.EstimatedCost);

        return new LeisurePlanStatsDto
        {
            TotalPlans = totalPlans,
            Booked = booked,
            TotalSaved = totalSaved,
            PendingBookings = pendingBookings,
            CancelledPlans = cancelledPlans,
            PastPlans = pastPlans,
        };
    }

    public async Task<IEnumerable<LeisurePlanDto>> GetPlansAsync(int userId, string? status = null)
    {
        var now = DateTime.UtcNow;

        var query = _context.LeisurePlans
            .Where(p => p.CustomerId == userId);

        // Filter by logical status
        query = status switch
        {
            "Confirmed" => query.Where(p => p.Status == "Confirmed" && p.EndDate >= now),
            "Past"      => query.Where(p => p.Status == "Confirmed" && p.EndDate < now),
            "Cancelled" => query.Where(p => p.Status == "Cancelled"),
            "Pending"   => query.Where(p => p.Status == "Pending"),
            _           => query
        };

        var plans = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return plans.Select(MapToDto);
    }

    public async Task<LeisurePlanDto> CreatePlanAsync(CreateLeisurePlanDto dto, int userId)
    {
        var customer = await _context.Users.FindAsync(userId);
        if (customer == null)
            throw new InvalidOperationException("Customer not found");

        var plan = new Models.LeisurePlan
        {
            CustomerId = userId,
            Title = dto.Title,
            PlanType = dto.PlanType,
            Tier = dto.Tier,
            Status = "Pending",
            DepartureAirport = dto.DepartureAirport,
            Destinations = dto.Destinations,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Passengers = dto.Passengers,
            EstimatedCost = dto.EstimatedCost,
            Budget = dto.Budget,
            LegsJson = JsonSerializer.Serialize(dto.Legs),
            ActivitiesJson = JsonSerializer.Serialize(dto.Activities),
            FlightsJson = JsonSerializer.Serialize(dto.Flights),
            HotelsJson = JsonSerializer.Serialize(dto.Hotels),
            ItineraryJson = JsonSerializer.Serialize(dto.Itinerary),
            MealPlanJson = JsonSerializer.Serialize(dto.MealPlan),
            CreatedAt = DateTime.UtcNow
        };

        _context.LeisurePlans.Add(plan);
        await _context.SaveChangesAsync();

        return MapToDto(plan);
    }

    public async Task<LeisurePlanDto> UpdatePlanAsync(int planId, CreateLeisurePlanDto dto, int userId)
    {
        var plan = await _context.LeisurePlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.CustomerId == userId);

        if (plan == null)
            throw new InvalidOperationException("Leisure plan not found");

        plan.Title = dto.Title;
        plan.PlanType = dto.PlanType;
        plan.Tier = dto.Tier;
        plan.DepartureAirport = dto.DepartureAirport;
        plan.Destinations = dto.Destinations;
        plan.StartDate = dto.StartDate;
        plan.EndDate = dto.EndDate;
        plan.Passengers = dto.Passengers;
        plan.EstimatedCost = dto.EstimatedCost;
        plan.Budget = dto.Budget;
        plan.LegsJson = JsonSerializer.Serialize(dto.Legs);
        plan.ActivitiesJson = JsonSerializer.Serialize(dto.Activities);
        plan.FlightsJson = JsonSerializer.Serialize(dto.Flights);
        plan.HotelsJson = JsonSerializer.Serialize(dto.Hotels);
        plan.ItineraryJson = JsonSerializer.Serialize(dto.Itinerary);
        plan.MealPlanJson = JsonSerializer.Serialize(dto.MealPlan);

        _context.LeisurePlans.Update(plan);
        await _context.SaveChangesAsync();

        _logger.LogInformation("LeisurePlan {PlanId} updated for user {UserId}", planId, userId);

        return MapToDto(plan);
    }

    public async Task<LeisurePlanDto> ConfirmPlanAsync(int planId, int userId)
    {
        var plan = await _context.LeisurePlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.CustomerId == userId);

        if (plan == null)
            throw new InvalidOperationException("Leisure plan not found");

        if (plan.Status == "Confirmed")
            throw new InvalidOperationException("Plan is already confirmed");

        plan.Status = "Confirmed";
        plan.ConfirmedAt = DateTime.UtcNow;

        _context.LeisurePlans.Update(plan);
        await _context.SaveChangesAsync();

        _logger.LogInformation("LeisurePlan {PlanId} confirmed for user {UserId} after successful payment", planId, userId);

        return MapToDto(plan);
    }

    public async Task<LeisurePlanDto> CancelPlanAsync(int planId, int userId, string? reason)
    {
        var plan = await _context.LeisurePlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.CustomerId == userId);

        if (plan == null)
            throw new InvalidOperationException("Leisure plan not found");

        if (plan.Status == "Cancelled")
            throw new InvalidOperationException("Plan is already cancelled");

        plan.Status = "Cancelled";
        plan.CancelledAt = DateTime.UtcNow;
        plan.CancellationReason = reason;

        _context.LeisurePlans.Update(plan);
        await _context.SaveChangesAsync();

        _logger.LogInformation("LeisurePlan {PlanId} cancelled for user {UserId}", planId, userId);

        return MapToDto(plan);
    }

    public async Task<AIFullPlanDto> GenerateAIPlanAsync(AILeisurePlanRequestDto request, int userId)
    {
        _logger.LogInformation("Generating AI Leisure Plan for user {UserId}", userId);
        
        var planDto = await _openAIService.GenerateLeisurePlanAsync(request);
        
        // For now, we return it so the user can review before "confirming" (saving)
        return planDto;
    }

    public async Task<List<AIHotelDto>> GetAlternativeHotelsAsync(AIHotelSearchRequestDto request)
    {
        _logger.LogInformation("Fetching alternative hotels for {City}", request.City);
        return await _openAIService.GetAlternativeHotelsAsync(request);
    }

    public async Task<List<AIActivityOptionDto>> GetAlternativeActivitiesAsync(AIActivitySearchRequestDto request)
    {
        _logger.LogInformation("Fetching alternative activities for {City}", request.City);
        return await _openAIService.GetAlternativeActivitiesAsync(request);
    }

    public async Task<LeisurePlanDto> GetPlanAsync(int planId, int userId)
    {
        var plan = await _context.LeisurePlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.CustomerId == userId);

        if (plan == null)
            throw new InvalidOperationException("Leisure plan not found");

        return MapToDto(plan);
    }

    public async Task DeletePlanAsync(int planId, int userId)
    {
        var plan = await _context.LeisurePlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.CustomerId == userId);

        if (plan == null)
            throw new InvalidOperationException("Leisure plan not found");

        if (plan.Status != "Cancelled")
            throw new InvalidOperationException("Only cancelled plans can be deleted");

        _context.LeisurePlans.Remove(plan);
        await _context.SaveChangesAsync();

        _logger.LogInformation("LeisurePlan {PlanId} deleted for user {UserId}", planId, userId);
    }

    public async Task<IEnumerable<FeaturedPackageDto>> GetLeisurePackagesAsync()
    {
        var packages = await _context.LeisurePackages
            .Where(p => p.IsActive)
            .Include(p => p.Detail)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return packages.Select(p =>
        {
            var dto = new FeaturedPackageDto
            {
                Id = p.Id,
                Destination = p.Destination,
                Badge = p.Badge,
                BadgeColor = p.BadgeColor,
                Image = p.Image,
                Title = p.Title,
                Subtitle = p.Subtitle,
                Nights = p.Nights,
                WasPrice = p.WasPrice,
                Price = p.Price,
                PerLabel = p.PerLabel,
                Save = p.Save
            };

            if (p.Detail != null)
            {
                try { dto.Details = JsonSerializer.Deserialize<List<PackageDetailDto>>(p.Detail.DetailsJson, _jsonOptions) ?? new(); } catch { }
                try { dto.Tags = JsonSerializer.Deserialize<List<string>>(p.Detail.TagsJson, _jsonOptions) ?? new(); } catch { }
            }

            return dto;
        });
    }

    public async Task<FeaturedPackageDto> GetLeisurePackageByIdAsync(int id)
    {
        var p = await _context.LeisurePackages
            .Include(x => x.Detail)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);

        if (p == null) throw new KeyNotFoundException($"LeisurePackage with ID {id} not found.");

        var dto = new FeaturedPackageDto
        {
            Id = p.Id,
            Destination = p.Destination,
            Badge = p.Badge,
            BadgeColor = p.BadgeColor,
            Image = p.Image,
            Title = p.Title,
            Subtitle = p.Subtitle,
            Nights = p.Nights,
            WasPrice = p.WasPrice,
            Price = p.Price,
            PerLabel = p.PerLabel,
            Save = p.Save
        };

        if (p.Detail != null)
        {
            dto.Experience = p.Detail.Experience;
            dto.AccommodationCost = p.Detail.AccommodationCost;
            dto.TransfersCost = p.Detail.TransfersCost;
            dto.ServiceFee = p.Detail.ServiceFee;
            dto.EstimatedCost = p.Detail.EstimatedCost;

            try { dto.Details = JsonSerializer.Deserialize<List<PackageDetailDto>>(p.Detail.DetailsJson, _jsonOptions) ?? new(); } catch { }
            try { dto.Tags = JsonSerializer.Deserialize<List<string>>(p.Detail.TagsJson, _jsonOptions) ?? new(); } catch { }
            try { dto.WhatsIncluded = JsonSerializer.Deserialize<List<WhatsIncludedDto>>(p.Detail.WhatsIncludedJson, _jsonOptions) ?? new(); } catch { }
            try { dto.Itinerary = JsonSerializer.Deserialize<List<PackageItineraryDto>>(p.Detail.ItineraryJson, _jsonOptions) ?? new(); } catch { }
            try { dto.Tiers = JsonSerializer.Deserialize<List<PackageTierDto>>(p.Detail.TiersJson, _jsonOptions) ?? new(); } catch { }
            try { dto.GalleryImages = JsonSerializer.Deserialize<List<string>>(p.Detail.GalleryImagesJson, _jsonOptions) ?? new(); } catch { }
            try { dto.Reviews = JsonSerializer.Deserialize<List<PackageReviewDto>>(p.Detail.ReviewsJson, _jsonOptions) ?? new(); } catch { }
        }

        return dto;
    }

    private static LeisurePlanDto MapToDto(Models.LeisurePlan plan)
    {
        var legs = new List<LeisurePlanLegDto>();
        var activities = new List<string>();

        try { legs = JsonSerializer.Deserialize<List<LeisurePlanLegDto>>(plan.LegsJson, _jsonOptions) ?? new(); } catch {}
        try { activities = JsonSerializer.Deserialize<List<string>>(plan.ActivitiesJson, _jsonOptions) ?? new(); } catch {}

        var flights = new List<AIFlightDto>();
        try { flights = JsonSerializer.Deserialize<List<AIFlightDto>>(plan.FlightsJson, _jsonOptions) ?? new(); } catch {}

        var hotels = new List<AIHotelDto>();
        try { hotels = JsonSerializer.Deserialize<List<AIHotelDto>>(plan.HotelsJson, _jsonOptions) ?? new(); } catch {}

        var itinerary = new Dictionary<string, List<AIDayDto>>();
        try { itinerary = JsonSerializer.Deserialize<Dictionary<string, List<AIDayDto>>>(plan.ItineraryJson, _jsonOptions) ?? new(); } catch {}

        var mealPlan = new List<AIMealPlanDto>();
        try { mealPlan = JsonSerializer.Deserialize<List<AIMealPlanDto>>(plan.MealPlanJson, _jsonOptions) ?? new(); } catch {}

        return new LeisurePlanDto
        {
            Id = plan.Id,
            CustomerId = plan.CustomerId,
            Title = plan.Title,
            PlanType = plan.PlanType,
            Tier = plan.Tier,
            Status = plan.Status,
            DepartureAirport = plan.DepartureAirport,
            Destinations = plan.Destinations,
            DateRange = $"{plan.StartDate:yyyy-MM-dd} · {plan.EndDate:yyyy-MM-dd}",
            Passengers = plan.Passengers,
            EstimatedCost = plan.EstimatedCost,
            Budget = plan.Budget,
            Legs = legs,
            Activities = activities,
            Flights = flights,
            Hotels = hotels,
            Itinerary = itinerary,
            MealPlan = mealPlan,
            CreatedAt = plan.CreatedAt,
            ConfirmedAt = plan.ConfirmedAt,
            CancelledAt = plan.CancelledAt,
            CancellationReason = plan.CancellationReason,
            ConfirmedOn = plan.ConfirmedAt?.ToString("dd MMM yyyy"),
            CancelledOn = plan.CancelledAt?.ToString("dd MMM yyyy")
        };
    }
}
