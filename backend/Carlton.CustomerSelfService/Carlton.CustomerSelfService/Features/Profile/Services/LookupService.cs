using Carlton.CustomerSelfService.Data;
using Carlton.CustomerSelfService.Features.Profile.Controllers;
using Microsoft.EntityFrameworkCore;

namespace Carlton.CustomerSelfService.Features.Profile.Services;

public class LookupService : ILookupService
{
    private readonly ApplicationDbContext _context;

    public LookupService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LookupDto>> GetCountriesAsync()
    {
        return await _context.Countries
            .OrderBy(c => c.Name)
            .Select(c => new LookupDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.IsoCode
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<LookupDto>> GetAirlinesAsync()
    {
        return await _context.Airlines
            .OrderBy(a => a.Name)
            .Select(a => new LookupDto
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.IataCode
            })
            .ToListAsync();
    }
}
