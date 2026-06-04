using Microsoft.EntityFrameworkCore;
using Carlton.CustomerSelfService.Features.Flights.Models;
using Carlton.CustomerSelfService.Features.Login.Models;
using Carlton.CustomerSelfService.Features.Bookings.Models;
using Carlton.CustomerSelfService.Features.Profile.Models;
using Carlton.CustomerSelfService.Features.LeisurePlan.Models;
using Carlton.CustomerSelfService.Features.Flights.Data.Configurations;
using Carlton.CustomerSelfService.Features.Login.Data.Configurations;
using Carlton.CustomerSelfService.Features.Bookings.Data.Configurations;
using Carlton.CustomerSelfService.Features.Profile.Data.Configurations;
using Carlton.CustomerSelfService.Features.Search.Data.Configurations;
using Carlton.CustomerSelfService.Features.Search.Models;

namespace Carlton.CustomerSelfService.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Flight> Flights { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Booking> Bookings { get; set; } = null!;
    public DbSet<ServicePackageCatalogItem> ServicePackageCatalogItems { get; set; } = null!;
    public DbSet<RefundOptionCatalogItem> RefundOptionCatalogItems { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    
    // Industrial Schema - Profile Feature
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;
    public DbSet<UserPreference> UserPreferences { get; set; } = null!;
    public DbSet<CustomerLoyaltyAccount> CustomerLoyaltyAccounts { get; set; } = null!;
    public DbSet<CustomerTravelStat> CustomerTravelStats { get; set; } = null!;
    public DbSet<CustomerTraveller> CustomerTravellers { get; set; } = null!;
    public DbSet<FrequentFlyerProgram> FrequentFlyerPrograms { get; set; } = null!;
    
    // Shared / Lookups
    public DbSet<Carlton.CustomerSelfService.Features.Shared.Models.Country> Countries { get; set; } = null!;
    public DbSet<Carlton.CustomerSelfService.Features.Shared.Models.Airline> Airlines { get; set; } = null!;

    public DbSet<LeisurePlan> LeisurePlans { get; set; } = null!;
    public DbSet<LeisurePackage> LeisurePackages { get; set; } = null!;
    public DbSet<LeisurePackageDetail> LeisurePackageDetails { get; set; } = null!;

    // Anonymous search logs
    public DbSet<FlightSearch> FlightSearches { get; set; } = null!;
    public DbSet<FlightSearchLeg> FlightSearchLegs { get; set; } = null!;
    public DbSet<HotelSearch> HotelSearches { get; set; } = null!;
    public DbSet<FlightHotelSearch> FlightHotelSearches { get; set; } = null!;
    public DbSet<FlightHotelSearchLeg> FlightHotelSearchLegs { get; set; } = null!;
    public DbSet<CarSearch> CarSearches { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations
        modelBuilder.ApplyConfiguration(new FlightConfiguration());
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        
        // Profile configurations
        modelBuilder.ApplyConfiguration(new UserProfileConfiguration());
        modelBuilder.ApplyConfiguration(new UserPreferenceConfiguration());
        modelBuilder.ApplyConfiguration(new CustomerTravellerConfiguration());
        modelBuilder.ApplyConfiguration(new FrequentFlyerProgramConfiguration());
        
        modelBuilder.ApplyConfiguration(new BookingConfiguration());
        modelBuilder.ApplyConfiguration(new ServicePackageCatalogItemConfiguration());
        modelBuilder.ApplyConfiguration(new RefundOptionCatalogItemConfiguration());

        modelBuilder.ApplyConfiguration(new FlightSearchConfiguration());
        modelBuilder.ApplyConfiguration(new FlightSearchLegConfiguration());
        modelBuilder.ApplyConfiguration(new HotelSearchConfiguration());
        modelBuilder.ApplyConfiguration(new FlightHotelSearchConfiguration());
        modelBuilder.ApplyConfiguration(new FlightHotelSearchLegConfiguration());
        modelBuilder.ApplyConfiguration(new CarSearchConfiguration());
    }
}
