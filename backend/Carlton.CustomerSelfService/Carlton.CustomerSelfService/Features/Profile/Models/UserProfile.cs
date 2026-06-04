using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Carlton.CustomerSelfService.Features.Login.Models;
using Carlton.CustomerSelfService.Features.Shared.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Models;

public class UserProfile
{
    [Key]
    [ForeignKey("User")]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [MaxLength(20)]
    public string? Title { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Column(TypeName = "date")]
    public DateTime? DateOfBirth { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    public int? NationalityId { get; set; }
    public Country? Nationality { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? AddressLine1 { get; set; }

    [MaxLength(500)]
    public string? AddressLine2 { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    public int? CountryId { get; set; }
    public Country? Country { get; set; }

    [MaxLength(20)]
    public string? PostalCode { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
