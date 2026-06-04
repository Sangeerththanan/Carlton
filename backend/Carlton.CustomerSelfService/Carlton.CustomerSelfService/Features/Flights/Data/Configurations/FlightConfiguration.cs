using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Flights.Models;

namespace Carlton.CustomerSelfService.Features.Flights.Data.Configurations;

public class FlightConfiguration : IEntityTypeConfiguration<Flight>
{
    public void Configure(EntityTypeBuilder<Flight> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.FlightNumber).IsRequired().HasMaxLength(10);
        entity.Property(e => e.Departure).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Destination).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Airline).IsRequired().HasMaxLength(100);
        entity.Property(e => e.Price).HasPrecision(10, 2);
        entity.HasIndex(e => e.FlightNumber).IsUnique();
    }
}
