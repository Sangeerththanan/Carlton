using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Carlton.CustomerSelfService.Features.Payment.Dtos;
using Stripe;
using Stripe.Checkout;
using System.Security.Claims;

namespace Carlton.CustomerSelfService.Features.Payment.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IConfiguration configuration, ILogger<PaymentController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>Public publishable key so the SPA can call <c>loadStripe</c> without baking keys into the Vite build.</summary>
    [HttpGet("stripe-publishable-key")]
    [AllowAnonymous]
    public ActionResult GetStripePublishableKey()
    {
        var key = _configuration["Stripe:PublishableKey"];
        return Ok(new { publishableKey = string.IsNullOrWhiteSpace(key) ? null : key });
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession([FromBody] CreateCheckoutSessionDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            _logger.LogWarning("CreateCheckoutSession model validation failed: {Errors}", errors);
            return BadRequest(ModelState);
        }
        try
        {
            var secretKey = _configuration["Stripe:SecretKey"]
                ?? throw new InvalidOperationException("Stripe SecretKey not configured.");

            Stripe.StripeClient client = new(secretKey);

            // Stripe amounts are in the smallest currency unit (pence for GBP)
            var amountInPence = (long)(dto.Amount * 100);

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "gbp",
                            UnitAmount = amountInPence,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = dto.PlanTitle,
                                Description = "Carlton Leisure Plan — Full package including flights, hotels & activities.",
                                Images = new List<string>
                                {
                                    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80"
                                }
                            }
                        },
                        Quantity = 1
                    }
                },
                Mode = "payment",
                SuccessUrl = dto.SuccessUrl,
                CancelUrl = dto.CancelUrl,
                Metadata = new Dictionary<string, string>
                {
                    { "leisurePlanId", dto.LeisurePlanId?.ToString() ?? "" },
                    { "userId", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "" }
                }
            };

            var service = new SessionService(client);
            var session = service.Create(options);

            return Ok(new { sessionId = session.Id, url = session.Url });
        }
        catch (Stripe.StripeException ex)
        {
            _logger.LogError(ex, "Stripe error when creating checkout session");
            return StatusCode(400, new { error = ex.StripeError?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when creating checkout session");
            return StatusCode(500, new { error = "Unable to create payment session. Please try again." });
        }
    }

    [HttpPost("create-payment-intent")]
    public ActionResult CreatePaymentIntent([FromBody] CreatePaymentIntentDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            _logger.LogWarning("CreatePaymentIntent model validation failed: {Errors}", errors);
            return BadRequest(ModelState);
        }
        try
        {
            var secretKey = _configuration["Stripe:SecretKey"]
                ?? throw new InvalidOperationException("Stripe SecretKey not configured.");

            StripeClient client = new(secretKey);

            // Stripe amounts are in the smallest currency unit (pence for GBP)
            var amountInPence = (long)(dto.Amount * 100);

            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInPence,
                Currency = "gbp",
                Description = $"Carlton Leisure Plan: {dto.PlanTitle}",
                Metadata = new Dictionary<string, string>
                {
                    { "leisurePlanId", dto.LeisurePlanId?.ToString() ?? "" },
                    { "userId", User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "" }
                }
            };

            var service = new PaymentIntentService(client);
            var intent = service.Create(options);

            return Ok(new { clientSecret = intent.ClientSecret });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error when creating payment intent");
            return StatusCode(400, new { error = ex.StripeError?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when creating payment intent");
            return StatusCode(500, new { error = "Unable to create payment intent. Please try again." });
        }
    }

    /// <summary>
    /// Creates a PaymentIntent for flight checkout. Same Stripe account as leisure plans; metadata tags <c>flight_booking</c>.
    /// Anonymous so guest flight checkout can collect card payment before <c>POST /bookings/guest</c>.
    /// </summary>
    [HttpPost("create-flight-payment-intent")]
    [AllowAnonymous]
    public ActionResult CreateFlightPaymentIntent([FromBody] CreateFlightPaymentIntentDto? dto)
    {
        if (dto == null)
        {
            return BadRequest(new { error = "Request body is required." });
        }

        if (!ModelState.IsValid)
        {
            var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
            _logger.LogWarning("CreateFlightPaymentIntent model validation failed: {Errors}", errors);
            return BadRequest(ModelState);
        }

        if (dto.Amount is < 0.01m or > 500_000m)
        {
            return BadRequest(new { error = "Amount must be between £0.01 and £500,000." });
        }

        try
        {
            var secretKey = _configuration["Stripe:SecretKey"]
                ?? throw new InvalidOperationException("Stripe SecretKey not configured.");

            StripeClient client = new(secretKey);

            var amountInPence = (long)Math.Round(dto.Amount * 100m, MidpointRounding.AwayFromZero);
            if (amountInPence < 1)
            {
                return BadRequest(new { error = "Amount is too small to charge." });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

            var summary = string.IsNullOrWhiteSpace(dto.Summary)
                ? $"Carlton flight booking (flight {dto.FlightId})"
                : dto.Summary.Trim();

            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInPence,
                Currency = "gbp",
                Description = summary,
                Metadata = new Dictionary<string, string>
                {
                    { "kind", "flight_booking" },
                    { "flightId", dto.FlightId.ToString() },
                    { "userId", userId },
                },
            };

            var service = new PaymentIntentService(client);
            var intent = service.Create(options);

            return Ok(new { clientSecret = intent.ClientSecret });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error when creating flight payment intent");
            return StatusCode(400, new { error = ex.StripeError?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when creating flight payment intent");
            return StatusCode(500, new { error = "Unable to create payment intent. Please try again." });
        }
    }
}
