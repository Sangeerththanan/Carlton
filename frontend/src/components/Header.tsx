import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import logoHeader from "../assets/images/logo.png";
import { NotificationPanel } from "./NotificationPanel";

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasNotification] = useState(true);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  const userInitial = user?.name?.charAt(0).toUpperCase() || "J";

  const btnBase: React.CSSProperties = {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    background: "#1E3A8A",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s ease",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        .hdr-desktop { display: flex !important; }
        .hdr-mobile  { display: none  !important; }
        .hdr-logo    { height: 48px; }

        @media (max-width: 767px) {
          .hdr-desktop { display: none !important; }
          .hdr-mobile  { display: flex !important; }
          .hdr-logo    { height: 34px; }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .hdr-logo { height: 40px; }
        }
      `}</style>

      <header
        style={{
          background: "linear-gradient(180deg, #f0f4f8 0%, #e8eef4 100%)",
          borderBottom: "1px solid #d0dce8",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ paddingLeft: "16px", paddingRight: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "64px",
            }}
          >
            {/* ── Logo ── */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logoHeader}
                alt="Carlton Leisure – Worldwide Travel & Tours"
                className="hdr-logo"
                style={{ width: "auto", objectFit: "contain" }}
              />
            </div>

            {/* ── DESKTOP: Settings · Notif · Avatar (≥ 768px) ── */}
            <div
              className="hdr-desktop"
              style={{ alignItems: "center", gap: "8px" }}
            >
              {/* Settings */}
              <button
                aria-label="Settings"
                style={btnBase}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#162d6e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1E3A8A")
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {/* Notifications */}
              <div style={{ position: "relative" }}>
                <button
                  ref={notifButtonRef}
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  onClick={() => setNotifOpen((prev) => !prev)}
                  style={{
                    ...btnBase,
                    background: notifOpen ? "#162d6e" : "#1E3A8A",
                    position: "relative",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#162d6e")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notifOpen
                      ? "#162d6e"
                      : "#1E3A8A")
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {hasNotification && (
                    <span
                      style={{
                        position: "absolute",
                        top: "7px",
                        right: "7px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#e53e3e",
                        border: "1.5px solid #1E3A8A",
                      }}
                    />
                  )}
                </button>
                <NotificationPanel
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                />
              </div>

              {/* User avatar */}
              <button
                aria-label={`User: ${user?.name || "User"}`}
                style={btnBase}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#162d6e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1E3A8A")
                }
              >
                <span
                  style={{
                    color: "white",
                    fontSize: "15px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                  }}
                >
                  {userInitial}
                </span>
              </button>
            </div>

            {/* ── MOBILE: Notif · Hamburger only (< 768px) ── */}
            <div
              className="hdr-mobile"
              style={{ alignItems: "center", gap: "8px" }}
            >
              {/* Notifications */}
              <div style={{ position: "relative" }}>
                <button
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  onClick={() => setNotifOpen((prev) => !prev)}
                  style={{
                    ...btnBase,
                    background: notifOpen ? "#162d6e" : "#1E3A8A",
                    position: "relative",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#162d6e")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notifOpen
                      ? "#162d6e"
                      : "#1E3A8A")
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {hasNotification && (
                    <span
                      style={{
                        position: "absolute",
                        top: "7px",
                        right: "7px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#e53e3e",
                        border: "1.5px solid #1E3A8A",
                      }}
                    />
                  )}
                </button>
                <NotificationPanel
                  isOpen={notifOpen}
                  onClose={() => setNotifOpen(false)}
                />
              </div>

              {/* Hamburger */}
              <button
                onClick={onMenuToggle}
                aria-label="Toggle menu"
                style={btnBase}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#162d6e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#1E3A8A")
                }
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
