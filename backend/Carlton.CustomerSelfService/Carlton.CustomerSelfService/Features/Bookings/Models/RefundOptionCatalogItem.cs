using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.Bookings.Models;

public class RefundOptionCatalogItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [Column(TypeName = "nvarchar(200)")]
    public string Title { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal PricePerPassenger { get; set; }

    public bool Recommended { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string BulletsJson { get; set; } = "[]";

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
