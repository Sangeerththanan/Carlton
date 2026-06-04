import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from '../../../components/Calendar';
import { useNavigate } from 'react-router-dom';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import flags from 'react-phone-number-input/flags';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { getExampleNumber, isValidPhoneNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import type { CountryCode } from 'libphonenumber-js';
import type { SignupCredentials } from '../types/signup';
import { useToast } from '../../../contexts/ToastContext';
import { API_ENDPOINTS } from '../../../config/apiConfig';

countries.registerLocale(enLocale);

const maxLengthCache: Record<string, number> = {};
const getMaxNationalLength = (isoCode: string): number => {
  if (maxLengthCache[isoCode]) return maxLengthCache[isoCode];
  try {
    const example = getExampleNumber(isoCode as CountryCode, examples);
    const len = example?.nationalNumber.length ?? 15;
    maxLengthCache[isoCode] = len;
    return len;
  } catch {
    return 15;
  }
};

const calculatePasswordStrength = (password: string): { strength: number; label: string; color: string; textColor: string } => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { strength: 0, label: '', color: 'bg-gray-200', textColor: 'text-gray-500' },
    { strength: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' },
    { strength: 2, label: 'Fair', color: 'bg-yellow-400', textColor: 'text-yellow-400' },
    { strength: 3, label: 'Good', color: 'bg-[#F19A36]', textColor: 'text-[#F19A36]' },
    { strength: 4, label: 'Strong', color: 'bg-blue-500', textColor: 'text-blue-500' },
    { strength: 5, label: 'Very Strong', color: 'bg-[#1C398E]', textColor: 'text-[#1C398E]' },
  ];

  return levels[Math.min(strength, 5)];
};

const COUNTRY_OPTIONS = getCountries().map((country) => ({
  code: country,
  dialCode: `+${getCountryCallingCode(country)}`,
  name: new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ?? country,
})).sort((a, b) => a.name.localeCompare(b.name));

const NATIONALITIES = Object.values(countries.getNames('en', { select: 'official' })).sort((a, b) =>
  a.localeCompare(b)
);

