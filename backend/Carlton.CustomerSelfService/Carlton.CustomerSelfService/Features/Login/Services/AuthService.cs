using Carlton.CustomerSelfService.Features.Login.Models;
using Carlton.CustomerSelfService.Features.Login.Enums;
using Carlton.CustomerSelfService.Features.Login.Dtos;
using Carlton.CustomerSelfService.Features.Login.Repositories;
using Carlton.CustomerSelfService.Features.Login.Services;
using Microsoft.AspNetCore.Identity;

using Carlton.CustomerSelfService.Features.Profile.Models;

namespace Carlton.CustomerSelfService.Features.Login.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest, string? deviceInfo = null);
    Task<LoginResponseDto?> RefreshAsync(string refreshToken);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task RevokeRefreshTokenAsync(string refreshToken);
    Task<(bool Success, string? Error, UserDto? User)> RegisterAsync(RegisterRequestDto request);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;
    private static readonly PasswordHasher<string> _hasher = new();

    public AuthService(IUserRepository userRepository, IRefreshTokenRepository refreshTokenRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest, string? deviceInfo = null)
    {
        var user = await _userRepository.GetByUsernameAsync(loginRequest.Username);
        if (user == null || !VerifyPassword(loginRequest.Password, user.PasswordHash))
            return null;

        var accessToken = _tokenService.GenerateToken(user.Id, user.Username, user.Name, user.Role.ToString());
        var rawRefreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = rawRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            DeviceInfo = deviceInfo
        });

        return new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = rawRefreshToken,
            User = new UserDto { Id = user.Id, Username = user.Username, Name = user.Name, Role = user.Role.ToString() },
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };
    }

    public async Task<LoginResponseDto?> RefreshAsync(string refreshToken)
    {
        var stored = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (stored == null || stored.ExpiresAt <= DateTime.UtcNow || stored.User == null)
            return null;

        var user = stored.User;

        // Rotate: revoke old, issue new
        await _refreshTokenRepository.RevokeAsync(refreshToken);
        var newAccessToken = _tokenService.GenerateToken(user.Id, user.Username, user.Name, user.Role.ToString());
        var newRawRefreshToken = _tokenService.GenerateRefreshToken();

        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = newRawRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            DeviceInfo = stored.DeviceInfo
        });

        return new LoginResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRawRefreshToken,
            User = new UserDto { Id = user.Id, Username = user.Username, Name = user.Name, Role = user.Role.ToString() },
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        await _refreshTokenRepository.RevokeAsync(refreshToken);
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;
        return new UserDto { Id = user.Id, Username = user.Username, Name = user.Name, Role = user.Role.ToString() };
    }

    public async Task<(bool Success, string? Error, UserDto? User)> RegisterAsync(RegisterRequestDto request)
    {
        if (request.Password.Length < 8)
            return (false, "Password must be at least 8 characters.", null);
        if (!request.Password.Any(char.IsUpper))
            return (false, "Password must contain at least one uppercase letter.", null);
        if (!request.Password.Any(char.IsDigit))
            return (false, "Password must contain at least one number.", null);
        if (!request.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            return (false, "Password must contain at least one special character.", null);

        var emailNormalized = request.Email.Trim().ToLower();
        if (await _userRepository.ExistsByUsernameAsync(emailNormalized))
            return (false, "An account with this email already exists.", null);

        var phone = string.IsNullOrWhiteSpace(request.PhoneNumber)
            ? null
            : $"{request.PhoneCountryCode}{request.PhoneNumber.Trim()}";

        var user = new User
        {
            Username = emailNormalized,
            PasswordHash = HashPassword(request.Password),
            Name = $"{request.FirstName.Trim()} {request.LastName.Trim()}",
            Role = UserRole.Customer,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Customer = new Customer
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = emailNormalized,
                Phone = phone,
                IsGuest = false
            },
            Profile = new UserProfile
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Phone = phone,
                DateOfBirth = request.DateOfBirth
            },
            Preference = new UserPreference
            {
                Language = "en",
                Theme = "Light"
            }
        };

        var created = await _userRepository.CreateAsync(user);
        return (true, null, new UserDto { Id = created.Id, Username = created.Username, Name = created.Name, Role = created.Role.ToString() });
    }

    private string HashPassword(string password) => _hasher.HashPassword(string.Empty, password);

    private bool VerifyPassword(string password, string passwordHash) =>
        _hasher.VerifyHashedPassword(string.Empty, passwordHash, password) != PasswordVerificationResult.Failed;
}
