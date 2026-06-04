using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Profile.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Data.Configurations;

public class FrequentFlyerProgramConfiguration : IEntityTypeConfiguration<FrequentFlyerProgram>
{
    public void Configure(EntityTypeBuilder<FrequentFlyerProgram> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ProgramName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.MembershipNumber).IsRequired().HasMaxLength(50);
        builder.Property(e => e.StatusLevel).HasMaxLength(50);

        builder.HasOne(e => e.Customer)
               .WithMany()
               .HasForeignKey(e => e.CustomerId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Airline)
               .WithMany()
               .HasForeignKey(e => e.AirlineId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
