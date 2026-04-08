using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Features.Login.Models;

namespace backend.Features.Bookings.Models;

public class Booking
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int CustomerId { get; set; }
    
    [ForeignKey("CustomerId")]
    public virtual User Customer { get; set; } = null!;
    
    [Required]
    public int FlightId { get; set; }
    
    [ForeignKey("FlightId")]
    public virtual Features.Flights.Models.Flight Flight { get; set; } = null!;
    
    [Required]
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string BookingReference { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalPrice { get; set; }
    
    [Required]
    [Range(1, 10)]
    public int SeatsBooked { get; set; }
    
    [Required]
    public DateTime BookingDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Refunded
    
    [MaxLength(1000)]
    [Column(TypeName = "nvarchar(1000)")]
    public string? SpecialRequests { get; set; }
    
    [MaxLength(255)]
    [Column(TypeName = "nvarchar(255)")]
    public string? PassengerNames { get; set; } // JSON string of passenger names
    
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string? BookingClass { get; set; } // Economy, Business, First
    
    public DateTime? ConfirmedAt { get; set; }
    
    public DateTime? CancelledAt { get; set; }
    
    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string? CancellationReason { get; set; }
    
    public bool IsPaid { get; set; } = false;
    
    public decimal? RefundAmount { get; set; }
    
    public DateTime? RefundedAt { get; set; }
}
