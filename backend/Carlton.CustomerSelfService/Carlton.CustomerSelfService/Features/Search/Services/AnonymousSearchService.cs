using Carlton.CustomerSelfService.Data;
using Carlton.CustomerSelfService.Features.Search.Dtos;
using Carlton.CustomerSelfService.Features.Search.Models;

namespace Carlton.CustomerSelfService.Features.Search.Services;

public interface IAnonymousSearchService
{
    Task LogFlightSearchAsync(FlightSearchRequestDto request);
    Task LogHotelSearchAsync(HotelSearchRequestDto request);
    Task LogFlightHotelSearchAsync(FlightHotelSearchRequestDto request);
    Task LogCarSearchAsync(CarSearchRequestDto request);
}

public class AnonymousSearchService : IAnonymousSearchService
{
    private readonly ApplicationDbContext _context;

    public AnonymousSearchService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogFlightSearchAsync(FlightSearchRequestDto request)
    {
        var search = new FlightSearch
        {
            DeviceId = request.DeviceId,
            SearchId = Guid.NewGuid(),
            FromLocation = request.From,
            ToLocation = request.To,
            TripType = string.IsNullOrWhiteSpace(request.TripType) ? "one-way" : request.TripType,
            DepartureDate = request.DepartureDate,
            ReturnDate = request.ReturnDate,
            Adults = Math.Max(1, request.Adults),
            Children = Math.Max(0, request.Children),
            Infants = Math.Max(0, request.Infants),
            CabinClass = request.CabinClass,
            Airlines = request.Airlines,
            DirectOnly = request.DirectOnly
        };

        if (request.Legs.Count > 0)
        {
            search.Legs = request.Legs.Select((leg, index) => new FlightSearchLeg
            {
                DeviceId = request.DeviceId,
                SearchId = search.SearchId,
                Sequence = index + 1,
                FromLocation = leg.From,
                ToLocation = leg.To,
                DepartureDate = leg.DepartureDate
            }).ToList();
        }

        _context.FlightSearches.Add(search);
        await _context.SaveChangesAsync();
    }

    public async Task LogHotelSearchAsync(HotelSearchRequestDto request)
    {
        var search = new HotelSearch
        {
            DeviceId = request.DeviceId,
            SearchId = Guid.NewGuid(),
            Destination = request.Destination,
            CheckInDate = request.CheckInDate,
            CheckOutDate = request.CheckOutDate,
            Adults = Math.Max(1, request.Adults),
            Children = Math.Max(0, request.Children),
            Infants = Math.Max(0, request.Infants),
            RoomsStandard = Math.Max(0, request.RoomsStandard),
            RoomsDeluxe = Math.Max(0, request.RoomsDeluxe),
            RoomsSuite = Math.Max(0, request.RoomsSuite),
            RoomsFamily = Math.Max(0, request.RoomsFamily),
            MealPreferences = request.MealPreferences.Count > 0
                ? string.Join(",", request.MealPreferences)
                : null
        };

        _context.HotelSearches.Add(search);
        await _context.SaveChangesAsync();
    }

    public async Task LogFlightHotelSearchAsync(FlightHotelSearchRequestDto request)
    {
        var search = new FlightHotelSearch
        {
            DeviceId = request.DeviceId,
            SearchId = Guid.NewGuid(),
            FromLocation = request.From,
            ToLocation = request.To,
            TripType = string.IsNullOrWhiteSpace(request.TripType) ? "round-trip" : request.TripType,
            DepartureDate = request.DepartureDate,
            ReturnDate = request.ReturnDate,
            Adults = Math.Max(1, request.Adults),
            Children = Math.Max(0, request.Children),
            Infants = Math.Max(0, request.Infants),
            Airlines = request.Airlines,
            MealPreferences = request.MealPreferences.Count > 0
                ? string.Join(",", request.MealPreferences)
                : null,
            DirectOnly = request.DirectOnly
        };

        if (request.Legs.Count > 0)
        {
            search.Legs = request.Legs.Select((leg, index) => new FlightHotelSearchLeg
            {
                DeviceId = request.DeviceId,
                SearchId = search.SearchId,
                Sequence = index + 1,
                FromLocation = leg.From,
                ToLocation = leg.To,
                DepartureDate = leg.DepartureDate
            }).ToList();
        }

        _context.FlightHotelSearches.Add(search);
        await _context.SaveChangesAsync();
    }

    public async Task LogCarSearchAsync(CarSearchRequestDto request)
    {
        var search = new CarSearch
        {
            DeviceId = request.DeviceId,
            SearchId = Guid.NewGuid(),
            PickupLocation = request.PickupLocation,
            ReturnLocation = request.ReturnLocation,
            PickupDate = request.PickupDate,
            ReturnDate = request.ReturnDate,
            PickupTime = ParseTime(request.PickupTime),
            ReturnTime = ParseTime(request.ReturnTime),
            DifferentReturn = request.DifferentReturn,
            DriverAge30To65 = request.DriverAge30To65
        };

        _context.CarSearches.Add(search);
        await _context.SaveChangesAsync();
    }

    private static TimeSpan? ParseTime(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return TimeSpan.TryParse(value, out var parsed) ? parsed : null;
    }
}
