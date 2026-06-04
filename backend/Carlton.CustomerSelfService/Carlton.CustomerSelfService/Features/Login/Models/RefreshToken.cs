using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.Login.Models;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRevoked { get; set; } = false;

    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string? DeviceInfo { get; set; }

    public User User { get; set; } = null!;
}
