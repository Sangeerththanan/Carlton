using Carlton.CustomerSelfService.Features.TravelPlans.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Carlton.CustomerSelfService.Features.TravelPlans.Services;

public interface ITravelPlanService
{
    Task<List<TravelPlanDto>> GetAllAsync(string userId);
    Task<TravelPlanDto?> GetByIdAsync(int id, string userId);
    Task<TravelPlanDto> CreateAsync(string userId, CreateTravelPlanDto dto);
    Task<TravelPlanDto?> UpdateAsync(int id, string userId, CreateTravelPlanDto dto);
    Task<bool> DeleteAsync(int id, string userId);
}