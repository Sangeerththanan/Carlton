using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Payment.Dtos;

public class CreateFlightPaymentIntentDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int FlightId { get; set; }

    /// <summary>Total due in GBP (e.g. 249.99); converted to pence for Stripe.</summary>
    [Required]
    [Range(0.01, 500_000)]
    public decimal Amount { get; set; }

    [MaxLength(500)]
    public string? Summary { get; set; }
}
