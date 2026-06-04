using System.ComponentModel.DataAnnotations;

namespace Carlton.CustomerSelfService.Features.Profile.DTOs;

# region Personal Details
public class PersonalDetailsDto
{
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Title { get; set; }
    public string? Gender { get; set; }
    public string? Nationality { get; set; }
    public int? NationalityId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public int? CountryId { get; set; }
    public string? PostalCode { get; set; }
    public int TripsCompleted { get; set; }
    public decimal TotalSpend { get; set; }
    public int LoyaltyPoints { get; set; }
    public string TierLevel { get; set; } = "Bronze";
    public DateTime MemberSinceDate { get; set; }
}

public class UpdatePersonalDetailsDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Title { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    public int? NationalityId { get; set; }

    [Phone]
    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(500)]
    public string? AddressLine1 { get; set; }

    [MaxLength(500)]
    public string? AddressLine2 { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    public int? CountryId { get; set; }

    [MaxLength(20)]
    public string? PostalCode { get; set; }
}
# endregion

# region Saved Travellers
public class SavedTravellerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Nationality { get; set; }
    public int? NationalityId { get; set; }
    public string? PassportNumber { get; set; }
    public DateTime? PassportExpiryDate { get; set; }
    public string? PassportCountry { get; set; }
    public int? PassportCountryId { get; set; }
}

public class AddSavedTravellerDto
{
    [MaxLength(20)]
    public string? Title { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    public int? NationalityId { get; set; }

    [MaxLength(50)]
    public string? PassportNumber { get; set; }

    public DateTime? PassportExpiryDate { get; set; }

    public int? PassportCountryId { get; set; }
}
# endregion

# region User Preferences
public class UserPreferenceDto
{
    public string Language { get; set; } = "en";
    public string CurrencyCode { get; set; } = "USD";
    public string Theme { get; set; } = "Light";
    public string? Timezone { get; set; }
    public bool EmailNotifications { get; set; }
    public bool SMSNotifications { get; set; }
    public bool PushNotifications { get; set; }
    public string? PreferredRoute { get; set; }
    public string? PreferredClass { get; set; }
}

public class UpdatePreferencesDto
{
    [MaxLength(10)]
    public string? Language { get; set; }

    [MaxLength(3)]
    public string? CurrencyCode { get; set; }

    [MaxLength(20)]
    public string? Theme { get; set; }

    [MaxLength(50)]
    public string? Timezone { get; set; }

    public bool? EmailNotifications { get; set; }
    public bool? SMSNotifications { get; set; }
    public bool? PushNotifications { get; set; }
    
    [MaxLength(100)]
    public string? PreferredRoute { get; set; }

    [MaxLength(50)]
    public string? PreferredClass { get; set; }
}
# endregion

# region Frequent Flyer Programs
public class FrequentFlyerProgramDto
{
    public int Id { get; set; }
    public string AirlineName { get; set; } = string.Empty;
    public int AirlineId { get; set; }
    public string ProgramName { get; set; } = string.Empty;
    public string MembershipNumber { get; set; } = string.Empty;
    public string? StatusLevel { get; set; }
}

public class AddFrequentFlyerDto
{
    [Required]
    public int AirlineId { get; set; }

    [Required]
    [MaxLength(100)]
    public string ProgramName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string MembershipNumber { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? StatusLevel { get; set; }
}
# endregion
