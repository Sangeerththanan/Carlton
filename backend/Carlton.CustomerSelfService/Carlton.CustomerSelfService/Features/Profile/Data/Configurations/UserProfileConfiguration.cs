using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Profile.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Data.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(e => e.UserId);

        builder.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.DateOfBirth).HasColumnType("date");

        builder.HasOne(e => e.Nationality)
               .WithMany()
               .HasForeignKey(e => e.NationalityId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Country)
               .WithMany()
               .HasForeignKey(e => e.CountryId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
