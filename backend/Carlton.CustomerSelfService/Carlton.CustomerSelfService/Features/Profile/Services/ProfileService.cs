using Microsoft.EntityFrameworkCore;
using Carlton.CustomerSelfService.Data;
using Carlton.CustomerSelfService.Features.Profile.DTOs;
using Carlton.CustomerSelfService.Features.Profile.Models;
using Carlton.CustomerSelfService.Features.Login.Models;

namespace Carlton.CustomerSelfService.Features.Profile.Services;

public class ProfileService : IProfileService
{
    private readonly ApplicationDbContext _context;

    public ProfileService(ApplicationDbContext context)
    {
        _context = context;
    }

    # region Personal Details
    public async Task<PersonalDetailsDto?> GetPersonalDetailsAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Profile)
            .Include(u => u.Customer)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        // Fetch additional customer data if available
        CustomerLoyaltyAccount? loyalty = null;
        CustomerTravelStat? stats = null;

        if (user.CustomerId.HasValue)
        {
            loyalty = await _context.CustomerLoyaltyAccounts.FindAsync(user.CustomerId.Value);
            stats = await _context.CustomerTravelStats.FindAsync(user.CustomerId.Value);
        }

        var profile = user.Profile;
        
        return new PersonalDetailsDto
        {
            FirstName = profile?.FirstName ?? user.Name.Split(' ')[0],
            LastName = profile?.LastName ?? (user.Name.Contains(' ') ? user.Name.Split(' ').Last() : string.Empty),
            Title = profile?.Title,
            Gender = profile?.Gender,
            Nationality = profile?.Nationality?.Name,
            NationalityId = profile?.NationalityId,
            Email = user.Customer?.Email,
            Phone = profile?.Phone,
            DateOfBirth = profile?.DateOfBirth,
            AddressLine1 = profile?.AddressLine1,
            AddressLine2 = profile?.AddressLine2,
            City = profile?.City,
            Country = profile?.Country?.Name,
            CountryId = profile?.CountryId,
            PostalCode = profile?.PostalCode,
            TripsCompleted = stats?.TripsCompleted ?? 0,
            TotalSpend = stats?.TotalSpend ?? 0,
            LoyaltyPoints = loyalty?.LoyaltyPoints ?? 0,
            TierLevel = loyalty?.TierLevel ?? "Bronze",
            MemberSinceDate = loyalty?.MemberSinceDate ?? user.CreatedAt
        };
    }

    public async Task<bool> UpdatePersonalDetailsAsync(int userId, UpdatePersonalDetailsDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        if (user.Profile == null)
        {
            user.Profile = new UserProfile { UserId = userId };
            _context.UserProfiles.Add(user.Profile);
        }

        user.Profile.FirstName = dto.FirstName;
        user.Profile.LastName = dto.LastName;
        user.Profile.Title = dto.Title;
        user.Profile.Gender = dto.Gender;
        user.Profile.NationalityId = dto.NationalityId;
        user.Profile.Phone = dto.Phone;
        user.Profile.DateOfBirth = dto.DateOfBirth;
        user.Profile.AddressLine1 = dto.AddressLine1;
        user.Profile.AddressLine2 = dto.AddressLine2;
        user.Profile.City = dto.City;
        user.Profile.CountryId = dto.CountryId;
        user.Profile.PostalCode = dto.PostalCode;
        user.Profile.UpdatedAt = DateTime.UtcNow;

        // Sync legacy name for compatibility if needed
        user.Name = $"{dto.FirstName} {dto.LastName}".Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
    # endregion

    # region Saved Travellers
    public async Task<IEnumerable<SavedTravellerDto>> GetSavedTravellersAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.CustomerId.HasValue) return Enumerable.Empty<SavedTravellerDto>();

        return await _context.CustomerTravellers
            .Where(t => t.CustomerId == user.CustomerId.Value)
            .Include(t => t.Nationality)
            .Include(t => t.PassportCountry)
            .Select(t => new SavedTravellerDto
            {
                Id = t.Id,
                FirstName = t.FirstName,
                LastName = t.LastName,
                Title = t.Title,
                DateOfBirth = t.DateOfBirth,
                Gender = t.Gender,
                Nationality = t.Nationality != null ? t.Nationality.Name : null,
                NationalityId = t.NationalityId,
                PassportNumber = t.PassportNumber,
                PassportExpiryDate = t.PassportExpiryDate,
                PassportCountry = t.PassportCountry != null ? t.PassportCountry.Name : null,
                PassportCountryId = t.PassportCountryId
            })
            .ToListAsync();
    }

    public async Task<SavedTravellerDto> AddSavedTravellerAsync(int userId, AddSavedTravellerDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");
        
        if (!user.CustomerId.HasValue)
        {
            // Auto-create customer if missing (should be handled by registration/migration usually)
            user.Customer = new Customer 
            { 
                FirstName = user.Name.Split(' ').FirstOrDefault() ?? "User", 
                LastName = user.Name.Split(' ').LastOrDefault() ?? "User",
                Email = user.Username 
            };
            await _context.SaveChangesAsync();
        }

        var traveller = new CustomerTraveller
        {
            CustomerId = user.CustomerId!.Value,
            Title = dto.Title,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            NationalityId = dto.NationalityId,
            PassportNumber = dto.PassportNumber,
            PassportExpiryDate = dto.PassportExpiryDate,
            PassportCountryId = dto.PassportCountryId
        };

        _context.CustomerTravellers.Add(traveller);
        await _context.SaveChangesAsync();

        return (await GetSavedTravellersAsync(userId)).First(t => t.Id == traveller.Id);
    }

    public async Task<bool> DeleteSavedTravellerAsync(int userId, int travellerId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.CustomerId.HasValue) return false;

        var traveller = await _context.CustomerTravellers
            .FirstOrDefaultAsync(t => t.Id == travellerId && t.CustomerId == user.CustomerId.Value);

        if (traveller == null) return false;

        _context.CustomerTravellers.Remove(traveller);
        await _context.SaveChangesAsync();
        return true;
    }
    # endregion

    # region User Preferences
    public async Task<UserPreferenceDto?> GetUserPreferencesAsync(int userId)
    {
        var preference = await _context.UserPreferences.FindAsync(userId);
        if (preference == null)
        {
            // Lazy create default preferences
            preference = new UserPreference { UserId = userId };
            _context.UserPreferences.Add(preference);
            await _context.SaveChangesAsync();
        }

        return new UserPreferenceDto
        {
            Language = preference.Language,
            CurrencyCode = preference.CurrencyCode,
            Theme = preference.Theme,
            Timezone = preference.Timezone,
            EmailNotifications = preference.EmailNotifications,
            SMSNotifications = preference.SMSNotifications,
            PushNotifications = preference.PushNotifications,
            PreferredRoute = preference.PreferredRoute,
            PreferredClass = preference.PreferredClass
        };
    }

    public async Task<bool> UpdateUserPreferencesAsync(int userId, UpdatePreferencesDto dto)
    {
        var preference = await _context.UserPreferences.FindAsync(userId);
        if (preference == null)
        {
            preference = new UserPreference { UserId = userId };
            _context.UserPreferences.Add(preference);
        }

        if (dto.Language != null) preference.Language = dto.Language;
        if (dto.CurrencyCode != null) preference.CurrencyCode = dto.CurrencyCode;
        if (dto.Theme != null) preference.Theme = dto.Theme;
        if (dto.Timezone != null) preference.Timezone = dto.Timezone;
        if (dto.EmailNotifications.HasValue) preference.EmailNotifications = dto.EmailNotifications.Value;
        if (dto.SMSNotifications.HasValue) preference.SMSNotifications = dto.SMSNotifications.Value;
        if (dto.PushNotifications.HasValue) preference.PushNotifications = dto.PushNotifications.Value;
        if (dto.PreferredRoute != null) preference.PreferredRoute = dto.PreferredRoute;
        if (dto.PreferredClass != null) preference.PreferredClass = dto.PreferredClass;
        
        preference.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
    # endregion

    # region Frequent Flyer Programs
    public async Task<IEnumerable<FrequentFlyerProgramDto>> GetFrequentFlyerProgramsAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.CustomerId.HasValue) return Enumerable.Empty<FrequentFlyerProgramDto>();

        return await _context.FrequentFlyerPrograms
            .Where(p => p.CustomerId == user.CustomerId.Value)
            .Include(p => p.Airline)
            .Select(p => new FrequentFlyerProgramDto
            {
                Id = p.Id,
                AirlineName = p.Airline.Name,
                AirlineId = p.AirlineId,
                ProgramName = p.ProgramName,
                MembershipNumber = p.MembershipNumber,
                StatusLevel = p.StatusLevel
            })
            .ToListAsync();
    }

    public async Task<FrequentFlyerProgramDto> AddFrequentFlyerProgramAsync(int userId, AddFrequentFlyerDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found");
        
        if (!user.CustomerId.HasValue)
        {
            user.Customer = new Customer 
            { 
                FirstName = user.Name.Split(' ').FirstOrDefault() ?? "User", 
                LastName = user.Name.Split(' ').LastOrDefault() ?? "User",
                Email = user.Username 
            };
            await _context.SaveChangesAsync();
        }

        var program = new FrequentFlyerProgram
        {
            CustomerId = user.CustomerId!.Value,
            AirlineId = dto.AirlineId,
            ProgramName = dto.ProgramName,
            MembershipNumber = dto.MembershipNumber,
            StatusLevel = dto.StatusLevel
        };

        _context.FrequentFlyerPrograms.Add(program);
        await _context.SaveChangesAsync();

        var airline = await _context.Airlines.FindAsync(dto.AirlineId);

        return new FrequentFlyerProgramDto
        {
            Id = program.Id,
            AirlineName = airline?.Name ?? "Unknown",
            AirlineId = program.AirlineId,
            ProgramName = program.ProgramName,
            MembershipNumber = program.MembershipNumber,
            StatusLevel = program.StatusLevel
        };
    }

    public async Task<bool> DeleteFrequentFlyerProgramAsync(int userId, int programId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.CustomerId.HasValue) return false;

        var program = await _context.FrequentFlyerPrograms
            .FirstOrDefaultAsync(p => p.Id == programId && p.CustomerId == user.CustomerId.Value);

        if (program == null) return false;

        _context.FrequentFlyerPrograms.Remove(program);
        await _context.SaveChangesAsync();
        return true;
    }
    # endregion
}
