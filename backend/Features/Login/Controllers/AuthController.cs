using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Features.Login.Dtos;
using backend.Features.Login.Services;

namespace backend.Features.Login.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        try
        {
            if (string.IsNullOrEmpty(loginRequest.Username) || 
                string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var result = await _authService.LoginAsync(loginRequest);
            
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {Username}", loginRequest.Username);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            // Debug: Log all claims
            var allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            _logger.LogInformation("User claims: {@Claims}", allClaims);
            
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogWarning("NameIdentifier claim not found in token");
                return Unauthorized(new { message = "User not found in token" });
            }

            _logger.LogInformation("Found userId claim: {UserId}", userIdClaim.Value);

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                _logger.LogWarning("Invalid user ID format in token: {UserId}", userIdClaim.Value);
                return Unauthorized(new { message = "Invalid user ID in token" });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found in database for ID: {UserId}", userId);
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
