import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { useDashboardData } from "../hooks/useDashboardData";


//Icons

const CalendarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const CheckBadgeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const InfoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8h.01M12 12v4" />
  </svg>
);
const PlaneIcon = ({
  size = 16,
  color = "#1C398E",
  rotate = 0,
}: {
  size?: number;
  color?: string;
  rotate?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ transform: `rotate(${rotate}deg)`, flexShrink: 0 }}
  >
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const TicketIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const MegaphoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1C398E">
    <path d="M18 4a1 1 0 0 0-1.447-.894L7 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1.333L7 20.138A1 1 0 0 0 8 21h1a1 1 0 0 0 1-1v-3.535l7.553 3.429A1 1 0 0 0 19 19V5a1 1 0 0 0-1-1z" />
  </svg>
);
const TagIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.5" fill="#1C398E" stroke="none" />
  </svg>
);
const GlobeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1C398E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
  </svg>
);

//KPI Cards

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  background: string;
}

// Tiny/small phones: horizontal pill layout
const KpiCardTiny: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  background,
}) => (
  <div
    className="rounded-xl p-2.5 flex flex-col justify-between gap-1.5"
    style={{ background, minHeight: 60 }}
  >
    <div className="flex items-center gap-0.5 min-w-0">
      <div
        style={{
          transform: "scale(0.7)",
          transformOrigin: "left center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <p
        className="text-[10px] font-medium leading-tight truncate"
        style={{ color: "#1C398E", opacity: 0.8 }}
      >
        {label}
      </p>
    </div>
    <p
      className="text-base font-black flex-shrink-0"
      style={{ color: "#1C398E" }}
    >
      {value}
    </p>
  </div>
);

// // Medium phones / portrait tablet: stacked
// const KpiCardMobile: React.FC<KpiCardProps> = ({ icon, label, value, background }) => (
//   <div className="rounded-2xl p-3 flex flex-col justify-between" style={{ background, minHeight: 80 }}>
//     <div className="flex items-center gap-1 mb-1.5">
//       <div style={{ transform: 'scale(0.8)', transformOrigin: 'left center', flexShrink: 0 }}>{icon}</div>
//       <p className="text-xs font-medium leading-tight" style={{ color: '#1C398E', opacity: 0.75 }}>{label}</p>
//     </div>
//     <p className="text-xl font-black leading-none" style={{ color: '#1C398E' }}>{value}</p>
//   </div>
// );

// Desktop: icon top-left, value top-right, label bottom
const KpiCardDesktop: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  background,
}) => (
  <div
    className="rounded-2xl p-4 flex flex-col"
    style={{ background, minHeight: 105 }}
  >
    <div className="flex items-start justify-between mb-auto">
      <div>{icon}</div>
      <p
        className="text-4xl font-black leading-none text-right"
        style={{ color: "#1C398E" }}
      >
        {value}
      </p>
    </div>
    <p
      className="text-sm font-medium mt-1"
      style={{ color: "#1C398E", opacity: 0.75 }}
    >
      {label}
    </p>
  </div>
);

//Notification Row

