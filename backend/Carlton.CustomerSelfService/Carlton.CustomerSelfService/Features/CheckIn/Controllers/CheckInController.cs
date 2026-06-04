using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Carlton.CustomerSelfService.Features.CheckIn.Dtos;
using Carlton.CustomerSelfService.Features.CheckIn.Services;

namespace Carlton.CustomerSelfService.Features.CheckIn.Controllers;

[ApiController]
[Route("api/checkin")]
public class CheckInController : ControllerBase
{
    private readonly ICheckInService _checkInService;
    private readonly ILogger<CheckInController> _logger;

    public CheckInController(ICheckInService checkInService, ILogger<CheckInController> logger)
    {
        _checkInService = checkInService;
        _logger = logger;
    }

    /// <summary>Look up a booking by PNR/booking reference + passenger last name.</summary>
    [HttpPost("lookup")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> LookupBooking([FromBody] CheckInLookupRequestDto request)
    {
        try
        {
            var booking = await _checkInService.LookupBookingAsync(request.BookingReference, request.LastName);
            if (booking == null)
                return NotFound(new { message = "Booking not found. Please check your booking reference and last name." });

            return Ok(booking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error looking up booking for check-in");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>Get all upcoming flights for the authenticated customer that are eligible for check-in.</summary>
    [HttpGet("upcoming")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> GetUpcomingBookings()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "User not found in token" });

            var bookings = await _checkInService.GetUpcomingBookingsAsync(userId);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting upcoming check-in bookings");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>Submit check-in for a booking, optionally with a selected seat number.</summary>
    [HttpPost("submit")]
    [Authorize(Roles = "Customer,Admin,TicketOfficer")]
    public async Task<IActionResult> SubmitCheckIn([FromBody] CheckInSubmitDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized(new { message = "User not found in token" });

            var booking = await _checkInService.SubmitCheckInAsync(request.BookingId, userId, request.SeatNumber);
            return Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting check-in for booking {BookingId}", request.BookingId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
