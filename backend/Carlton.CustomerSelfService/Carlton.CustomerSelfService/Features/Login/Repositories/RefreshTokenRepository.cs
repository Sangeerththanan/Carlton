using Carlton.CustomerSelfService.Features.Login.Models;
using Carlton.CustomerSelfService.Data;
using Microsoft.EntityFrameworkCore;

namespace Carlton.CustomerSelfService.Features.Login.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _context;

    public RefreshTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked && rt.User.IsActive);
    }

    public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }

    public async Task RevokeAsync(string token)
    {
        var rt = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
        if (rt == null) return;
        rt.IsRevoked = true;
        await _context.SaveChangesAsync();
    }

    public async Task RevokeAllForUserAsync(int userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();
        foreach (var rt in tokens)
            rt.IsRevoked = true;
        await _context.SaveChangesAsync();
    }
}
