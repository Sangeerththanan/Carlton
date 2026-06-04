using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Carlton.CustomerSelfService.Features.Bookings.Models;

namespace Carlton.CustomerSelfService.Features.Bookings.Data.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> entity)
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.BookingReference).IsRequired().HasMaxLength(20);
        entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        entity.Property(e => e.TotalPrice).HasPrecision(10, 2);
        entity.Property(e => e.RefundAmount).HasPrecision(10, 2);
        entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(50);
        entity.Property(e => e.SpecialRequests).HasMaxLength(1000);
        entity.Property(e => e.PassengerNames).HasMaxLength(2000);
        entity.Property(e => e.BookingClass).HasMaxLength(100);
        entity.Property(e => e.CancellationReason).HasMaxLength(500);
        entity.Property(e => e.BookingDate).HasDefaultValueSql("GETUTCDATE()");
        
        // Relationships
        entity.HasOne(e => e.Customer)
              .WithMany()
              .HasForeignKey(e => e.CustomerId)
              .OnDelete(DeleteBehavior.Restrict);
              
        entity.HasOne(e => e.Flight)
              .WithMany()
              .HasForeignKey(e => e.FlightId)
              .OnDelete(DeleteBehavior.Restrict);
              
        // Indexes
        entity.HasIndex(e => e.BookingReference).IsUnique();
        entity.HasIndex(e => e.CustomerId);
        entity.HasIndex(e => e.FlightId);
        entity.HasIndex(e => e.Status);
        entity.HasIndex(e => e.BookingDate);
    }
}
