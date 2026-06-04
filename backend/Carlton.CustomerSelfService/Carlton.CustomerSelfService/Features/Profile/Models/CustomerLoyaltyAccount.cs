using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.Profile.Models;

public class CustomerLoyaltyAccount
{
    [Key]
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int LoyaltyPoints { get; set; } = 0;

    [Required]
    [MaxLength(20)]
    public string TierLevel { get; set; } = "Bronze";

    [Column(TypeName = "date")]
    public DateTime MemberSinceDate { get; set; } = DateTime.UtcNow.Date;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
