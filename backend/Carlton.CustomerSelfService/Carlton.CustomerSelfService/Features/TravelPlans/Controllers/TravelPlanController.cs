using Carlton.CustomerSelfService.Features.TravelPlans.Dtos;
using Carlton.CustomerSelfService.Features.TravelPlans.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Carlton.CustomerSelfService.Features.TravelPlans.Controllers;

[ApiController]
[Route("api/[controller]")] // routes to /api/travelplan
[Authorize] // user must be logged in
public class TravelPlanController : ControllerBase
{
    private readonly ITravelPlanService _service;

    public TravelPlanController(ITravelPlanService service)
    {
        _service = service;
    }

    // GET /api/travelplan  → returns all plans for the logged-in user
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var plans = await _service.GetAllAsync(userId);
        return Ok(plans);
    }

    // GET /api/travelplan/5  → returns one specific plan
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var plan = await _service.GetByIdAsync(id, userId);
        if (plan == null) return NotFound();
        return Ok(plan);
    }

    // POST /api/travelplan  → creates a new plan
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTravelPlanDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var plan = await _service.CreateAsync(userId, dto);
        // Returns 201 Created with the new plan and its URL
        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, plan);
    }

    // PUT /api/travelplan/5  → updates an existing plan
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateTravelPlanDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var plan = await _service.UpdateAsync(id, userId, dto);
        if (plan == null) return NotFound();
        return Ok(plan);
    }

    // DELETE /api/travelplan/5  → deletes a plan
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var deleted = await _service.DeleteAsync(id, userId);
        if (!deleted) return NotFound();
        return NoContent(); // 204 = success, nothing to return
    }
}