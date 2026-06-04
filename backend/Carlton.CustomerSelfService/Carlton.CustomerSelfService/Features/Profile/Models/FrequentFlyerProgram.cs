using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Carlton.CustomerSelfService.Features.Shared.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Models;

public class FrequentFlyerProgram
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

    public int AirlineId { get; set; }
    [ForeignKey("AirlineId")]
    public Airline Airline { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column(TypeName = "nvarchar(100)")]
    public string ProgramName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string MembershipNumber { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column(TypeName = "nvarchar(50)")]
    public string? StatusLevel { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
