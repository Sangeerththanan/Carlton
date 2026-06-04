using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Search.Models;

namespace Carlton.CustomerSelfService.Features.Search.Data.Configurations;

public class FlightSearchConfiguration : IEntityTypeConfiguration<FlightSearch>
{
    public void Configure(EntityTypeBuilder<FlightSearch> entity)
    {
        entity.HasKey(e => new { e.DeviceId, e.SearchId });
        entity.Property(e => e.DeviceId).HasMaxLength(128).IsRequired();
        entity.Property(e => e.SearchId).HasDefaultValueSql("NEWID()");
        entity.Property(e => e.FromLocation).HasMaxLength(200);
        entity.Property(e => e.ToLocation).HasMaxLength(200);
        entity.Property(e => e.TripType).HasMaxLength(20).IsRequired();
        entity.Property(e => e.DepartureDate).HasColumnType("date");
        entity.Property(e => e.ReturnDate).HasColumnType("date");
        entity.Property(e => e.CabinClass).HasMaxLength(50);
        entity.Property(e => e.Airlines).HasMaxLength(200);
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        entity.HasMany(e => e.Legs)
            .WithOne(l => l.Search)
            .HasForeignKey(l => new { l.DeviceId, l.SearchId })
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(e => e.DeviceId);
        entity.HasIndex(e => e.CreatedAt);
    }
}