const CountrySelect: React.FC<{
  value: string;        // ISO code e.g. 'LK'
  onChange: (isoCode: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = COUNTRY_OPTIONS.find((c) => c.code === value) ?? COUNTRY_OPTIONS[0];

  const filtered = search.trim()
    ? [
        ...COUNTRY_OPTIONS.filter((c) => c.name.toLowerCase().startsWith(search.toLowerCase())),
        ...COUNTRY_OPTIONS.filter((c) => !c.name.toLowerCase().startsWith(search.toLowerCase()) && c.name.toLowerCase().includes(search.toLowerCase())),
      ]
    : COUNTRY_OPTIONS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
    else setSearch('');
  }, [open]);

  return (
    <div ref={ref} className="relative w-24 flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 w-full px-2 sm:px-3 h-10 sm:h-[45px] border border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white/80"
      >
        {(() => { const Flag = flags[selected.code as keyof typeof flags]; return Flag ? <span className="w-5 h-4 rounded-sm overflow-hidden flex-shrink-0 inline-flex"><Flag title={selected.name} /></span> : null; })()}
        <span className="flex-1 text-left">{selected.dialCode}</span>
        <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-blue-200 rounded-md shadow-lg text-sm">
          <div className="p-2 border-b border-blue-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-1.5 border border-blue-200 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((c) => (
              <li
                key={c.code}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 ${c.dialCode === value ? 'bg-blue-100 font-medium' : ''}`}
                onMouseDown={() => { onChange(c.code); setOpen(false); setSearch(''); }}
              >
                <span className="text-gray-800">{c.name}</span>
                <span className="text-gray-400 ml-auto flex-shrink-0">{c.dialCode}</span>
              </li>
            )) : (
              <li className="px-3 py-2 text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const NationalitySelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? [
        ...NATIONALITIES.filter((n) => n.toLowerCase().startsWith(search.toLowerCase())),
        ...NATIONALITIES.filter((n) => !n.toLowerCase().startsWith(search.toLowerCase()) && n.toLowerCase().includes(search.toLowerCase())),
      ]
    : NATIONALITIES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
    else setSearch('');
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
  type="button"
  onClick={() => setOpen((v) => !v)}
  className="flex items-center gap-2 w-full px-2 sm:px-3 h-10 sm:h-[45px] border border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white/80 overflow-hidden"
>
  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
  </svg>
  <span className={`flex-1 text-left truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
    {value || 'Select...'}
  </span>
  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
</button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-blue-200 rounded-md shadow-lg text-sm">
          <div className="p-1.5 border-b border-blue-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 border border-blue-200 rounded text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <ul className="overflow-y-auto" style={{ maxHeight: '10rem' }}>
            {filtered.length > 0 ? filtered.map((n) => (
              <li
                key={n}
                className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 text-gray-800 ${n === value ? 'bg-blue-100 font-medium' : ''}`}
                onMouseDown={() => { onChange(n); setOpen(false); setSearch(''); }}
              >
                {n}
              </li>
            )) : (
              <li className="px-3 py-1.5 text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const { strength, label, color, textColor } = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-0.5">
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      {label && <p className="text-xs text-gray-600">Password strength: <span className={`font-medium ${textColor}`}>{label}</span></p>}
    </div>
  );
};

export const SignupForm: React.FC = () => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryCode: '+44',
    phoneNumber: '',
    dateOfBirth: '',
    nationality: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  // ISO country code tracked separately for per-country phone validation
  const [phoneCountryIso, setPhoneCountryIso] = useState<string>('GB');

  const [errors, setErrors] = useState<Partial<Record<keyof SignupCredentials, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SignupCredentials, string>> = {};

    if (!credentials.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!credentials.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!credentials.password) {
      newErrors.password = 'Enter a password';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (credentials.phoneNumber) {
      const dialCode = getCountryCallingCode(phoneCountryIso as CountryCode);
      if (!isValidPhoneNumber(`+${dialCode}${credentials.phoneNumber}`)) {
        newErrors.phoneNumber = `Invalid phone number for selected country (expected ${getMaxNationalLength(phoneCountryIso)} digits)`;
      }
    }
    if (!credentials.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: credentials.firstName.trim(),
          lastName: credentials.lastName.trim(),
          email: credentials.email.trim(),
          phoneCountryCode: `+${getCountryCallingCode(phoneCountryIso as CountryCode)}`,
          phoneNumber: credentials.phoneNumber.trim(),
          dateOfBirth: credentials.dateOfBirth || null,
          nationality: credentials.nationality || null,
          password: credentials.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      showToast('Account created successfully! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = <K extends keyof SignupCredentials>(field: K, value: SignupCredentials[K]) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (field: keyof SignupCredentials) =>
    `appearance-none block w-full px-3 sm:px-4 h-10 sm:h-[45px] border ${
      errors[field] ? 'border-red-400' : 'border-blue-200'
    } placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white/80`;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-blue-900 mb-1">Create Account</h2>
        <p className="text-xs text-gray-500">
          Join Carlton Leisure and start planning your dream journey today.
        </p>
      </div>

      <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>
        {/* First Name + Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="First name"
                value={credentials.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`${inputClass('firstName')} pl-7 sm:pl-11`}
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Last name"
                value={credentials.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`${inputClass('lastName')} pl-7 sm:pl-11`}
              />
            </div>
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={credentials.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`${inputClass('email')} pl-7 sm:pl-11`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
            Phone Number
          </label>
          <div className="flex gap-2">
            <CountrySelect
              value={phoneCountryIso}
              onChange={(isoCode) => {
                setPhoneCountryIso(isoCode);
                handleChange('phoneNumber', '');
              }}
            />
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder={`${getMaxNationalLength(phoneCountryIso)} digits`}
                value={credentials.phoneNumber}
                maxLength={getMaxNationalLength(phoneCountryIso)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  handleChange('phoneNumber', digits.slice(0, getMaxNationalLength(phoneCountryIso)));
                }}
                onKeyDown={(e) => {
                  const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
                  if (!/^\d$/.test(e.key) && !allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                className={`appearance-none block w-full pl-7 sm:pl-11 pr-3 sm:pr-4 h-10 sm:h-[45px] border ${errors.phoneNumber ? 'border-red-400' : 'border-blue-200'} placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white/80`}
              />
            </div>
          </div>
          {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
        </div>

        {/* Date of Birth + Nationality */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
              Date of Birth
            </label>
            <div className="relative" ref={calendarRef}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="text"
                readOnly
                value={
                  credentials.dateOfBirth
                    ? (() => { const [y, m, d] = credentials.dateOfBirth.split('-'); return `${d}/${m}/${y}`; })()
                    : ''
                }
                onClick={() => setCalendarOpen((v) => !v)}
                placeholder="DD/MM/YYYY"
                className="appearance-none block w-full pl-7 sm:pl-11 pr-3 sm:pr-3 h-10 sm:h-[45px] border border-blue-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white/80 cursor-pointer"
              />
              {calendarOpen && (
                <div className="absolute z-50 mt-1">
                  <Calendar
                    selectedDate={credentials.dateOfBirth ? (() => { const [y, m, d] = credentials.dateOfBirth.split('-'); return new Date(+y, +m - 1, +d); })() : undefined}
                    onDateSelect={(date) => {
                      const pad = (n: number) => String(n).padStart(2, '0');
                      handleChange('dateOfBirth', `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
                      setCalendarOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
              Nationality
            </label>
            <NationalitySelect
               value={credentials.nationality}
               onChange={(val) => handleChange('nationality', val)}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={credentials.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`${inputClass('password')} pl-7 sm:pl-11 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <PasswordStrengthBar password={credentials.password} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[10px] font-semibold text-[#4A4A7A] uppercase tracking-wide mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={credentials.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`${inputClass('confirmPassword')} pl-7 sm:pl-11 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={credentials.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="mt-0.5 sm:mt-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-600 leading-tight sm:leading-normal">
              I agree to the{' '}
              <a href="#" className="text-blue-700 font-semibold hover:underline">TERMS &amp; CONDITIONS</a>
              {' '}&amp;{' '}
              <a href="#" className="text-blue-700 font-semibold hover:underline">PRIVACY POLICY</a>
            </span>
          </label>
          {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeToTerms}</p>}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 sm:py-3 px-3 sm:px-4 border border-transparent text-xs sm:text-sm rounded-full text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs sm:text-sm">Creating Account...</span>
              </>
            ) : (
              'CREATE MY ACCOUNT'
            )}
          </button>
        </div>

        {/* Login link */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Log in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};
