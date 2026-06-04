using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Login.Models;

namespace Carlton.CustomerSelfService.Features.Login.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
        entity.Property(e => e.DeviceInfo).HasMaxLength(500);
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        entity.HasOne(e => e.User)
              .WithMany(u => u.RefreshTokens)
              .HasForeignKey(e => e.UserId)
              .OnDelete(DeleteBehavior.Cascade);
    }
}
