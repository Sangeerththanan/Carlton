using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Shared.Models;

public class Airline
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(3)]
    public string IataCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    public int? CountryId { get; set; }
    public Country? Country { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
