using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Carlton.CustomerSelfService.Features.Shared.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Models;

public class CustomerTraveller
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }
    [ForeignKey("CustomerId")]
    public Customer Customer { get; set; } = null!;

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

    [MaxLength(50)]
    public string? PassportNumber { get; set; }

    [Column(TypeName = "date")]
    public DateTime? PassportExpiryDate { get; set; }

    public int? PassportCountryId { get; set; }
    public Country? PassportCountry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
