using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Carlton.CustomerSelfService.Features.LeisurePlan.Services;
using Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;
using System.Security.Claims;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LeisurePlanController : ControllerBase
{
    private readonly ILeisurePlanService _leisurePlanService;
    private readonly ILogger<LeisurePlanController> _logger;

    public LeisurePlanController(ILeisurePlanService leisurePlanService, ILogger<LeisurePlanController> logger)
    {
        _leisurePlanService = leisurePlanService;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<LeisurePlanStatsDto>> GetStats()
    {
        var userId = GetUserId();
        var stats = await _leisurePlanService.GetStatsAsync(userId);
        return Ok(stats);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeisurePlanDto>>> GetPlans([FromQuery] string? status)
    {
        var userId = GetUserId();
        var plans = await _leisurePlanService.GetPlansAsync(userId, status);
        return Ok(plans);
    }

    [HttpGet("packages")]
    public async Task<ActionResult<IEnumerable<FeaturedPackageDto>>> GetLeisurePackages()
    {
        var packages = await _leisurePlanService.GetLeisurePackagesAsync();
        return Ok(packages);
    }

    [HttpGet("packages/{id}")]
    public async Task<ActionResult<FeaturedPackageDto>> GetLeisurePackage(int id)
    {
        try
        {
            var package = await _leisurePlanService.GetLeisurePackageByIdAsync(id);
            return Ok(package);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LeisurePlanDto>> GetPlan(int id)
    {
        var userId = GetUserId();
        try
        {
            var plan = await _leisurePlanService.GetPlanAsync(id, userId);
            return Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<LeisurePlanDto>> UpdatePlan(int id, [FromBody] CreateLeisurePlanDto dto)
    {
        var userId = GetUserId();
        try
        {
            var plan = await _leisurePlanService.UpdatePlanAsync(id, dto, userId);
            return Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("generate")]
    public async Task<ActionResult<AIFullPlanDto>> GeneratePlan([FromBody] AILeisurePlanRequestDto dto)
    {
        var userId = GetUserId();
        try
        {
            var plan = await _leisurePlanService.GenerateAIPlanAsync(dto, userId);
            return Ok(plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate AI plan");
            return StatusCode(500, "Error generating leisure plan: " + ex.Message);
        }
    }
    
    [HttpPost("hotels/alternatives")]
    public async Task<ActionResult<IEnumerable<AIHotelDto>>> GetAlternativeHotels([FromBody] AIHotelSearchRequestDto dto)
    {
        try
        {
            var hotels = await _leisurePlanService.GetAlternativeHotelsAsync(dto);
            return Ok(hotels);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch alternative hotels");
            return StatusCode(500, "Error fetching hotels: " + ex.Message);
        }
    }

    [HttpPost("activities/alternatives")]
    public async Task<ActionResult<IEnumerable<AIActivityOptionDto>>> GetAlternativeActivities([FromBody] AIActivitySearchRequestDto dto)
    {
        try
        {
            var activities = await _leisurePlanService.GetAlternativeActivitiesAsync(dto);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch alternative activities");
            return StatusCode(500, "Error fetching activities: " + ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<LeisurePlanDto>> CreatePlan([FromBody] CreateLeisurePlanDto dto)
    {
        var userId = GetUserId();
        try
        {
            var plan = await _leisurePlanService.CreatePlanAsync(dto, userId);
            return CreatedAtAction(nameof(GetPlans), new { status = plan.Status }, plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/confirm")]
    public async Task<ActionResult<LeisurePlanDto>> ConfirmPlan(int id)
    {
        var userId = GetUserId();
        try
        {
            var plan = await _leisurePlanService.ConfirmPlanAsync(id, userId);
            return Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<LeisurePlanDto>> CancelPlan(int id, [FromBody] CancelLeisurePlanDto dto)
    {
        var userId = GetUserId();
        try
        {
            var plan = await _leisurePlanService.CancelPlanAsync(id, userId, dto.Reason);
            return Ok(plan);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlan(int id)
    {
        var userId = GetUserId();
        try
        {
            await _leisurePlanService.DeletePlanAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User ID not found in token");

        return int.Parse(userIdClaim.Value);
    }
}
