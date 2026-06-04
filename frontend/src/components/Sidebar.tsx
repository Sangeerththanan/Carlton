import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, Search, CheckCircle2,
  UserCircle2, Bookmark, MonitorPlay,
  LogOut, Menu, AlertCircle, Settings, X,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  userRole?: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'User Dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'financeofficer', 'operationsmanager', 'customer'] },
  { path: '/flights', label: 'Flight Management', icon: <Search size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'operationsmanager'] },
  { path: '/flight-search-customer', label: 'Flight Search', icon: <Search size={20} strokeWidth={1.6} />, roles: ['customer'] },
  { path: '/bookings', label: 'My Bookings', icon: <BookOpen size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'financeofficer', 'operationsmanager', 'customer'] },
  { path: '/checkin', label: 'Check-in', icon: <CheckCircle2 size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'operationsmanager', 'customer'] },
  // { path: '/notification',           label: 'Notification',      icon: <Bell            size={20} strokeWidth={1.6} />, roles: ['admin','ticketofficer','financeofficer','operationsmanager','customer'] },
  { path: '/profile', label: 'Profile', icon: <UserCircle2 size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'financeofficer', 'operationsmanager', 'customer'] },
  // { path: '/wallet',                 label: 'Wallet',            icon: <Wallet          size={20} strokeWidth={1.6} />, roles: ['admin','ticketofficer','financeofficer','operationsmanager','customer'] },
  { path: '/travel-plan', label: 'Travel Plan', icon: <Bookmark size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'financeofficer', 'operationsmanager', 'customer'] },
  { path: '/leisure-plan', label: 'Leisure Plan', icon: <MonitorPlay size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'financeofficer', 'operationsmanager', 'customer'] },
  // { path: '/help',                   label: 'Help & Support',    icon: <HelpCircle      size={20} strokeWidth={1.6} />, roles: ['admin','ticketofficer','financeofficer','operationsmanager','customer'] },
  { path: '/settings', label: 'Settings', icon: <Settings size={20} strokeWidth={1.6} />, roles: ['admin', 'ticketofficer', 'financeofficer', 'operationsmanager', 'customer'] },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onToggle,
  userRole = 'user',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path === '/dashboard' ? `/dashboard/${userRole}` : path);
    // Close sidebar on mobile after navigation
    if (onToggle && window.innerWidth <= 767) {
      onToggle();
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    navigate('/', { replace: true });
    await logout();
  };

  return (
    <>
      <style>{`
        .sidebar-root {
          font-family: 'Poppins', sans-serif;
          overflow: hidden;
          transition: width 0.3s ease, transform 0.3s ease;
          /* Desktop: solid white */
          background: #ffffff;
        }

        .sidebar-toggle-btn { display: flex; }
        .sidebar-mobile-close { display: none; }

        .sidebar-nav-label   { font-size: 13.5px; white-space: nowrap; }
        .sidebar-user-name   { font-size: 13px; }
        .sidebar-user-email  { font-size: 11px; }
        .sidebar-logout-text { font-size: 13px; }

        /* Mobile icon sizing */
        @media (max-width: 767px) {
          .sidebar-nav-btn svg {
            width: 18px !important;
            height: 18px !important;
            stroke-width: 1.8 !important;
          }

          nav {
            padding: 0 4px 8px !important;
          }

          nav ul {
            gap: 1px !important;
          }

          .sidebar-mobile-logout button svg {
            width: 16px !important;
            height: 16px !important;
          }

          .sidebar-mobile-logout {
            padding: 0 4px 12px !important;
          }

          /* User section on mobile */
          .sidebar-user-info {
            padding: 12px 16px !important;
          }

          .sidebar-user-info-avatar {
            width: 32px !important;
            height: 32px !important;
            font-size: 11px !important;
          }
        }

        /* Hide Settings on desktop, show on mobile */
        li[data-nav-item="/settings"] {
          display: none;
        }

        @media (max-width: 767px) {
          li[data-nav-item="/settings"] {
            display: block;
          }

          .sidebar-root {
            position: fixed !important;
            top: 64px;
            left: 0;
            bottom: 0;
            z-index: 50;
            width: 100% !important;
            transform: translateX(-100%);
            box-shadow: 4px 0 32px rgba(0, 0, 0, 0.18);

            /* ✨ Frosted glass effect on mobile */
            background: rgba(255, 255, 255, 0.55) !important;
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
            border-right: 1px solid rgba(255, 255, 255, 0.45);

            /* Simple smooth transition */
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar-root.sidebar-open {
            transform: translateX(0);
          }

          /* Hide desktop hamburger on mobile */
          .sidebar-toggle-btn { display: none !important; }

          /* Show mobile close button */
          .sidebar-mobile-close {
            display: flex !important;
            padding: 8px 16px;
            justify-content: flex-end;
            border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          }

          /* Compact nav buttons */
          .sidebar-nav-btn {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            font-size: 13px !important;
            gap: 8px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .sidebar-nav-label   { font-size: 13px; }
          .sidebar-user-name   { font-size: 13px; }
          .sidebar-user-email  { font-size: 11px; }
          .sidebar-logout-text { font-size: 13px; }
        }

        /* ─────────── TABLET ─────────── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .sidebar-nav-label   { font-size: 13px; }
          .sidebar-user-name   { font-size: 12.5px; }
          .sidebar-user-email  { font-size: 11px; }
        }
      `}</style>

      {/* Mobile backdrop */}
      {isOpen && (
        <>
          <style>{`
            .sidebar-backdrop {
              display: none;
            }
            @media (max-width: 767px) {
              .sidebar-backdrop {
                display: block !important;
                position: fixed;
                inset: 0;
                top: 64px;
                background: rgba(15, 30, 60, 0.28);
                backdrop-filter: blur(2px);
                -webkit-backdrop-filter: blur(2px);
                z-index: 49;
                transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
              }
            }
          `}</style>
          <div className="sidebar-backdrop" onClick={onToggle} />
        </>
      )}

      <div
        className={`sidebar-root flex flex-col h-full ${isOpen ? 'sidebar-open' : ''}`}
        style={{ width: isOpen ? '256px' : '64px' }}
      >
        {/* Desktop hamburger toggle */}
        <div
          className="sidebar-toggle-btn"
          style={{
            paddingTop: '20px',
            paddingBottom: '12px',
            paddingLeft: isOpen ? '16px' : '0',
            justifyContent: isOpen ? 'flex-start' : 'center',
          }}
        >
          <button
            onClick={onToggle}
            style={{
              padding: '4px', borderRadius: '6px', background: 'none',
              border: 'none', color: '#4b5563', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Mobile close button */}
        <div className="sidebar-mobile-close">
          <button
            onClick={onToggle}
            style={{
              width: '28px',
              height: '28px',
              padding: '0',
              borderRadius: '6px',
              border: 'none',
              background: '#f0f4f8',
              color: '#1E3A8A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dce6f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0f4f8')}
            aria-label="Close sidebar"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── Nav items ── */}
        <nav style={{ flex: 1, padding: '0 8px 12px', overflowY: 'auto', overflowX: 'hidden' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems
              .filter(item => !item.roles || item.roles.includes(userRole))
              .map(item => {
                const isActive = item.path === '/dashboard'
                  ? location.pathname.startsWith('/dashboard/')
                  : location.pathname === item.path;

                return (
                  <li key={item.path} data-nav-item={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      title={!isOpen ? item.label : undefined}
                      className="sidebar-nav-btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isOpen ? '12px' : '0',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        padding: isOpen ? '11px 16px' : '11px 0',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        color: isActive ? '#111827' : '#1C398E',
                        background: isActive
                          ? 'linear-gradient(135deg, #F9D262 0%, #F5B800 100%)'
                          : 'transparent',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ color: isActive ? '#111827' : '#1C398E', flexShrink: 0, display: 'flex' }}>
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="sidebar-nav-label">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* ── User + Logout ── */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', marginTop: 'auto' }}>
          {isOpen ? (
            <>
              <div className="sidebar-user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
                <div className="sidebar-user-info-avatar" style={{
                  flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 600, background: '#1E3A8A', fontSize: '13px',
                }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="sidebar-user-name" style={{ margin: 0, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="sidebar-user-email" style={{ margin: 0, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username || ''}
                  </p>
                </div>
              </div>

              {/* Mobile Logout Button */}
              <style>{`
                .sidebar-mobile-logout {
                  display: none;
                }
                @media (max-width: 767px) {
                  .sidebar-mobile-logout {
                    display: block !important;
                    padding: 0 12px 16px;
                  }
                }
              `}</style>
              <div className="sidebar-mobile-logout">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '11px 16px', borderRadius: '12px',
                    background: '#1E3A8A', border: 'none', color: 'white',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <LogOut size={17} strokeWidth={2} />
                  <span className="sidebar-logout-text">Logout</span>
                </button>
              </div>

              {/* Desktop Logout Button */}
              <div style={{ padding: '0 12px 16px' }}>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '11px 16px', borderRadius: '12px',
                    background: '#1E3A8A', border: 'none', color: 'white',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <LogOut size={17} strokeWidth={2} />
                  <span className="sidebar-logout-text">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
              <div title={user?.name || 'User'} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 600, background: '#1E3A8A', fontSize: '12px',
              }}>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <button title="Logout" onClick={() => setShowLogoutConfirm(true)}
                style={{
                  padding: '8px', borderRadius: '12px', border: 'none', background: 'none',
                  color: '#6b7280', cursor: 'pointer', display: 'flex', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

        {/* ── Logout Confirmation Modal ── */}
        {showLogoutConfirm && (
          <div style={{
            position: 'fixed', inset: 0, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          }}>
            <div style={{
              background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              padding: '24px', width: '360px', maxWidth: 'calc(100vw - 32px)', margin: '0 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <AlertCircle size={24} color="#f97316" strokeWidth={2} />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', fontFamily: 'inherit' }}>
                  Confirm Logout
                </h2>
              </div>
              <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>
                Are you sure you want to logout?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
                    background: 'white', color: '#374151', fontWeight: 500, fontSize: '14px',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                  No
                </button>
                <button onClick={handleConfirmLogout}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', border: 'none',
                    background: '#1E3A8A', color: 'white', fontWeight: 500, fontSize: '14px',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};