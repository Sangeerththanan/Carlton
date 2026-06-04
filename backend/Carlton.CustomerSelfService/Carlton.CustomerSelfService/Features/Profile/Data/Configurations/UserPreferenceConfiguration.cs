using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Profile.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Data.Configurations;

public class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
{
    public void Configure(EntityTypeBuilder<UserPreference> builder)
    {
        builder.HasKey(e => e.UserId);

        builder.Property(e => e.Language).IsRequired().HasMaxLength(10).HasDefaultValue("en");
        builder.Property(e => e.CurrencyCode).IsRequired().HasMaxLength(3).HasDefaultValue("USD");
        builder.Property(e => e.Theme).IsRequired().HasMaxLength(20).HasDefaultValue("Light");
    }
}
