import React, { useEffect, useRef } from 'react';

export interface Notification {
  id: number;
  type: 'booking' | 'ticket' | 'alert' | 'info';
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

const defaultNotifications: Notification[] = [
  {
    id: 1,
    type: 'booking',
    title: 'Booking Confirmed',
    subtitle: 'PNR: ABC123 • London to Dubai',
    time: '2 days ago',
    read: false,
  },
  {
    id: 2,
    type: 'ticket',
    title: 'E-Ticket Issued',
    subtitle: 'Ticket Number: 1234567890',
    time: '2 days ago',
    read: false,
  },
];

const IconBooking = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="4" x2="9" y2="9" />
  </svg>
);

const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'booking': return <IconBooking />;
    case 'ticket': return <IconTicket />;
    case 'alert': return <IconAlert />;
    default: return <IconInfo />;
  }
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications = defaultNotifications,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - subtle */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="notification-panel"
        style={{
          position: 'fixed',
          top: '64px',
          right: '0',
          width: '380px',
          maxHeight: 'calc(100vh - 64px)',
          backgroundColor: '#ffffff',
          borderRadius: '0',
          boxShadow: '0 8px 32px rgba(30, 58, 138, 0.15), 0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'notifSlideIn 0.2s ease',
        }}
      >
        <style>{`
          @keyframes notifSlideIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)  scale(1); }
          }

          @media (max-width: 767px) {
            .notification-panel {
              position: fixed !important;
              top: 64px !important;
              right: 0 !important;
              left: 0 !important;
              width: 100% !important;
              max-height: calc(100vh - 64px) !important;
              border-radius: 0 !important;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
            }

            .notification-item {
              padding: 14px 12px !important;
            }

            .notification-title {
              font-size: 13px !important;
            }

            .notification-subtitle {
              font-size: 11px !important;
            }

            .notification-time {
              font-size: 10px !important;
            }

            .notification-icon {
              width: 36px !important;
              height: 36px !important;
            }

            .notification-icon svg {
              width: 16px !important;
              height: 16px !important;
            }

            .notification-header {
              padding: 14px 16px 12px !important;
              font-size: 14px !important;
            }

            .notification-close-btn {
              width: 24px !important;
              height: 24px !important;
            }

            .notification-close-btn svg {
              width: 12px !important;
              height: 12px !important;
            }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid #e8eef4',
        }} className="notification-header"
        >
          <span style={{
            fontWeight: '700',
            fontSize: '15px',
            color: '#1E3A8A',
            letterSpacing: '0.01em',
          }}>
            Notifications
          </span>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="notification-close-btn"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: 'none',
              background: '#f0f4f8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dce6f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0f4f8')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Notification list */}
        <div style={{ padding: '8px 12px 12px' }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: '32px 0',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '14px',
            }}>
              No notifications yet
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={n.id}
                className="notification-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 10px',
                  borderRadius: '10px',
                  backgroundColor: '#edf1f8',
                  marginBottom: i < notifications.length - 1 ? '8px' : '0',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#dde5f3')}
                onMouseLeave={e => (e.currentTarget.style.background = '#edf1f8')}
              >
                {/* Icon */}
                <div className="notification-icon" style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#d4dff5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {getIcon(n.type)}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="notification-title" style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#1a2e5a',
                    marginBottom: '2px',
                  }}>
                    {n.title}
                  </div>
                  <div className="notification-subtitle" style={{
                    fontSize: '12px',
                    color: '#5a7099',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {n.subtitle}
                  </div>
                </div>

                {/* Time */}
                <div className="notification-time" style={{
                  fontSize: '11px',
                  color: '#8fa3c0',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                  marginTop: '2px',
                }}>
                  {n.time}
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '8px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#1E3A8A',
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};