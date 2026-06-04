using Carlton.CustomerSelfService.Features.Profile.Models;
using Carlton.CustomerSelfService.Features.Login.Models;
using Carlton.CustomerSelfService.Features.Login.Enums;
using Carlton.CustomerSelfService.Data;
using Microsoft.AspNetCore.Identity;
using Carlton.CustomerSelfService.Features.Flights.Models;
using Carlton.CustomerSelfService.Features.Bookings.Models;
using Carlton.CustomerSelfService.Features.LeisurePlan.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace Carlton.CustomerSelfService.Features.Login.Data;

public static class DataSeeder
{
    private static readonly PasswordHasher<string> _hasher = new();

    private static string HashPassword(string password) =>
        _hasher.HashPassword(string.Empty, password);

    public static async Task SeedLookupsAsync(ApplicationDbContext context)
    {
        if (!await context.Countries.AnyAsync())
        {
            var countries = new List<Carlton.CustomerSelfService.Features.Shared.Models.Country>
            {
                new() { IsoCode = "GB", Name = "United Kingdom", DialCode = "+44" },
                new() { IsoCode = "US", Name = "United States", DialCode = "+1" },
                new() { IsoCode = "AE", Name = "United Arab Emirates", DialCode = "+971" },
                new() { IsoCode = "QA", Name = "Qatar", DialCode = "+974" },
                new() { IsoCode = "TR", Name = "Turkey", DialCode = "+90" },
                new() { IsoCode = "FR", Name = "France", DialCode = "+33" },
                new() { IsoCode = "ES", Name = "Spain", DialCode = "+34" }
            };
            await context.Countries.AddRangeAsync(countries);
            await context.SaveChangesAsync();
        }

        if (!await context.Airlines.AnyAsync())
        {
            var uk = await context.Countries.FirstAsync(c => c.IsoCode == "GB");
            var airlines = new List<Carlton.CustomerSelfService.Features.Shared.Models.Airline>
            {
                new() { IataCode = "BA", Name = "British Airways", CountryId = uk.Id },
                new() { IataCode = "EK", Name = "Emirates" },
                new() { IataCode = "QR", Name = "Qatar Airways" },
                new() { IataCode = "TK", Name = "Turkish Airlines" },
                new() { IataCode = "AF", Name = "Air France" },
                new() { IataCode = "VY", Name = "Vueling" }
            };
            await context.Airlines.AddRangeAsync(airlines);
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedUsersAsync(ApplicationDbContext context)
    {
        var uk = await context.Countries.FirstOrDefaultAsync(c => c.IsoCode == "GB");
        var usa = await context.Countries.FirstOrDefaultAsync(c => c.IsoCode == "US");

        // Helper to add or update user
        async Task<User?> EnsureUserAsync(string username, string password, string name, UserRole role, Action<User>? customize = null)
        {
            var user = await context.Users
                .Include(u => u.Customer)
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Username == username);
            
            bool isNew = false;
            if (user == null)
            {
                isNew = true;
                user = new User
                {
                    Username = username,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Preference = new UserPreference
                    {
                        Theme = role == UserRole.Admin ? "Dark" : "Light",
                        Language = "en",
                        EmailNotifications = true
                    }
                };
                // Only apply Customer/Profile on first creation to avoid unique key violations
                customize?.Invoke(user);
            }

            // Always keep credentials/name in sync
            user.PasswordHash = HashPassword(password);
            user.Name = name;
            user.Role = role;
            user.IsActive = true;

            if (isNew)
            {
                await context.Users.AddAsync(user);
            }
            
            await context.SaveChangesAsync();
            return user;
        }

        // 1. Admin
        await EnsureUserAsync("admin", "admin123", "Admin User", UserRole.Admin, u => {
            u.Profile = new UserProfile { FirstName = "Admin", LastName = "User", Title = "Mr", City = "London", CountryId = uk?.Id };
        });

        // 2. Ticket Officer
        await EnsureUserAsync("ticket", "ticket123", "John Ticket", UserRole.TicketOfficer, u => {
            u.Profile = new UserProfile { FirstName = "John", LastName = "Ticket", Title = "Mr", City = "London", CountryId = uk?.Id };
        });

        // 3. Finance Officer
        await EnsureUserAsync("finance", "finance123", "Sarah Finance", UserRole.FinanceOfficer, u => {
            u.Profile = new UserProfile { FirstName = "Sarah", LastName = "Finance", Title = "Ms", City = "London", CountryId = uk?.Id };
        });

        // 4. Operations Manager
        await EnsureUserAsync("operations", "ops123", "Mike Operations", UserRole.OperationsManager, u => {
            u.Profile = new UserProfile { FirstName = "Mike", LastName = "Operations", Title = "Mr", City = "London", CountryId = uk?.Id };
        });

        // 5. Customer 1 (Alice)
        var alice = await EnsureUserAsync("customer1", "customer123", "Alice Johnson", UserRole.Customer, u => {
            u.Customer = new Customer { FirstName = "Alice", LastName = "Johnson", Email = "alice.johnson@email.com", Phone = "+1234567890", IsGuest = false };
            u.Profile = new UserProfile { FirstName = "Alice", LastName = "Johnson", Title = "Ms", Phone = "+1234567890", DateOfBirth = new DateTime(1985, 5, 15), City = "New York", CountryId = usa?.Id };
        });

        // Fixed: Added null check for CustomerId
        if (alice?.CustomerId.HasValue == true && !await context.CustomerLoyaltyAccounts.AnyAsync(l => l.CustomerId == alice.CustomerId.Value))
        {
            await context.CustomerLoyaltyAccounts.AddAsync(new CustomerLoyaltyAccount { CustomerId = alice.CustomerId.Value, LoyaltyPoints = 150, TierLevel = "Silver", MemberSinceDate = DateTime.UtcNow.AddYears(-1) });
            await context.CustomerTravelStats.AddAsync(new CustomerTravelStat { CustomerId = alice.CustomerId.Value, TripsCompleted = 5, TotalSpend = 2500.00m });
            await context.SaveChangesAsync();
        }

        // 6. Customer 2 (Bob)
        await EnsureUserAsync("customer2", "customer123", "Bob Smith", UserRole.Customer, u => {
            u.Customer = new Customer { FirstName = "Bob", LastName = "Smith", Email = "bob.smith@email.com", Phone = "+1987654321", IsGuest = false };
            u.Profile = new UserProfile { FirstName = "Bob", LastName = "Smith", Title = "Mr", Phone = "+1987654321", DateOfBirth = new DateTime(1990, 8, 22), City = "Los Angeles", CountryId = usa?.Id };
        });
    }

    public const string GuestCheckoutUsername = "guest_checkout";

    /// <summary>
    /// Shadow account used as Booking.CustomerId for anonymous checkouts (cannot sign in: IsActive = false).
    /// </summary>
    public static async Task EnsureGuestCheckoutUserAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Username == GuestCheckoutUsername))
        {
            return;
        }

        var guestUser = new User
        {
            Username = GuestCheckoutUsername,
            PasswordHash = HashPassword(Guid.NewGuid().ToString("N")),
            Name = "Guest Checkout",
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow,
            IsActive = false,
        };

        await context.Users.AddAsync(guestUser);
        await context.SaveChangesAsync();
    }

    public static async Task SeedFlightsAsync(ApplicationDbContext context)
    {
        var existingFlights = await context.Flights.AnyAsync();
        if (existingFlights)
        {
            return;
        }

        var utcNow = DateTime.UtcNow;

        var flights = new List<Flight>
        {
            new Flight
            {
                FlightNumber = "CA101",
                Departure = "London Heathrow (LHR)",
                Destination = "Dubai International (DXB)",
                DepartureTime = utcNow.AddDays(2).Date.AddHours(8),
                ArrivalTime = utcNow.AddDays(2).Date.AddHours(16),
                Price = 420.00m,
                SeatsAvailable = 110,
                Airline = "British Airways",
                Stops = 0,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA102",
                Departure = "London Heathrow (LHR)",
                Destination = "Abu Dhabi International (AUH)",
                DepartureTime = utcNow.AddDays(2).Date.AddHours(14),
                ArrivalTime = utcNow.AddDays(2).Date.AddHours(22),
                Price = 395.00m,
                SeatsAvailable = 95,
                Airline = "Emirates",
                Stops = 0,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA201",
                Departure = "Manchester (MAN)",
                Destination = "Doha Hamad (DOH)",
                DepartureTime = utcNow.AddDays(3).Date.AddHours(10),
                ArrivalTime = utcNow.AddDays(3).Date.AddHours(18),
                Price = 360.00m,
                SeatsAvailable = 88,
                Airline = "Qatar Airways",
                Stops = 1,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA202",
                Departure = "Birmingham (BHX)",
                Destination = "Istanbul (IST)",
                DepartureTime = utcNow.AddDays(4).Date.AddHours(6),
                ArrivalTime = utcNow.AddDays(4).Date.AddHours(12),
                Price = 250.00m,
                SeatsAvailable = 120,
                Airline = "Turkish Airlines",
                Stops = 0,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA301",
                Departure = "Edinburgh (EDI)",
                Destination = "Paris Charles de Gaulle (CDG)",
                DepartureTime = utcNow.AddDays(5).Date.AddHours(9),
                ArrivalTime = utcNow.AddDays(5).Date.AddHours(12),
                Price = 140.00m,
                SeatsAvailable = 150,
                Airline = "Air France",
                Stops = 0,
                HasCheckInBaggage = false,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA302",
                Departure = "London Gatwick (LGW)",
                Destination = "Barcelona (BCN)",
                DepartureTime = utcNow.AddDays(6).Date.AddHours(11),
                ArrivalTime = utcNow.AddDays(6).Date.AddHours(15),
                Price = 165.00m,
                SeatsAvailable = 132,
                Airline = "Vueling",
                Stops = 0,
                HasCheckInBaggage = false,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA401",
                Departure = "Dubai International (DXB)",
                Destination = "London Heathrow (LHR)",
                DepartureTime = utcNow.AddDays(9).Date.AddHours(9),
                ArrivalTime = utcNow.AddDays(9).Date.AddHours(15),
                Price = 470.00m,
                SeatsAvailable = 102,
                Airline = "British Airways",
                Stops = 0,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA402",
                Departure = "Barcelona (BCN)",
                Destination = "London Gatwick (LGW)",
                DepartureTime = utcNow.AddDays(8).Date.AddHours(18),
                ArrivalTime = utcNow.AddDays(8).Date.AddHours(20),
                Price = 145.00m,
                SeatsAvailable = 144,
                Airline = "Vueling",
                Stops = 0,
                HasCheckInBaggage = false,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA403",
                Departure = "Paris Charles de Gaulle (CDG)",
                Destination = "Edinburgh (EDI)",
                DepartureTime = utcNow.AddDays(7).Date.AddHours(13),
                ArrivalTime = utcNow.AddDays(7).Date.AddHours(15),
                Price = 155.00m,
                SeatsAvailable = 128,
                Airline = "Air France",
                Stops = 0,
                HasCheckInBaggage = false,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA404",
                Departure = "Doha Hamad (DOH)",
                Destination = "Manchester (MAN)",
                DepartureTime = utcNow.AddDays(10).Date.AddHours(22),
                ArrivalTime = utcNow.AddDays(11).Date.AddHours(6),
                Price = 395.00m,
                SeatsAvailable = 84,
                Airline = "Qatar Airways",
                Stops = 1,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA405",
                Departure = "Istanbul (IST)",
                Destination = "Birmingham (BHX)",
                DepartureTime = utcNow.AddDays(9).Date.AddHours(7),
                ArrivalTime = utcNow.AddDays(9).Date.AddHours(11),
                Price = 240.00m,
                SeatsAvailable = 118,
                Airline = "Turkish Airlines",
                Stops = 0,
                HasCheckInBaggage = true,
                HasHandLuggage = false
            },
            new Flight
            {
                FlightNumber = "CA406",
                Departure = "London Heathrow (LHR)",
                Destination = "Paris Charles de Gaulle (CDG)",
                DepartureTime = utcNow.AddDays(2).Date.AddHours(12),
                ArrivalTime = utcNow.AddDays(2).Date.AddHours(14),
                Price = 130.00m,
                SeatsAvailable = 160,
                Airline = "Air France",
                Stops = 0,
                HasCheckInBaggage = false,
                HasHandLuggage = true
            },
            new Flight
            {
                FlightNumber = "CA407",
                Departure = "Paris Charles de Gaulle (CDG)",
                Destination = "Dubai International (DXB)",
                DepartureTime = utcNow.AddDays(3).Date.AddHours(21),
                ArrivalTime = utcNow.AddDays(4).Date.AddHours(6),
                Price = 510.00m,
                SeatsAvailable = 90,
                Airline = "Emirates",
                Stops = 0,
                HasCheckInBaggage = true,
                HasHandLuggage = true
            }
        };

        await context.Flights.AddRangeAsync(flights);
        await context.SaveChangesAsync();
    }

    public static async Task EnsureFlightUiMetadataAsync(ApplicationDbContext context)
    {
        var metadataByFlightNumber = new Dictionary<string, (string airline, int stops, bool checkInBag, bool handLuggage)>
        {
            ["CA101"] = ("British Airways", 0, true, true),
            ["CA102"] = ("Emirates", 0, true, true),
            ["CA205"] = ("Qatar Airways", 1, true, true),
            ["CA310"] = ("JetBlue", 0, false, true),
            ["CA415"] = ("United Airlines", 0, true, true),
            ["CA520"] = ("Air Canada", 0, false, true),
            ["CA605"] = ("Air Canada", 1, true, true),
            ["CA730"] = ("Singapore Airlines", 1, true, true),
        };

        var flights = await context.Flights.ToListAsync();
        var hasChanges = false;

        foreach (var flight in flights)
        {
            if (metadataByFlightNumber.TryGetValue(flight.FlightNumber, out var metadata))
            {
                if (flight.Airline != metadata.airline ||
                    flight.Stops != metadata.stops ||
                    flight.HasCheckInBaggage != metadata.checkInBag ||
                    flight.HasHandLuggage != metadata.handLuggage)
                {
                    flight.Airline = metadata.airline;
                    flight.Stops = metadata.stops;
                    flight.HasCheckInBaggage = metadata.checkInBag;
                    flight.HasHandLuggage = metadata.handLuggage;
                    hasChanges = true;
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(flight.Airline))
                {
                    flight.Airline = "Unknown Airline";
                    hasChanges = true;
                }

                if (flight.Stops < 0)
                {
                    flight.Stops = 0;
                    hasChanges = true;
                }
            }
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedServicePackagesAsync(ApplicationDbContext context)
    {
        var seeds = new List<ServicePackageCatalogItem>
        {
            new ServicePackageCatalogItem
            {
                Code = "free",
                Name = "Free",
                PricePerPassenger = 0m,
                TopChoice = false,
                FeaturesJson = JsonSerializer.Serialize(new[] { "Basic support" }),
                SortOrder = 1,
                IsActive = true
            },
            new ServicePackageCatalogItem
            {
                Code = "bronze",
                Name = "Bronze",
                PricePerPassenger = 19.99m,
                TopChoice = false,
                FeaturesJson = JsonSerializer.Serialize(new[] { "Airline failure protection" }),
                SortOrder = 2,
                IsActive = true
            },
            new ServicePackageCatalogItem
            {
                Code = "silver",
                Name = "Silver",
                PricePerPassenger = 39.99m,
                TopChoice = true,
                FeaturesJson = JsonSerializer.Serialize(new[] { "Failure protection", "Speedy refund", "Baggage tracking" }),
                SortOrder = 3,
                IsActive = true
            }
        };

        var existing = await context.ServicePackageCatalogItems
            .ToDictionaryAsync(x => x.Code, StringComparer.OrdinalIgnoreCase);

        var hasChanges = false;
        foreach (var seed in seeds)
        {
            if (existing.TryGetValue(seed.Code, out var current))
            {
                current.Name = seed.Name;
                current.PricePerPassenger = seed.PricePerPassenger;
                current.TopChoice = seed.TopChoice;
                current.FeaturesJson = seed.FeaturesJson;
                current.SortOrder = seed.SortOrder;
                current.IsActive = seed.IsActive;
                hasChanges = true;
            }
            else
            {
                await context.ServicePackageCatalogItems.AddAsync(seed);
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedRefundOptionsAsync(ApplicationDbContext context)
    {
        var seeds = new List<RefundOptionCatalogItem>
        {
            new RefundOptionCatalogItem
            {
                Code = "standard",
                Title = "Standard refund policy",
                PricePerPassenger = 0m,
                Recommended = false,
                BulletsJson = JsonSerializer.Serialize(new[] { "Standard airline cancellation policy" }),
                SortOrder = 1,
                IsActive = true
            },
            new RefundOptionCatalogItem
            {
                Code = "extended",
                Title = "Extended refund",
                PricePerPassenger = 368.62m,
                Recommended = true,
                BulletsJson = JsonSerializer.Serialize(new[] { "100% refund for covered reasons" }),
                SortOrder = 2,
                IsActive = true
            }
        };

        var existing = await context.RefundOptionCatalogItems
            .ToDictionaryAsync(x => x.Code, StringComparer.OrdinalIgnoreCase);

        var hasChanges = false;
        foreach (var seed in seeds)
        {
            if (existing.TryGetValue(seed.Code, out var current))
            {
                current.Title = seed.Title;
                current.PricePerPassenger = seed.PricePerPassenger;
                current.Recommended = seed.Recommended;
                current.BulletsJson = seed.BulletsJson;
                current.SortOrder = seed.SortOrder;
                current.IsActive = seed.IsActive;
                hasChanges = true;
            }
            else
            {
                await context.RefundOptionCatalogItems.AddAsync(seed);
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedLeisurePackagesAsync(ApplicationDbContext context)
    {
        var sql = @"
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LeisurePackages' AND xtype='U')
BEGIN
CREATE TABLE LeisurePackages (
    Id int IDENTITY(1,1) PRIMARY KEY,
    Destination nvarchar(100) NOT NULL,
    Badge nvarchar(50) NOT NULL DEFAULT '',
    BadgeColor nvarchar(20) NOT NULL DEFAULT '',
    Image nvarchar(500) NOT NULL DEFAULT '',
    Title nvarchar(200) NOT NULL DEFAULT '',
    Subtitle nvarchar(500) NOT NULL DEFAULT '',
    Nights nvarchar(50) NOT NULL DEFAULT '',
    WasPrice nvarchar(100) NOT NULL DEFAULT '',
    Price nvarchar(100) NOT NULL DEFAULT '',
    PerLabel nvarchar(50) NOT NULL DEFAULT '',
    [Save] nvarchar(100) NOT NULL DEFAULT '',
    IsActive bit NOT NULL DEFAULT 1,
    CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE()
);
END;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LeisurePackageDetails' AND xtype='U')
BEGIN
CREATE TABLE LeisurePackageDetails (
    Id int IDENTITY(1,1) PRIMARY KEY,
    LeisurePackageId int NOT NULL,
    Experience nvarchar(max) NOT NULL DEFAULT '',
    DetailsJson nvarchar(max) NOT NULL DEFAULT '[]',
    TagsJson nvarchar(max) NOT NULL DEFAULT '[]',
    WhatsIncludedJson nvarchar(max) NOT NULL DEFAULT '[]',
    ItineraryJson nvarchar(max) NOT NULL DEFAULT '[]',
    TiersJson nvarchar(max) NOT NULL DEFAULT '[]',
    AccommodationCost decimal(18,2) NOT NULL DEFAULT 0,
    TransfersCost decimal(18,2) NOT NULL DEFAULT 0,
    ServiceFee decimal(18,2) NOT NULL DEFAULT 0,
    EstimatedCost decimal(18,2) NOT NULL DEFAULT 0,
    GalleryImagesJson nvarchar(max) NOT NULL DEFAULT '[]',
    ReviewsJson nvarchar(max) NOT NULL DEFAULT '[]',
    CONSTRAINT FK_LeisurePackageDetails_LeisurePackages FOREIGN KEY (LeisurePackageId) REFERENCES LeisurePackages(Id) ON DELETE CASCADE
);
END;";
        await context.Database.ExecuteSqlRawAsync(sql);

        var existingPackages = await context.LeisurePackages.AnyAsync();
        if (existingPackages)
        {
            return;
        }

        var packages = new List<LeisurePackage>
        {
            new LeisurePackage
            {
                Destination = "Turkey",
                Badge = "Popular",
                BadgeColor = "#e63946",
                Image = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80",
                Title = "Turkey Escape",
                Subtitle = "Immerse yourself in the crossroads of two continents — historic bazaars, turquoise coasts, and warm Turkish hospitality await.",
                Nights = "8 Nights",
                Price = "1550",
                WasPrice = "2000",
                PerLabel = "Per Person",
                Save = "Save 22%",
                IsActive = true,
                Detail = new LeisurePackageDetail
                {
                    Experience = "Drift through ancient ruins at sunrise, cruise the Aegean Sea at dusk, and unwind in a traditional hammam. Eight nights of pure discovery.",
                    WhatsIncludedJson = JsonSerializer.Serialize(new[]
                    {
                        new { title = "Return Flights", desc = "Business class flights from major hubs" },
                        new { title = "Boutique Hotel", desc = "Cave hotel in Cappadocia included" },
                        new { title = "All Inclusive Dining", desc = "Gourmet meals & local cuisine tours" },
                        new { title = "Hot Air Balloon", desc = "Sunrise balloon ride over Cappadocia" }
                    }),
                    ItineraryJson = JsonSerializer.Serialize(new[]
                    {
                        new { day = "Day 1", title = "Arrival & Istanbul", desc = "Transfer to hotel. Evening Bosphorus cruise." },
                        new { day = "Day 2-3", title = "Istanbul Discovery", desc = "Blue Mosque, Grand Bazaar, Topkapi Palace." },
                        new { day = "Day 4-5", title = "Cappadocia", desc = "Hot air balloon, fairy chimneys & underground cities." },
                        new { day = "Day 6", title = "Aegean Coast", desc = "Boat trip along the turquoise coast." },
                        new { day = "Day 7", title = "Leisure & Spa", desc = "Relax in a traditional hammam. Optional excursions." },
                        new { day = "Day 8", title = "Bazaar & Shopping", desc = "Spice market, local crafts, farewell dinner." }
                    }),
                    TiersJson = JsonSerializer.Serialize(new[]
                    {
                        new { name = "Standard", price = 1550m, desc = "Boutique hotel, economy flight", isPopular = false },
                        new { name = "Premium", price = 2100m, desc = "Cave hotel, premium economy", isPopular = true },
                        new { name = "Luxury", price = 3800m, desc = "Private villa, business class", isPopular = false }
                    }),
                    AccommodationCost = 1550m,
                    TransfersCost = 120m,
                    ServiceFee = 50m,
                    EstimatedCost = 1550m,
                    GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
                        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
                        "https://images.unsplash.com/photo-1571867424488-4565932edb41?w=600&q=80",
                        "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=600&q=80"
                    }),
                    ReviewsJson = JsonSerializer.Serialize(new[]
                    {
                        new { stars = 5, text = "The hot air balloon over Cappadocia was breathtaking.", name = "Sophia", stayed = "Stayed at Aug-2025" },
                        new { stars = 5, text = "The cave hotel was beyond expectations.", name = "James", stayed = "Stayed at Jul-2025" }
                    })
                }
            },
            new LeisurePackage
            {
                Destination = "Thailand + Sri Lanka",
                Badge = "Family Favorite",
                BadgeColor = "#2a9d8f",
                Image = "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80",
                Title = "Bangkok & Colombo Getaway",
                Subtitle = "Two vibrant cities, one unforgettable family journey — street food, temples, beaches, and smiles all the way.",
                Nights = "16 Nights",
                Price = "5580",
                PerLabel = "Total",
                IsActive = true,
                Detail = new LeisurePackageDetail
                {
                    Experience = "From Bangkok's gilded temples and night markets to Colombo's colonial charm and pristine beaches.",
                    WhatsIncludedJson = JsonSerializer.Serialize(new[]
                    {
                        new { title = "All Flights", desc = "3-leg flights from major international hubs" },
                        new { title = "4-Star Hotels", desc = "Family rooms in both destinations" },
                        new { title = "Meals & Activities", desc = "Guided tours & local cuisine included" },
                        new { title = "Transfers", desc = "Airport & inter-city transfers included" }
                    }),
                    ItineraryJson = JsonSerializer.Serialize(new[]
                    {
                        new { day = "Day 1", title = "Arrival Bangkok", desc = "Airport transfer, hotel check-in, welcome dinner." },
                        new { day = "Day 2-3", title = "Bangkok Temples", desc = "Grand Palace, Wat Pho, floating market tour." },
                        new { day = "Day 4-5", title = "Beach & Leisure", desc = "Day trip to Pattaya or Kanchanaburi." },
                        new { day = "Day 6", title = "Flight to Colombo", desc = "Transfer to Sri Lanka. Evening arrival." },
                        new { day = "Day 7-8", title = "Colombo City", desc = "Colonial forts, spice markets, Galle Face Green." },
                        new { day = "Day 9-10", title = "Beaches", desc = "Mirissa beach, whale watching optional." }
                    }),
                    TiersJson = JsonSerializer.Serialize(new[]
                    {
                        new { name = "Standard", price = 5580m, desc = "4-star hotels, economy flights", isPopular = false },
                        new { name = "Premium", price = 6800m, desc = "5-star hotels, premium economy", isPopular = true },
                        new { name = "Luxury", price = 9200m, desc = "Luxury resorts, business class", isPopular = false }
                    }),
                    AccommodationCost = 5580m,
                    TransfersCost = 620m,
                    ServiceFee = 200m,
                    EstimatedCost = 5580m,
                    GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
                        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80",
                        "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600&q=80",
                        "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=600&q=80"
                    }),
                    ReviewsJson = JsonSerializer.Serialize(new[]
                    {
                        new { stars = 5, text = "The kids absolutely loved Bangkok's floating market.", name = "Rachel", stayed = "Stayed at Aug-2025" },
                        new { stars = 5, text = "Incredible value for a 17-day family trip.", name = "David", stayed = "Stayed at Jul-2025" }
                    })
                }
            },
            new LeisurePackage
            {
                Destination = "Maldives",
                Badge = "Limited Spots",
                BadgeColor = "#e76f51",
                Image = "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80",
                Title = "Maldives Bliss Escape",
                Subtitle = "Awaken to the gentle rhythm of the Indian Ocean in your private sanctuary.",
                Nights = "6 Nights",
                Price = "120",
                WasPrice = "150",
                PerLabel = "Per Person",
                Save = "20%",
                IsActive = true,
                Detail = new LeisurePackageDetail
                {
                    Experience = "Float above the turquoise Indian Ocean in your own overwater villa. Seven nights of pure calm.",
                    TagsJson = JsonSerializer.Serialize(new[] { "Flights", "All Inclusive", "Overwater Villa" }),
                    WhatsIncludedJson = JsonSerializer.Serialize(new[]
                    {
                        new { title = "Return Flights", desc = "Business class flights from major hubs" },
                        new { title = "Overwater Villa", desc = "Platinum Villa with infinity pool" },
                        new { title = "All Inclusive Dining", desc = "Gourmet meals across 5 specialty restaurants" },
                        new { title = "Guided Snorkelling", desc = "Professional Guided Tour" }
                    }),
                    ItineraryJson = JsonSerializer.Serialize(new[]
                    {
                        new { day = "Day 1", title = "Arrival & Welcome", desc = "Speedboat transfer to resort." },
                        new { day = "Day 2-3", title = "Ocean & Reef", desc = "Morning snorkelling, dolphin cruise." },
                        new { day = "Day 4-5", title = "Island Hopping", desc = "Day trip to a local Maldivian island." },
                        new { day = "Day 6", title = "Leisure & Spa", desc = "Fully free day." }
                    }),
                    TiersJson = JsonSerializer.Serialize(new[]
                    {
                        new { name = "Standard", price = 2210m, desc = "Garden-view villa, economy flight", isPopular = false },
                        new { name = "Premium", price = 3210m, desc = "Garden-view villa, premium economy", isPopular = true },
                        new { name = "Luxury", price = 5210m, desc = "Overwater villa, business class", isPopular = false }
                    }),
                    AccommodationCost = 6420m,
                    TransfersCost = 120m,
                    ServiceFee = 0m,
                    EstimatedCost = 2210m,
                    GalleryImagesJson = JsonSerializer.Serialize(new[]
                    {
                        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
                        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80",
                        "https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=600&q=80",
                        "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80"
                    }),
                    ReviewsJson = JsonSerializer.Serialize(new[]
                    {
                        new { stars = 5, text = "We celebrated our 10th anniversary here...", name = "Elena", stayed = "Stayed at Jul-2026" }
                    })
                }
            }
        };

        context.LeisurePackages.AddRange(packages);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Idempotently adds any columns that exist in the EF model but are missing from the DB.
    /// Run this FIRST before any other seeder.
    /// </summary>
    public static async Task EnsureCheckInColumnsAsync(ApplicationDbContext context)
    {
        var sql = @"
-- Check-in columns on Bookings
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'IsCheckedIn')
    ALTER TABLE [Bookings] ADD [IsCheckedIn] bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'SeatNumber')
    ALTER TABLE [Bookings] ADD [SeatNumber] nvarchar(10) NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'CheckedInAt')
    ALTER TABLE [Bookings] ADD [CheckedInAt] datetime2 NULL;

-- UpdatedAt columns missing from Users / Customers / UserProfiles
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'UpdatedAt')
    ALTER TABLE [Users] ADD [UpdatedAt] datetime2 NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Customers' AND COLUMN_NAME = 'UpdatedAt')
    ALTER TABLE [Customers] ADD [UpdatedAt] datetime2 NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'UserProfiles' AND COLUMN_NAME = 'UpdatedAt')
    ALTER TABLE [UserProfiles] ADD [UpdatedAt] datetime2 NULL;";

        await context.Database.ExecuteSqlRawAsync(sql);
    }
}