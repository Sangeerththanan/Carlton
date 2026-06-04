using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Profile.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Data.Configurations;

public class CustomerTravellerConfiguration : IEntityTypeConfiguration<CustomerTraveller>
{
    public void Configure(EntityTypeBuilder<CustomerTraveller> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.DateOfBirth).HasColumnType("date");
        builder.Property(e => e.PassportExpiryDate).HasColumnType("date");

        builder.HasOne(e => e.Customer)
               .WithMany()
               .HasForeignKey(e => e.CustomerId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Nationality)
               .WithMany()
               .HasForeignKey(e => e.NationalityId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.PassportCountry)
               .WithMany()
               .HasForeignKey(e => e.PassportCountryId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
