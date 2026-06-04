using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.Profile.Models;

public class CustomerTravelStat
{
    [Key]
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int TripsCompleted { get; set; } = 0;

    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalSpend { get; set; } = 0;

    public DateTime? LastTripAt { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
