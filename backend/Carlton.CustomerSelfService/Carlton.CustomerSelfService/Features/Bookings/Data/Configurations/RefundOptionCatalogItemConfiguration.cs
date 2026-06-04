using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Bookings.Models;

namespace Carlton.CustomerSelfService.Features.Bookings.Data.Configurations;

public class RefundOptionCatalogItemConfiguration : IEntityTypeConfiguration<RefundOptionCatalogItem>
{
    public void Configure(EntityTypeBuilder<RefundOptionCatalogItem> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
        entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
        entity.Property(e => e.PricePerPassenger).HasPrecision(10, 2);
        entity.Property(e => e.BulletsJson).IsRequired();
        entity.Property(e => e.IsActive).HasDefaultValue(true);

        entity.HasIndex(e => e.Code).IsUnique();
        entity.HasIndex(e => new { e.IsActive, e.SortOrder });
    }
}
