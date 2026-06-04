using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Search.Models;

namespace Carlton.CustomerSelfService.Features.Search.Data.Configurations;

public class HotelSearchConfiguration : IEntityTypeConfiguration<HotelSearch>
{
    public void Configure(EntityTypeBuilder<HotelSearch> entity)
    {
        entity.HasKey(e => new { e.DeviceId, e.SearchId });
        entity.Property(e => e.DeviceId).HasMaxLength(128).IsRequired();
        entity.Property(e => e.SearchId).HasDefaultValueSql("NEWID()");
        entity.Property(e => e.Destination).HasMaxLength(200);
        entity.Property(e => e.CheckInDate).HasColumnType("date");
        entity.Property(e => e.CheckOutDate).HasColumnType("date");
        entity.Property(e => e.MealPreferences).HasMaxLength(200);
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

        entity.HasIndex(e => e.DeviceId);
        entity.HasIndex(e => e.CreatedAt);
    }
}
