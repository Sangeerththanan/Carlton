using backend.Features.Login.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Features.Login.Models;

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
    
    // Customer-specific fields (nullable for non-customers)
    [MaxLength(255)]
    [Column(TypeName = "nvarchar(255)")]
    public string? Email { get; set; }
    
    [MaxLength(20)]
    [Column(TypeName = "nvarchar(20)")]
    public string? Phone { get; set; }
    
    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string? Address { get; set; }
    
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string? City { get; set; }
    
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string? Country { get; set; }
    
    public int LoyaltyPoints { get; set; } = 0;
    
    public DateTime? DateOfBirth { get; set; }
    
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string? PreferredClass { get; set; }
    
    [MaxLength(500)]
    [Column(TypeName = "nvarchar(500)")]
    public string? SpecialRequests { get; set; }
}