interface NotificationRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  icon,
  title,
  subtitle,
  time,
}) => (
  <div className="flex items-center gap-2.5 py-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors rounded-lg px-1">
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-xl"
      style={{ width: 38, height: 38, background: "#eef1fb", minWidth: 38 }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
        {title}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
        {subtitle}
      </p>
    </div>
    <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
      {time}
    </span>
  </div>
);

//Route Rows

interface RouteRowProps {
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  price: string;
  badge?: string;
}

// Mobile/tablet: two-line
const RouteRowMobile: React.FC<RouteRowProps> = ({
  from,
  to,
  fromCity,
  toCity,
  price,
  badge,
}) => (
  <div className="py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 min-w-0">
        <span
          className="font-bold text-xs sm:text-sm"
          style={{ color: "#1C398E" }}
        >
          {from}
        </span>
        <PlaneIcon size={10} color="#1C398E" rotate={45} />
        <span
          className="font-bold text-xs sm:text-sm"
          style={{ color: "#1C398E" }}
        >
          {to}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className="font-black text-sm sm:text-base"
          style={{ color: "#1C398E" }}
        >
          {price}
        </span>
        <button
          className="text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
          style={{ background: "#1C398E", minHeight: 32 }}
        >
          Book
        </button>
      </div>
    </div>
    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
      <span className="text-[10px] sm:text-xs text-gray-400">
        {fromCity} → {toCity}
      </span>
      {badge && (
        <span
          className="inline-block text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: "rgba(241,154,54,0.25)", color: "#92540a" }}
        >
          {badge}
        </span>
      )}
    </div>
  </div>
);

// Desktop: single-line
const RouteRowDesktop: React.FC<RouteRowProps> = ({
  from,
  to,
  fromCity,
  toCity,
  price,
  badge,
}) => (
  <div className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-0 flex-wrap">
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="font-bold text-sm" style={{ color: "#1C398E" }}>
        {from}
      </span>
      <PlaneIcon size={11} color="#1C398E" rotate={45} />
      <span className="font-bold text-sm" style={{ color: "#1C398E" }}>
        {to}
      </span>
    </div>
    <span className="text-xs text-gray-400 hidden xl:inline">
      ( {fromCity} → {toCity} )
    </span>
    {badge && (
      <span
        className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={{ background: "rgba(241,154,54,0.28)", color: "#92540a" }}
      >
        {badge}
      </span>
    )}
    <span className="font-black text-lg ml-auto" style={{ color: "#1C398E" }}>
      {price}
    </span>
    <button
      className="text-white text-sm font-bold px-4 py-1.5 rounded-xl hover:opacity-90 transition-all flex-shrink-0"
      style={{ background: "#1C398E" }}
    >
      Book
    </button>
  </div>
);

//Promo Card

interface PromoCardProps {
  icon: React.ReactNode;
  badge: string;
  highlight: React.ReactNode;
  description: string;
}

const PromoCard: React.FC<PromoCardProps> = ({
  icon,
  badge,
  highlight,
  description,
}) => (
  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 flex flex-col h-full">
    <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 mb-2.5">
      {icon}
      <span
        className="text-[10px] sm:text-xs font-bold tracking-widest"
        style={{ color: "#1C398E" }}
      >
        {badge}
      </span>
    </div>
    <div
      className="rounded-xl px-3 py-2.5 mb-2.5 flex items-center justify-center"
      style={{ background: "rgba(241,154,54,0.25)" }}
    >
      <p className="font-semibold text-[#1C398E] text-xs sm:text-sm text-center">
        {highlight}
      </p>
    </div>
    <p className="text-[10px] sm:text-xs text-gray-500 text-center flex-1 mb-3 leading-relaxed">
      {description}
    </p>
    <button
      className="self-center px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
      style={{ background: "rgba(241,154,54,0.3)", color: "#92540a" }}
    >
      Book
    </button>
  </div>
);

//Swipeable Carousel

const SwipeableCarousel: React.FC<{ items: PromoCardProps[] }> = ({
  items,
}) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="p-3 sm:p-4" style={{ background: "#EBF0FF" }}>
          <PromoCard {...items[index]} />
        </div>
        <button
          onClick={prev}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 items-center justify-center rounded-full bg-white shadow text-[#1C398E] hover:bg-gray-50 active:scale-95 transition-all z-10"
        >
          <ChevronIcon dir="left" />
        </button>
        <button
          onClick={next}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 items-center justify-center rounded-full bg-white shadow text-[#1C398E] hover:bg-gray-50 active:scale-95 transition-all z-10"
        >
          <ChevronIcon dir="right" />
        </button>
      </div>
      <div className="flex justify-center gap-1.5 mt-2.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Promo ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 24 : 6,
              background: i === index ? "#1C398E" : "#CBD5E1",
            }}
          />
        ))}
      </div>
    </div>
  );
};

