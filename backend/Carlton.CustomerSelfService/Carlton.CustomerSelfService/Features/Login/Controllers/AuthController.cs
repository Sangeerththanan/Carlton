using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.RateLimiting;
using Carlton.CustomerSelfService.Features.Login.Dtos;
using Carlton.CustomerSelfService.Features.Login.Services;

namespace Carlton.CustomerSelfService.Features.Login.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, IWebHostEnvironment env, IConfiguration configuration)
    {
        _authService = authService;
        _logger = logger;
        _env = env;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        try
        {
            if (string.IsNullOrEmpty(loginRequest.Username) || 
                string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var deviceInfo = Request.Headers.UserAgent.ToString();
            if (!string.IsNullOrEmpty(deviceInfo) && deviceInfo.Length > 500)
            {
                deviceInfo = deviceInfo.Substring(0, 500);
            }
            var result = await _authService.LoginAsync(loginRequest, deviceInfo);

            if (result == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var expirationMinutes = int.TryParse(_configuration["JwtSettings:ExpirationMinutes"], out var mins) ? mins : 60;
            Response.Cookies.Append("auth_token", result.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(expirationMinutes)
            });
            Response.Cookies.Append("refresh_token", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new { user = result.User, expiresAt = result.ExpiresAt });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {Username}", loginRequest.Username);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("register")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.FirstName) ||
                string.IsNullOrWhiteSpace(request.LastName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "First name, last name, email, and password are required." });
            }

            var (success, error, user) = await _authService.RegisterAsync(request);

            if (!success)
                return Conflict(new { message = error });

            return Ok(new { message = "Account created successfully.", user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        try
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "No refresh token" });

            var result = await _authService.RefreshAsync(refreshToken);
            if (result == null)
                return Unauthorized(new { message = "Invalid or expired refresh token" });

            var expirationMinutes = int.TryParse(_configuration["JwtSettings:ExpirationMinutes"], out var mins) ? mins : 60;
            Response.Cookies.Append("auth_token", result.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(expirationMinutes)
            });
            Response.Cookies.Append("refresh_token", result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = !_env.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            });

            return Ok(new { user = result.User, expiresAt = result.ExpiresAt });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during refresh token");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromServices] ITokenRevocationService revocationService)
    {
        var jti = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
        var expClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Exp)?.Value;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (jti != null && long.TryParse(expClaim, out var expUnix))
            revocationService.Revoke(jti, DateTimeOffset.FromUnixTimeSeconds(expUnix));

        var refreshToken = Request.Cookies["refresh_token"];
        if (!string.IsNullOrEmpty(refreshToken))
            await _authService.RevokeRefreshTokenAsync(refreshToken);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Strict
        };
        Response.Cookies.Delete("auth_token", cookieOptions);
        Response.Cookies.Delete("refresh_token", cookieOptions);

        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "User not found in token" });

            if (!int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "Invalid user ID in token" });

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
