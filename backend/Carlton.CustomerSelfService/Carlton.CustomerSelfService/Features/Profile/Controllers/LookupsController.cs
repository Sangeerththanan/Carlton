using Carlton.CustomerSelfService.Features.Profile.DTOs;
using Carlton.CustomerSelfService.Features.Profile.Services;
using Microsoft.AspNetCore.Mvc;

namespace Carlton.CustomerSelfService.Features.Profile.Controllers;

[ApiController]
[Route("api/lookups")]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet("countries")]
    public async Task<ActionResult<IEnumerable<LookupDto>>> GetCountries()
    {
        var countries = await _lookupService.GetCountriesAsync();
        return Ok(countries);
    }

    [HttpGet("airlines")]
    public async Task<ActionResult<IEnumerable<LookupDto>>> GetAirlines()
    {
        var airlines = await _lookupService.GetAirlinesAsync();
        return Ok(airlines);
    }
}

public class LookupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
}
