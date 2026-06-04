using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Login.Models;

namespace Carlton.CustomerSelfService.Features.Login.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
        entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
        entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        entity.HasIndex(e => e.Username).IsUnique();

        entity.HasOne(e => e.Customer)
              .WithOne()
              .HasForeignKey<User>(e => e.CustomerId)
              .OnDelete(DeleteBehavior.Restrict);
    }
}
