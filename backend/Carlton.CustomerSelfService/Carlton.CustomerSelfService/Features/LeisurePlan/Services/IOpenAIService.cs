using Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Services;

public interface IOpenAIService
{
    Task<AIFullPlanDto> GenerateLeisurePlanAsync(AILeisurePlanRequestDto request);
    Task<List<AIHotelDto>> GetAlternativeHotelsAsync(AIHotelSearchRequestDto request);
    Task<List<AIActivityOptionDto>> GetAlternativeActivitiesAsync(AIActivitySearchRequestDto request);
}
