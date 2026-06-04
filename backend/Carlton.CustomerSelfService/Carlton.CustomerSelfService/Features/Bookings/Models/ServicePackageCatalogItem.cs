using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.Bookings.Models;

public class ServicePackageCatalogItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal PricePerPassenger { get; set; }

    public bool TopChoice { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string FeaturesJson { get; set; } = "[]";

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
