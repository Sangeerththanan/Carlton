using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Shared.Models;

public class Country
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(2)]
    public string IsoCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(10)]
    public string? DialCode { get; set; }

    [MaxLength(500)]
    public string? FlagUrl { get; set; }

    public bool IsActive { get; set; } = true;
}
