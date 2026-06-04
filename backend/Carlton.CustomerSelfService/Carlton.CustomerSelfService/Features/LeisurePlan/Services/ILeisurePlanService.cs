using Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Services;

public interface ILeisurePlanService
{
    Task<LeisurePlanStatsDto> GetStatsAsync(int userId);
    Task<IEnumerable<LeisurePlanDto>> GetPlansAsync(int userId, string? status = null);
    Task<LeisurePlanDto> CreatePlanAsync(CreateLeisurePlanDto dto, int userId);
    Task<LeisurePlanDto> UpdatePlanAsync(int planId, CreateLeisurePlanDto dto, int userId);
    Task<LeisurePlanDto> GetPlanAsync(int planId, int userId);
    Task<LeisurePlanDto> CancelPlanAsync(int planId, int userId, string? reason);
    Task<LeisurePlanDto> ConfirmPlanAsync(int planId, int userId);
    Task<AIFullPlanDto> GenerateAIPlanAsync(AILeisurePlanRequestDto request, int userId);
    Task<List<AIHotelDto>> GetAlternativeHotelsAsync(AIHotelSearchRequestDto request);
    Task<List<AIActivityOptionDto>> GetAlternativeActivitiesAsync(AIActivitySearchRequestDto request);
    Task DeletePlanAsync(int planId, int userId);
    Task<IEnumerable<FeaturedPackageDto>> GetLeisurePackagesAsync();
    Task<FeaturedPackageDto> GetLeisurePackageByIdAsync(int id);
}