using Carlton.CustomerSelfService.Features.TravelPlans.Models;
using Microsoft.EntityFrameworkCore;

namespace Carlton.CustomerSelfService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Travel Plans tables
    public DbSet<TravelPlan> TravelPlans { get; set; }
    public DbSet<TravelPlanFlight> TravelPlanFlights { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TravelPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MaxBudget).HasPrecision(18, 2);

            // One TravelPlan has many TravelPlanFlights
            entity.HasMany(e => e.Flights)
                  .WithOne(f => f.TravelPlan)
                  .HasForeignKey(f => f.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}