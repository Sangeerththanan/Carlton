using Carlton.CustomerSelfService.Features.Profile.DTOs;

namespace Carlton.CustomerSelfService.Features.Profile.Services;

public interface IProfileService
{
    // Personal Details
    Task<PersonalDetailsDto?> GetPersonalDetailsAsync(int userId);
    Task<bool> UpdatePersonalDetailsAsync(int userId, UpdatePersonalDetailsDto dto);

    // Saved Travellers
    Task<IEnumerable<SavedTravellerDto>> GetSavedTravellersAsync(int userId);
    Task<SavedTravellerDto> AddSavedTravellerAsync(int userId, AddSavedTravellerDto dto);
    Task<bool> DeleteSavedTravellerAsync(int userId, int travellerId);

    // User Preferences
    Task<UserPreferenceDto?> GetUserPreferencesAsync(int userId);
    Task<bool> UpdateUserPreferencesAsync(int userId, UpdatePreferencesDto dto);

    // Frequent Flyer Programs
    Task<IEnumerable<FrequentFlyerProgramDto>> GetFrequentFlyerProgramsAsync(int userId);
    Task<FrequentFlyerProgramDto> AddFrequentFlyerProgramAsync(int userId, AddFrequentFlyerDto dto);
    Task<bool> DeleteFrequentFlyerProgramAsync(int userId, int programId);
}
