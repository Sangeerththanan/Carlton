using Carlton.CustomerSelfService.Features.Login.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.Login.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    [Column(TypeName = "nvarchar(255)")]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string Name { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;

    public int? CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public Carlton.CustomerSelfService.Features.Profile.Models.Customer? Customer { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties for Profile Feature
    public Carlton.CustomerSelfService.Features.Profile.Models.UserProfile? Profile { get; set; }
    public Carlton.CustomerSelfService.Features.Profile.Models.UserPreference? Preference { get; set; }

    // Navigation property for RefreshTokens
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
