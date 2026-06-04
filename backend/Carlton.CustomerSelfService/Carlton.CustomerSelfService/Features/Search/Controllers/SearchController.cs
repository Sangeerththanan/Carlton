using Carlton.CustomerSelfService.Features.Search.Dtos;
using Carlton.CustomerSelfService.Features.Search.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carlton.CustomerSelfService.Features.Search.Controllers;

[ApiController]
[Route("api/search")]
[AllowAnonymous]
[Produces("application/json")]
public class SearchController : ControllerBase
{
    private readonly IAnonymousSearchService _searchService;
    private readonly ILogger<SearchController> _logger;

    public SearchController(IAnonymousSearchService searchService, ILogger<SearchController> logger)
    {
        _searchService = searchService;
        _logger = logger;
    }

    [HttpPost("flights")]
    public async Task<IActionResult> LogFlightSearch([FromBody] FlightSearchRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _searchService.LogFlightSearchAsync(request);
            return Ok(new { message = "Flight search saved" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving flight search");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error" });
        }
    }

    [HttpPost("hotels")]
    public async Task<IActionResult> LogHotelSearch([FromBody] HotelSearchRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _searchService.LogHotelSearchAsync(request);
            return Ok(new { message = "Hotel search saved" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving hotel search");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error" });
        }
    }

    [HttpPost("flight-hotels")]
    public async Task<IActionResult> LogFlightHotelSearch([FromBody] FlightHotelSearchRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _searchService.LogFlightHotelSearchAsync(request);
            return Ok(new { message = "Flight + hotel search saved" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving flight + hotel search");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error" });
        }
    }

    [HttpPost("cars")]
    public async Task<IActionResult> LogCarSearch([FromBody] CarSearchRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _searchService.LogCarSearchAsync(request);
            return Ok(new { message = "Car search saved" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving car search");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Internal server error" });
        }
    }
}
