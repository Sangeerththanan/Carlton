using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Carlton.CustomerSelfService.Features.Login.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Models;

public class UserPreference
{
    [Key]
    [ForeignKey("User")]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(10)]
    public string Language { get; set; } = "en";

    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = "USD";

    [Required]
    [MaxLength(20)]
    public string Theme { get; set; } = "Light";

    [MaxLength(50)]
    public string? Timezone { get; set; }

    public bool EmailNotifications { get; set; } = true;
    public bool SMSNotifications { get; set; } = false;
    public bool PushNotifications { get; set; } = true;
    
    [MaxLength(100)]
    public string? PreferredRoute { get; set; }

    [MaxLength(50)]
    public string? PreferredClass { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
