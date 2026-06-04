using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Search.Models;

namespace Carlton.CustomerSelfService.Features.Search.Data.Configurations;

public class FlightSearchLegConfiguration : IEntityTypeConfiguration<FlightSearchLeg>
{
    public void Configure(EntityTypeBuilder<FlightSearchLeg> entity)
    {
        entity.HasKey(e => new { e.DeviceId, e.SearchId, e.Sequence });
        entity.Property(e => e.DeviceId).HasMaxLength(128).IsRequired();
        entity.Property(e => e.FromLocation).HasMaxLength(200);
        entity.Property(e => e.ToLocation).HasMaxLength(200);
        entity.Property(e => e.DepartureDate).HasColumnType("date");

        entity.HasIndex(e => new { e.DeviceId, e.SearchId });
    }
}
