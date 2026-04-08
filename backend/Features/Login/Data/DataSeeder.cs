using backend.Features.Login.Models;
using backend.Features.Login.Enums;
using backend.Features.Flights.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Login.Data;

public static class DataSeeder
{
    public static async Task SeedUsersAsync(FlightBookingDbContext context)
    {
        // Check if customer users already exist
        var existingCustomers = await context.Users.AnyAsync(u => u.Role == UserRole.Customer);
        if (existingCustomers)
        {
            return; // Customer users have been seeded
        }

        var customerUsers = new List<User>
        {
            // Demo Customer Users
            new User
            {
                Username = "customer1",
                PasswordHash = "customer123",
                Name = "Alice Johnson",
                Role = UserRole.Customer,
                Email = "alice.johnson@email.com",
                Phone = "+1234567890",
                Address = "123 Main Street, Apt 4B",
                City = "New York",
                Country = "USA",
                LoyaltyPoints = 150,
                DateOfBirth = new DateTime(1985, 5, 15),
                PreferredClass = "Economy",
                SpecialRequests = "Window seat preferred",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new User
            {
                Username = "customer2",
                PasswordHash = "customer123",
                Name = "Bob Smith",
                Role = UserRole.Customer,
                Email = "bob.smith@email.com",
                Phone = "+1987654321",
                Address = "456 Oak Avenue",
                City = "Los Angeles",
                Country = "USA",
                LoyaltyPoints = 75,
                DateOfBirth = new DateTime(1990, 8, 22),
                PreferredClass = "Business",
                SpecialRequests = "Vegetarian meal",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new User
            {
                Username = "customer3",
                PasswordHash = "customer123",
                Name = "Carol Williams",
                Role = UserRole.Customer,
                Email = "carol.williams@email.com",
                Phone = "+1122334455",
                Address = "789 Pine Road",
                City = "Chicago",
                Country = "USA",
                LoyaltyPoints = 300,
                DateOfBirth = new DateTime(1978, 12, 3),
                PreferredClass = "First",
                SpecialRequests = "Extra legroom, aisle seat",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };

        await context.Users.AddRangeAsync(customerUsers);
        await context.SaveChangesAsync();
    }
}
