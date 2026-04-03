using Microsoft.EntityFrameworkCore;
using backend.Features.Flights.Data;
using backend.Features.Flights.Models;

namespace backend.Features.Flights.Repositories;

public interface IFlightRepository
{
    Task<IEnumerable<Flight>> GetAllAsync();
    Task<Flight?> GetByIdAsync(int id);
    Task<Flight> CreateAsync(Flight flight);
    Task<Flight?> UpdateAsync(int id, Flight flight);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public class FlightRepository : IFlightRepository
{
    private readonly FlightBookingDbContext _context;

    public FlightRepository(FlightBookingDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Flight>> GetAllAsync()
    {
        return await _context.Flights.ToListAsync();
    }

    public async Task<Flight?> GetByIdAsync(int id)
    {
        return await _context.Flights.FindAsync(id);
    }

    public async Task<Flight> CreateAsync(Flight flight)
    {
        _context.Flights.Add(flight);
        await _context.SaveChangesAsync();
        return flight;
    }

    public async Task<Flight?> UpdateAsync(int id, Flight flight)
    {
        var existingFlight = await _context.Flights.FindAsync(id);
        if (existingFlight == null)
            return null;

        existingFlight.FlightNumber = flight.FlightNumber;
        existingFlight.Departure = flight.Departure;
        existingFlight.Destination = flight.Destination;
        existingFlight.DepartureTime = flight.DepartureTime;
        existingFlight.ArrivalTime = flight.ArrivalTime;
        existingFlight.Price = flight.Price;
        existingFlight.SeatsAvailable = flight.SeatsAvailable;

        await _context.SaveChangesAsync();
        return existingFlight;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var flight = await _context.Flights.FindAsync(id);
        if (flight == null)
            return false;

        _context.Flights.Remove(flight);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Flights.AnyAsync(f => f.Id == id);
    }
}