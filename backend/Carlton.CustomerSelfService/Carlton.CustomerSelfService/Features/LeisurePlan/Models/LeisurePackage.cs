using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Models;

public class LeisurePackage
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string Destination { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Badge { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string BadgeColor { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string Image { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column(TypeName = "nvarchar(200)")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string Subtitle { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Nights { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string WasPrice { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string Price { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string PerLabel { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string Save { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public LeisurePackageDetail? Detail { get; set; }
}
