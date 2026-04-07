using backend.Features.Login.Models;
using backend.Features.Login.Enums;
using backend.Features.Flights.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Login.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FlightBookingDbContext _context;

    public UserRepository(FlightBookingDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower() && u.IsActive);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
    }

    public async Task<User?> GetByUsernameAndRoleAsync(string username, UserRole role)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => 
                u.Username.ToLower() == username.ToLower() && 
                u.Role == role && 
                u.IsActive);
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        return await _context.Users
            .AnyAsync(u => u.Username.ToLower() == username.ToLower() && u.IsActive);
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
