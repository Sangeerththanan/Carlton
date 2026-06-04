using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Search.Models;

namespace Carlton.CustomerSelfService.Features.Search.Data.Configurations;

public class CarSearchConfiguration : IEntityTypeConfiguration<CarSearch>
{
    public void Configure(EntityTypeBuilder<CarSearch> entity)
    {
        entity.HasKey(e => new { e.DeviceId, e.SearchId });
        entity.Property(e => e.DeviceId).HasMaxLength(128).IsRequired();
        entity.Property(e => e.SearchId).HasDefaultValueSql("NEWID()");
        entity.Property(e => e.PickupLocation).HasMaxLength(200);
        entity.Property(e => e.ReturnLocation).HasMaxLength(200);
        entity.Property(e => e.PickupDate).HasColumnType("date");
        entity.Property(e => e.ReturnDate).HasColumnType("date");
        entity.Property(e => e.PickupTime).HasColumnType("time");
        entity.Property(e => e.ReturnTime).HasColumnType("time");
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        entity.HasIndex(e => e.DeviceId);
        entity.HasIndex(e => e.CreatedAt);
    }
}
