export interface PersonalDetails {
  firstName: string;
  lastName?: string;
  title?: string;
  gender?: string;
  nationality?: string;
  nationalityId?: number;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  countryId?: number;
  postalCode?: string;
  tripsCompleted: number;
  totalSpend: number;
  loyaltyPoints: number;
  tierLevel: string;
  memberSinceDate: string;
}

export interface UpdatePersonalDetails {
  firstName: string;
  lastName: string;
  title?: string;
  gender?: string;
  nationalityId?: number;
  phone?: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  countryId?: number;
  postalCode?: string;
}

export interface SavedTraveller {
  id: number;
  firstName: string;
  lastName: string;
  title?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  nationalityId?: number;
  passportNumber?: string;
  passportExpiryDate?: string;
  passportCountry?: string;
  passportCountryId?: number;
}

export interface AddSavedTraveller {
  title?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  nationalityId?: number;
  passportNumber?: string;
  passportExpiryDate?: string;
  passportCountryId?: number;
}

export interface UserPreference {
  language: string;
  currencyCode: string;
  theme: string;
  timezone?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  preferredRoute?: string;
  preferredClass?: string;
}

export interface UpdatePreferences {
  language?: string;
  currencyCode?: string;
  theme?: string;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  preferredRoute?: string;
  preferredClass?: string;
}

export interface FrequentFlyerProgram {
  id: number;
  airlineName: string;
  airlineId: number;
  programName: string;
  membershipNumber: string;
  statusLevel?: string;
}

export interface AddFrequentFlyer {
  airlineId?: number;
  programName: string;
  membershipNumber: string;
  statusLevel?: string;
}
