using Carlton.CustomerSelfService.Features.Profile.Controllers;

namespace Carlton.CustomerSelfService.Features.Profile.Services;

public interface ILookupService
{
    Task<IEnumerable<LookupDto>> GetCountriesAsync();
    Task<IEnumerable<LookupDto>> GetAirlinesAsync();
}
