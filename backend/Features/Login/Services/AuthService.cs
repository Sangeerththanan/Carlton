using backend.Features.Login.Models;
using backend.Features.Login.Enums;
using backend.Features.Login.Dtos;
using backend.Features.Login.Repositories;
using backend.Features.Login.Services;

namespace backend.Features.Login.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
    Task<UserDto?> GetUserByIdAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        // Get user by username only
        var user = await _userRepository.GetByUsernameAsync(loginRequest.Username);
        if (user == null)
        {
            return null;
        }

        // Verify password (for now, using simple comparison - in production, use BCrypt)
        if (!VerifyPassword(loginRequest.Password, user.PasswordHash))
        {
            return null;
        }

        // Generate token with user's role from database
        var token = _tokenService.GenerateToken(user.Id, user.Username, user.Name, user.Role.ToString());

        // Create response
        return new LoginResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Name = user.Name,
                Role = user.Role.ToString()
            },
            ExpiresAt = DateTime.UtcNow.AddMinutes(60) // Default 1 hour
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Name = user.Name,
            Role = user.Role.ToString()
        };
    }

    private bool VerifyPassword(string password, string passwordHash)
    {
        // For now, using simple comparison since we're creating dummy users
        // In production, use BCrypt: BCrypt.Net.BCrypt.Verify(password, passwordHash)
        return password == passwordHash || HashPassword(password) == passwordHash;
    }

    private string HashPassword(string password)
    {
        // Simple hashing for demo purposes
        // In production, use BCrypt: BCrypt.Net.BCrypt.HashPassword(password)
        return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(password + "_salt"));
    }
}
