using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Features.Bookings.Dtos;
using backend.Features.Bookings.Services;
using backend.Features.Login.Enums;

namespace backend.Features.Bookings.Controllers;

[ApiController]
[Route("api/[controller]")]
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
}
