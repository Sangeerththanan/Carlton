using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Carlton.CustomerSelfService.Features.Login.Models;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Models;

public class LeisurePlan
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [ForeignKey("CustomerId")]
    public virtual User Customer { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    [Column(TypeName = "nvarchar(200)")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string PlanType { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Tier { get; set; } = "Standard";

    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Status { get; set; } = "Confirmed"; // Confirmed, Past, Cancelled, Pending

    [MaxLength(200)]
    [Column(TypeName = "nvarchar(200)")]
    public string DepartureAirport { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string Destinations { get; set; } = string.Empty; // comma-separated

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [MaxLength(200)]
    [Column(TypeName = "nvarchar(200)")]
    public string Passengers { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal EstimatedCost { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Budget { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string LegsJson { get; set; } = "[]"; // JSON array of { flag, city, days }

    [Column(TypeName = "nvarchar(max)")]
    public string ActivitiesJson { get; set; } = "[]"; // JSON array of strings

    [Column(TypeName = "nvarchar(max)")]
    public string FlightsJson { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string HotelsJson { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string ItineraryJson { get; set; } = "{}";

    [Column(TypeName = "nvarchar(max)")]
    public string MealPlanJson { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ConfirmedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string? CancellationReason { get; set; }
}
