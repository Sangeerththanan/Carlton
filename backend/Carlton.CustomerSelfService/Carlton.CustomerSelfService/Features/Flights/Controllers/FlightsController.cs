using Microsoft.AspNetCore.Mvc;
using Carlton.CustomerSelfService.Features.Flights.Dtos;
using Carlton.CustomerSelfService.Features.Flights.Services;
using Microsoft.Extensions.Logging;

namespace Carlton.CustomerSelfService.Features.Flights.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FlightsController : ControllerBase
{
    private readonly IFlightService _flightService;
    private readonly ILogger<FlightsController> _logger;

    public FlightsController(IFlightService flightService, ILogger<FlightsController> logger)
    {
        _flightService = flightService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all available flights
    /// </summary>
    /// <returns>List of flights</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<FlightDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<FlightDto>>> GetAllFlights()
    {
        try
        {
            var flights = await _flightService.GetAllFlightsAsync();
            return Ok(flights);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all flights");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving flights");
        }
    }

    /// <summary>
    /// Gets a specific flight by ID
    /// </summary>
    /// <param name="id">Flight ID</param>
    /// <returns>Flight details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FlightDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FlightDto>> GetFlightById(int id)
    {
        try
        {
            var flight = await _flightService.GetFlightByIdAsync(id);
            if (flight == null)
            {
                return NotFound($"Flight with ID {id} not found");
            }
            return Ok(flight);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving flight with ID {FlightId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the flight");
        }
    }

    /// <summary>
    /// Creates a new flight
    /// </summary>
    /// <param name="createFlightDto">Flight creation data</param>
    /// <returns>Created flight</returns>
    [HttpPost]
    [ProducesResponseType(typeof(FlightDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FlightDto>> CreateFlight([FromBody] CreateFlightDto createFlightDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var flight = await _flightService.CreateFlightAsync(createFlightDto);
            return CreatedAtAction(nameof(GetFlightById), new { id = flight.Id }, flight);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid flight data provided");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating flight");
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the flight");
        }
    }

    /// <summary>
    /// Updates an existing flight
    /// </summary>
    /// <param name="id">Flight ID</param>
    /// <param name="updateFlightDto">Flight update data</param>
    /// <returns>Updated flight</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(FlightDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FlightDto>> UpdateFlight(int id, [FromBody] UpdateFlightDto updateFlightDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var flight = await _flightService.UpdateFlightAsync(id, updateFlightDto);
            if (flight == null)
            {
                return NotFound($"Flight with ID {id} not found");
            }
            return Ok(flight);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid flight data provided for update");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating flight with ID {FlightId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the flight");
        }
    }

    /// <summary>
    /// Deletes a flight
    /// </summary>
    /// <param name="id">Flight ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFlight(int id)
    {
        try
        {
            var result = await _flightService.DeleteFlightAsync(id);
            if (!result)
            {
                return NotFound($"Flight with ID {id} not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting flight with ID {FlightId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the flight");
        }
    }

    /// <summary>
    /// Checks seat availability for a specific flight
    /// </summary>
    /// <param name="id">Flight ID</param>
    /// <param name="requiredSeats">Number of seats required</param>
    /// <returns>Availability status</returns>
    [HttpGet("{id}/availability")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> CheckSeatAvailability(int id, [FromQuery] int requiredSeats = 1)
    {
        try
        {
            if (requiredSeats <= 0)
            {
                return BadRequest("Number of required seats must be greater than zero.");
            }

            var isAvailable = await _flightService.CheckSeatAvailabilityAsync(id, requiredSeats);
            return Ok(isAvailable);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking seat availability for flight ID {FlightId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while checking seat availability");
        }
    }
}