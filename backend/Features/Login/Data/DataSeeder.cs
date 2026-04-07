using backend.Features.Login.Models;
using backend.Features.Login.Enums;
using backend.Features.Flights.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Login.Data;

public static class DataSeeder
{
    public static async Task SeedUsersAsync(FlightBookingDbContext context)
    {
        // Check if users already exist
        if (await context.Users.AnyAsync())
        {
            return; // Database has been seeded
        }

        var users = new List<User>
        {
            new User
            {
                Username = "ticket",
                PasswordHash = "ticket123", // In production, use hashed passwords
                Name = "John Ticket",
                Role = UserRole.TicketOfficer,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new User
            {
                Username = "finance",
                PasswordHash = "finance123", // In production, use hashed passwords
                Name = "Sarah Finance",
                Role = UserRole.FinanceOfficer,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new User
            {
                Username = "operations",
                PasswordHash = "ops123", // In production, use hashed passwords
                Name = "Mike Operations",
                Role = UserRole.OperationsManager,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new User
            {
                Username = "admin",
                PasswordHash = "admin123", // In production, use hashed passwords
                Name = "Admin User",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();
    }
}
