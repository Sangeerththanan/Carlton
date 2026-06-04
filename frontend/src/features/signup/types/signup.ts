export type SignupCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export interface SignupResult {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}