export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const navigationConfig: Record<string, NavItem[]> = {
  admin: [
    { icon: '📊', label: 'Dashboard', path: '/dashboard/admin' },
    { icon: '👥', label: 'Providers', path: '/providers' },
    { icon: '✈️', label: 'Flights', path: '/flights' },
    { icon: '👥', label: 'Users', path: '/dashboard/users' },
    { icon: '🎫', label: 'Bookings', path: '/dashboard/bookings' },
    { icon: '📈', label: 'Reports', path: '/dashboard/reports' },
    { icon: '⚙️', label: 'Settings', path: '/dashboard/settings' }
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
