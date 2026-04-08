export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const navigationConfig: Record<string, NavItem[]> = {
  admin: [
    { icon: 'Dashboard', label: 'Dashboard', path: '/dashboard/admin' },
    { icon: 'Providers', label: 'Providers', path: '/providers' },
    { icon: 'Flights', label: 'Flights', path: '/flights' },
    { icon: 'Users', label: 'Users', path: '/dashboard/users' },
    { icon: 'Bookings', label: 'Bookings', path: '/dashboard/bookings' },
    { icon: 'Reports', label: 'Reports', path: '/dashboard/reports' },
    { icon: 'Settings', label: 'Settings', path: '/dashboard/settings' }
  ],
  customer: [
    { icon: 'Dashboard', label: 'Dashboard', path: '/dashboard/customer' },
    { icon: 'Book', label: 'Book Flight', path: '/customer/book' },
    { icon: 'Tickets', label: 'My Bookings', path: '/customer/bookings' },
    { icon: 'User', label: 'Profile', path: '/customer/profile' },
    { icon: 'CreditCard', label: 'Payment', path: '/customer/payment' }
  ],
  ticket: [
    { icon: '📊', label: 'Dashboard', path: '/dashboard/ticket' },
    { icon: '🎫', label: 'New Booking', path: '/dashboard/ticket/new-booking' },
    { icon: '🔍', label: 'Search Booking', path: '/dashboard/ticket/search' },
    { icon: '✈️', label: 'Today\'s Flights', path: '/dashboard/ticket/flights' },
    { icon: '📋', label: 'Recent Bookings', path: '/dashboard/ticket/recent' }
  ],
  finance: [
    { icon: '📊', label: 'Dashboard', path: '/dashboard/finance' },
    { icon: '💰', label: 'Revenue', path: '/dashboard/finance/revenue' },
    { icon: '📉', label: 'Expenses', path: '/dashboard/finance/expenses' },
    { icon: '📈', label: 'Reports', path: '/dashboard/finance/reports' },
    { icon: '📄', label: 'Invoices', path: '/dashboard/finance/invoices' }
  ],
  operations: [
    { icon: '📊', label: 'Dashboard', path: '/dashboard/operations' },
    { icon: '✈️', label: 'Flight Status', path: '/dashboard/operations/status' },
    { icon: '🚪', label: 'Gate Management', path: '/dashboard/operations/gates' },
    { icon: '🏢', label: 'Airport Status', path: '/dashboard/operations/airport' },
    { icon: '🚨', label: 'Alerts', path: '/dashboard/operations/alerts' }
  ]
};