//Main Dashboard

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"notifications" | "routes">(
    "notifications",
  );

  const { user, nextTrip, notifications, routes, promotions } =
    useDashboardData();

  const promoCards: PromoCardProps[] = (promotions || []).map((p: any) => ({
    icon: p.badgeType === "globe" ? <GlobeIcon /> : <TagIcon />,
    badge: p.badge || "",
    highlight: p.highlight || p.badge || "",
    description: p.description || "",
  }));

  const kpi = {
    activeBookings: user?.stats?.activeBookings ?? 0,
    completedTrips: user?.stats?.completedTrips ?? 0,
    loyaltyPoints: user?.stats?.loyaltyPoints ?? 0,
    pendingActions: user?.stats?.pendingActions ?? 0,
  };

  const nextTripDisplay = nextTrip
    ? {
        daysUntil: nextTrip.daysUntil,
        from: nextTrip.from,
        to: nextTrip.to,
        fromCity: nextTrip.fromCity,
        toCity: nextTrip.toCity,
        date: nextTrip.date,
        flightNumber: nextTrip.flightNumber,
      }
    : null;

  return (
    <DashboardLayout>
      {/*
        Breakpoint strategy:
          < 360px  : "tiny"  — xs styles (use [360px]: prefix via inline or min-w tricks)
          360–639  : "xs/sm" — 2-col KPI pills, stacked banner, tabbed sections
          640–767  : "sm"    — slightly more room, same mobile layout
          768–1023 : "md"    — tablet: banner inline, 2-col KPI desktop cards
          1024+    : "lg"    — full desktop layout
      */}
      <div className="px-2 py-3 sm:px-3 sm:py-4 md:px-5 md:py-5 lg:px-6 lg:py-6 space-y-3 sm:space-y-4 md:space-y-5">
        {/*KPI Cards*/}

        {/* All phones up to 767px: always 2-col, tiny card fits 337px+ */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <KpiCardTiny
            icon={<CalendarIcon />}
            label="Active Bookings"
            value={kpi.activeBookings}
            background="#EBF0FF"
          />
          <KpiCardTiny
            icon={<CheckBadgeIcon />}
            label="Completed Trips"
            value={kpi.completedTrips}
            background="#FFEFDD"
          />
          <KpiCardTiny
            icon={<ShieldIcon />}
            label="Loyalty Points"
            value={String(kpi.loyaltyPoints)}
            background="#EBF0FF"
          />
          <KpiCardTiny
            icon={<InfoIcon />}
            label="Pending Actions"
            value={kpi.pendingActions}
            background="#FFEFDD"
          />
        </div>

        {/* Tablet 768–1023: 2-col desktop style */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
          <KpiCardDesktop
            icon={<CalendarIcon />}
            label="Active Bookings"
            value={kpi.activeBookings}
            background="#EBF0FF"
          />
          <KpiCardDesktop
            icon={<CheckBadgeIcon />}
            label="Completed Trips"
            value={kpi.completedTrips}
            background="#FFEFDD"
          />
          <KpiCardDesktop
            icon={<ShieldIcon />}
            label="Loyalty Points"
            value={String(kpi.loyaltyPoints)}
            background="#EBF0FF"
          />
          <KpiCardDesktop
            icon={<InfoIcon />}
            label="Pending Actions"
            value={kpi.pendingActions}
            background="#FFEFDD"
          />
        </div>

        {/* Desktop 1024+: 4-col */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-7">
          <KpiCardDesktop
            icon={<CalendarIcon />}
            label="Active Bookings"
            value={kpi.activeBookings}
            background="#EBF0FF"
          />
          <KpiCardDesktop
            icon={<CheckBadgeIcon />}
            label="Completed Trips"
            value={kpi.completedTrips}
            background="#FFEFDD"
          />
          <KpiCardDesktop
            icon={<ShieldIcon />}
            label="Loyalty Points"
            value={String(kpi.loyaltyPoints)}
            background="#EBF0FF"
          />
          <KpiCardDesktop
            icon={<InfoIcon />}
            label="Pending Actions"
            value={kpi.pendingActions}
            background="#FFEFDD"
          />
        </div>

        {/*Next Trip Banner*/}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ border: "1px solid #FFD6A8" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #FFDDB3 0%, #D4DFFF 100%)",
              opacity: 0.5,
            }}
          />
          <div className="relative p-3 sm:p-4 md:p-5 lg:p-6">
            {/* Mobile: stacked */}
            <div className="md:hidden">
              <div className="flex items-start gap-2.5 mb-3">
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: "rgba(255,255,255,0.65)",
                    minWidth: 40,
                  }}
                >
                  <div style={{ transform: "rotate(45deg)" }}>
                    <PlaneIcon size={18} color="#9CA3AF" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                    {nextTripDisplay
                      ? `Your next trip is in ${nextTripDisplay.daysUntil} days!`
                      : "No upcoming trips"}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {nextTripDisplay
                      ? `${nextTripDisplay.fromCity} (${nextTripDisplay.from}) → ${nextTripDisplay.toCity} (${nextTripDisplay.to}) • ${nextTripDisplay.date} • ${nextTripDisplay.flightNumber}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/checkin")}
                  className="flex-1 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: "#1C398E" }}
                >
                  Web Check-in
                </button>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="flex-1 py-2 bg-white text-gray-800 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  View Booking
                </button>
              </div>
            </div>

            {/* Tablet + Desktop: inline row */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(255,255,255,0.65)",
                    minWidth: 48,
                  }}
                >
                  <div style={{ transform: "rotate(45deg)" }}>
                    <PlaneIcon size={20} color="#9CA3AF" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm lg:text-base font-bold text-gray-900 truncate">
                    {nextTripDisplay
                      ? `Your next trip is in ${nextTripDisplay.daysUntil} days!`
                      : "No upcoming trips"}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 mt-0.5 truncate">
                    {nextTripDisplay
                      ? `${nextTripDisplay.fromCity} (${nextTripDisplay.from}) → ${nextTripDisplay.toCity} (${nextTripDisplay.to}) • ${nextTripDisplay.date} • ${nextTripDisplay.flightNumber}`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate("/checkin")}
                  className="px-4 lg:px-6 py-2 lg:py-2.5 text-white text-xs lg:text-sm font-semibold rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
                  style={{ background: "#1C398E" }}
                >
                  Web Check-in
                </button>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="px-4 lg:px-6 py-2 lg:py-2.5 bg-white text-gray-800 text-xs lg:text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all whitespace-nowrap"
                >
                  View Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        {/*Notifications & Routes*/}

        {/* Mobile + Tablet (<1024px): tabbed single card */}
        <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(["notifications", "routes"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-[10px] sm:text-xs font-semibold transition-colors relative"
                style={{ color: activeTab === tab ? "#1C398E" : "#9CA3AF" }}
              >
                {tab === "notifications"
                  ? "Recent Notifications"
                  : "Frequent Routes"}
                {activeTab === tab && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "#1C398E" }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="p-3 sm:p-4">
            {activeTab === "notifications" ? (
              <>
                {notifications && notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <NotificationRow
                      key={n.id}
                      icon={
                        n.type === "ticket_issued" ? (
                          <TicketIcon />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                      title={n.title}
                      subtitle={n.subtitle}
                      time={n.time}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No notifications</p>
                )}
              </>
            ) : (
              <>
                {routes && routes.length > 0 ? (
                  routes.map((r: any) => (
                    <RouteRowMobile
                      key={r.id || `${r.from}-${r.to}`}
                      from={r.from}
                      to={r.to}
                      fromCity={r.fromCity}
                      toCity={r.toCity}
                      price={r.price}
                      badge={r.badge}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No routes</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Desktop (1024+): two separate cards side by side */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5" style={{ background: "#f9fafb" }}>
              <h3 className="text-sm font-bold text-gray-900 pb-4">
                Recent Notifications
              </h3>
            </div>
            <div className="px-5 pb-5">
              {notifications && notifications.length > 0 ? (
                notifications.map((n: any) => (
                  <NotificationRow
                    key={n.id}
                    icon={
                      n.type === "ticket_issued" ? (
                        <TicketIcon />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    title={n.title}
                    subtitle={n.subtitle}
                    time={n.time}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No notifications</p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5" style={{ background: "#f9fafb" }}>
              <h3 className="text-sm font-bold text-gray-900 pb-4">
                Frequent Routes
              </h3>
            </div>
            <div className="px-5 pb-5">
              {routes && routes.length > 0 ? (
                routes.map((r: any) => (
                  <RouteRowDesktop
                    key={r.id || `${r.from}-${r.to}`}
                    from={r.from}
                    to={r.to}
                    fromCity={r.fromCity}
                    toCity={r.toCity}
                    price={r.price}
                    badge={r.badge}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No routes</p>
              )}
            </div>
          </div>
        </div>

        {/*Promotional Updates*/}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3 lg:mb-4">
            <MegaphoneIcon />
            <h2
              className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-widest uppercase"
              style={{ color: "#1C398E" }}
            >
              Promotional Updates
            </h2>
          </div>

          {/* Mobile + Tablet: swipeable carousel */}
          <div className="lg:hidden">
            <SwipeableCarousel items={promoCards} />
          </div>

          {/* Desktop: 3-col grid */}
          <div
            className="hidden lg:block rounded-2xl p-4 xl:p-5"
            style={{ background: "#EBF0FF" }}
          >
            <div className="grid grid-cols-3 gap-4">
              {promoCards.map((card, i) => (
                <PromoCard key={i} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
