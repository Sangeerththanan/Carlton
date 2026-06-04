using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Models;

public class LeisurePackageDetail
{
    [Key]
    public int Id { get; set; }

    public int LeisurePackageId { get; set; }
    
    [ForeignKey("LeisurePackageId")]
    public LeisurePackage LeisurePackage { get; set; } = null!;

    [Column(TypeName = "nvarchar(max)")]
    public string Experience { get; set; } = string.Empty;

    [Column(TypeName = "nvarchar(max)")]
    public string DetailsJson { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string TagsJson { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string WhatsIncludedJson { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string ItineraryJson { get; set; } = "[]";
    
    [Column(TypeName = "nvarchar(max)")]
    public string TiersJson { get; set; } = "[]";

    [Column(TypeName = "decimal(18,2)")]
    public decimal AccommodationCost { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TransfersCost { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ServiceFee { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EstimatedCost { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string GalleryImagesJson { get; set; } = "[]";

    [Column(TypeName = "nvarchar(max)")]
    public string ReviewsJson { get; set; } = "[]";
}
