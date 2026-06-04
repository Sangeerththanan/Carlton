using System.Security.Claims;
using Carlton.CustomerSelfService.Features.Profile.DTOs;
using Carlton.CustomerSelfService.Features.Profile.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carlton.CustomerSelfService.Features.Profile.Controllers;

[Authorize]
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }
        return userId;
    }

    # region Personal Details
    [HttpGet("personal")]
    public async Task<ActionResult<PersonalDetailsDto>> GetPersonalDetails()
    {
        var details = await _profileService.GetPersonalDetailsAsync(GetUserId());
        if (details == null) return NotFound("User profile not found.");
        return Ok(details);
    }

    [HttpPut("personal")]
    public async Task<IActionResult> UpdatePersonalDetails(UpdatePersonalDetailsDto dto)
    {
        var result = await _profileService.UpdatePersonalDetailsAsync(GetUserId(), dto);
        if (!result) return NotFound("User profile failed to update.");
        return NoContent();
    }
    # endregion

    # region Saved Travellers
    [HttpGet("travellers")]
    public async Task<ActionResult<IEnumerable<SavedTravellerDto>>> GetSavedTravellers()
    {
        var travellers = await _profileService.GetSavedTravellersAsync(GetUserId());
        return Ok(travellers);
    }

    [HttpPost("travellers")]
    public async Task<ActionResult<SavedTravellerDto>> AddSavedTraveller(AddSavedTravellerDto dto)
    {
        var traveller = await _profileService.AddSavedTravellerAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetSavedTravellers), new { id = traveller.Id }, traveller);
    }

    [HttpDelete("travellers/{id}")]
    public async Task<IActionResult> DeleteSavedTraveller(int id)
    {
        var result = await _profileService.DeleteSavedTravellerAsync(GetUserId(), id);
        if (!result) return NotFound("Traveller not found or unauthorized.");
        return NoContent();
    }
    # endregion

    # region User Preferences
    [HttpGet("preferences")]
    public async Task<ActionResult<UserPreferenceDto>> GetUserPreferences()
    {
        var preferences = await _profileService.GetUserPreferencesAsync(GetUserId());
        if (preferences == null) return NotFound("Preferences not found.");
        return Ok(preferences);
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdateUserPreferences(UpdatePreferencesDto dto)
    {
        var result = await _profileService.UpdateUserPreferencesAsync(GetUserId(), dto);
        if (!result) return NotFound("Failed to update preferences.");
        return NoContent();
    }
    # endregion

    # region Frequent Flyer Programs
    [HttpGet("loyalty")]
    public async Task<ActionResult<IEnumerable<FrequentFlyerProgramDto>>> GetFrequentFlyerPrograms()
    {
        var programs = await _profileService.GetFrequentFlyerProgramsAsync(GetUserId());
        return Ok(programs);
    }

    [HttpPost("loyalty")]
    public async Task<ActionResult<FrequentFlyerProgramDto>> AddFrequentFlyerProgram(AddFrequentFlyerDto dto)
    {
        var program = await _profileService.AddFrequentFlyerProgramAsync(GetUserId(), dto);
        return CreatedAtAction(nameof(GetFrequentFlyerPrograms), new { id = program.Id }, program);
    }

    [HttpDelete("loyalty/{id}")]
    public async Task<IActionResult> DeleteFrequentFlyerProgram(int id)
    {
        var result = await _profileService.DeleteFrequentFlyerProgramAsync(GetUserId(), id);
        if (!result) return NotFound("Loyalty program not found or unauthorized.");
        return NoContent();
    }
    # endregion
}
