using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Carlton.CustomerSelfService.Features.Bookings.Dtos;
using Carlton.CustomerSelfService.Features.Bookings.Services;
using Carlton.CustomerSelfService.Features.Login.Enums;

namespace Carlton.CustomerSelfService.Features.Bookings.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingController> _logger;

    public BookingController(IBookingService bookingService, ILogger<BookingController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> GetCustomerBookings()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user ID in token" });
            }

            var bookings = await _bookingService.GetCustomerBookingsAsync(userId);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer bookings");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> GetBookingById(int id)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user ID in token" });
            }

            var booking = await _bookingService.GetBookingByIdAsync(id, userId);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting booking {BookingId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("guest")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateGuestBooking([FromBody] CreateBookingDto createBookingDto)
    {
        try
        {
            var guestUserId = await _bookingService.GetGuestCheckoutUserIdAsync(HttpContext.RequestAborted);
            var booking = await _bookingService.CreateBookingAsync(createBookingDto, guestUserId);
            return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating guest booking");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto createBookingDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user ID in token" });
            }

            var booking = await _bookingService.CreateBookingAsync(createBookingDto, userId);
            return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> CancelBooking(int id, [FromBody] CancelBookingDto cancelBookingDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not found in token" });
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid user ID in token" });
            }

            var booking = await _bookingService.CancelBookingAsync(id, userId, cancelBookingDto.Reason);
            return Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling booking {BookingId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("{id}/upgrade")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> UpgradeSeat(int id, [FromBody] UpgradeSeatDto upgradeSeatDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "Invalid user" });

            var booking = await _bookingService.UpgradeSeatAsync(id, userId, upgradeSeatDto.NewClass);
            return Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upgrading seat for booking {BookingId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("{id}/add-services")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> AddServices(int id, [FromBody] AddServicesDto addServicesDto)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "Invalid user" });

            var booking = await _bookingService.AddServicesAsync(id, userId, addServicesDto.Services);
            return Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding services for booking {BookingId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("available-flights")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> GetAvailableFlights([FromQuery] FlightSearchDto searchDto)
    {
        try
        {
            var flights = await _bookingService.GetAvailableFlightsAsync(searchDto);
            return Ok(flights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting available flights");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    // Catalog is identical for guests and authenticated users; allow anonymous so a single
    // source of truth (DB catalog) is used everywhere instead of a frontend duplicate.
    [HttpGet("service-packages")]
    [AllowAnonymous]
    public async Task<IActionResult> GetServicePackages()
    {
        try
        {
            var packages = await _bookingService.GetServicePackagesAsync();
            return Ok(packages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting service packages");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("refund-options")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRefundOptions()
    {
        try
        {
            var options = await _bookingService.GetRefundOptionsAsync();
            return Ok(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting refund options");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    // Quote is read-only and tied to a public flight; guests need it for the booking summary.
    [HttpPost("quote")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBookingQuote([FromBody] BookingQuoteRequestDto quoteRequest)
    {
        try
        {
            var quote = await _bookingService.GetBookingQuoteAsync(quoteRequest);
            return Ok(quote);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting booking quote");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
