using backend.Features.Flights.Models;
using backend.Features.Flights.Dtos;
using backend.Features.Flights.Repositories;

namespace backend.Features.Flights.Services;

public interface IFlightService
{
    Task<IEnumerable<FlightDto>> GetAllFlightsAsync();
    Task<FlightDto?> GetFlightByIdAsync(int id);
    Task<FlightDto> CreateFlightAsync(CreateFlightDto createFlightDto);
    Task<FlightDto?> UpdateFlightAsync(int id, UpdateFlightDto updateFlightDto);
    Task<bool> DeleteFlightAsync(int id);
    Task<bool> CheckSeatAvailabilityAsync(int flightId, int requiredSeats);
}

public class FlightService : IFlightService
{
    private readonly IFlightRepository _flightRepository;

    public FlightService(IFlightRepository flightRepository)
    {
        _flightRepository = flightRepository;
    }

    public async Task<IEnumerable<FlightDto>> GetAllFlightsAsync()
    {
        var flights = await _flightRepository.GetAllAsync();
        return flights.Select(MapToDto);
    }

    public async Task<FlightDto?> GetFlightByIdAsync(int id)
    {
        var flight = await _flightRepository.GetByIdAsync(id);
        return flight != null ? MapToDto(flight) : null;
    }

    public async Task<FlightDto> CreateFlightAsync(CreateFlightDto createFlightDto)
    {
        ValidateFlightTimes(createFlightDto.DepartureTime, createFlightDto.ArrivalTime);

        var flight = new Flight
        {
            FlightNumber = createFlightDto.FlightNumber,
            Departure = createFlightDto.Departure,
            Destination = createFlightDto.Destination,
            DepartureTime = createFlightDto.DepartureTime,
            ArrivalTime = createFlightDto.ArrivalTime,
            Price = createFlightDto.Price,
            SeatsAvailable = createFlightDto.SeatsAvailable
        };

        var createdFlight = await _flightRepository.CreateAsync(flight);
        return MapToDto(createdFlight);
    }

    public async Task<FlightDto?> UpdateFlightAsync(int id, UpdateFlightDto updateFlightDto)
    {
        ValidateFlightTimes(updateFlightDto.DepartureTime, updateFlightDto.ArrivalTime);

        var flight = new Flight
        {
            FlightNumber = updateFlightDto.FlightNumber,
            Departure = updateFlightDto.Departure,
            Destination = updateFlightDto.Destination,
            DepartureTime = updateFlightDto.DepartureTime,
            ArrivalTime = updateFlightDto.ArrivalTime,
            Price = updateFlightDto.Price,
            SeatsAvailable = updateFlightDto.SeatsAvailable
        };

        var updatedFlight = await _flightRepository.UpdateAsync(id, flight);
        return updatedFlight != null ? MapToDto(updatedFlight) : null;
    }

    public async Task<bool> DeleteFlightAsync(int id)
    {
        return await _flightRepository.DeleteAsync(id);
    }

    public async Task<bool> CheckSeatAvailabilityAsync(int flightId, int requiredSeats)
    {
        var flight = await _flightRepository.GetByIdAsync(flightId);
        return flight != null && flight.SeatsAvailable >= requiredSeats;
    }

    private static FlightDto MapToDto(Flight flight)
    {
        return new FlightDto
        {
            Id = flight.Id,
            FlightNumber = flight.FlightNumber,
            Departure = flight.Departure,
            Destination = flight.Destination,
            DepartureTime = flight.DepartureTime,
            ArrivalTime = flight.ArrivalTime,
            Price = flight.Price,
            SeatsAvailable = flight.SeatsAvailable
        };
    }

    private static void ValidateFlightTimes(DateTime departureTime, DateTime arrivalTime)
    {
        var now = DateTime.Now;
        
        // Check if departure time is in the past
        if (departureTime < now)
        {
            throw new ArgumentException("Departure time cannot be in the past.");
        }

        // Check if arrival time is before departure time
        // This properly handles multi-day flights (e.g., depart 23:00, arrive 06:00 next day)
        if (arrivalTime <= departureTime)
        {
            throw new ArgumentException("Arrival time must be after departure time.");
        }

        // Additional validation: arrival time should not be more than 24 hours after departure
        var maxFlightDuration = TimeSpan.FromHours(24);
        if (arrivalTime - departureTime > maxFlightDuration)
        {
            throw new ArgumentException("Flight duration cannot exceed 24 hours.");
        }
    }
}