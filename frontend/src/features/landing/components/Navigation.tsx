import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [flightOptions, setFlightOptions] = useState<Array<{ id: string; label: string; to: string }>>([]);
  const [airlineOptions, setAirlineOptions] = useState<Array<{ id: string; label: string; to: string }>>([]);

  useEffect(() => {
    const controller = new AbortController();

    const fallbackFlights = [
      { id: 'economy', label: 'Economy', to: '/flights?cabinClass=Economy%20Class' },
      { id: 'business', label: 'Business', to: '/flights?cabinClass=Business' },
      { id: 'first', label: 'First Class', to: '/flights?cabinClass=First' },
      { id: 'multi', label: 'Multi-City', to: '/flights?tripType=multi-city' },
      { id: 'checkin', label: 'Online Check-In', to: '/checkin' },
    ];

    const fallbackAirlines = [
      { id: 'ba', label: 'British Airways', to: '/flights?airline=British%20Airways' },
      { id: 'emirates', label: 'Emirates', to: '/flights?airline=Emirates' },
      { id: 'etihad', label: 'Etihad', to: '/flights?airline=Emirates' },
      { id: 'latam', label: 'Latam', to: '/flights?airline=Emirates' },
      { id: 'qatar', label: 'Qatar', to: '/flights?airline=Emirates' },
      { id: 'south-african', label: 'South African', to: '/flights?airline=Emirates' },
      { id: 'turkish', label: 'Turkish', to: '/flights?airline=Emirates' },
      { id: 'all-airlines', label: 'All Air Lines', to: '/flights?airline=Emirates' },


    ];

    // Try fetch menu items from server; if it fails, use fallback arrays
    (async () => {
      try {
        const [fRes, aRes] = await Promise.all([
          fetch('/api/menu/flight-options', { signal: controller.signal }),
          fetch('/api/menu/airlines', { signal: controller.signal }),
        ]);

        if (fRes.ok) {
          const data = await fRes.json();
          if (Array.isArray(data) && data.length) setFlightOptions(data.map((d: any, i: number) => ({ id: d.id ?? `f-${i}`, label: d.label ?? d.name ?? String(d), to: d.to ?? d.url ?? `/flights?${new URLSearchParams(d.params ?? {}).toString()}` })));
          else setFlightOptions(fallbackFlights);
        } else setFlightOptions(fallbackFlights);

        if (aRes.ok) {
          const data = await aRes.json();
          if (Array.isArray(data) && data.length) setAirlineOptions(data.map((d: any, i: number) => ({ id: d.id ?? `a-${i}`, label: d.label ?? d.name ?? String(d), to: d.to ?? d.url ?? `/flights?airline=${encodeURIComponent(d.code ?? d.name ?? '')}` })));
          else setAirlineOptions(fallbackAirlines);
        } else setAirlineOptions(fallbackAirlines);
      } catch (err) {
        setFlightOptions(fallbackFlights);
        setAirlineOptions(fallbackAirlines);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-[#f7f8fb]">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5 md:h-[68px] md:max-w-none md:px-10 lg:px-16 xl:px-20">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Carlton Leisure"
              className="h-9 w-auto sm:h-10 md:h-11"
            />
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:ml-auto md:justify-end md:flex lg:gap-10">
          <a href="#home" className="text-[13px] font-semibold text-[#1c398e] transition-colors hover:text-[#102a73]">
            Home
          </a>
          <div className="group relative">
            <a href="#flights" className="text-[13px] font-semibold text-[#1c398e] transition-colors hover:text-[#102a73]">
              Flights
            </a>

            <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 translate-y-2 rounded-2xl border border-[#dbe3f2] bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(18,34,70,0.14)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c86a0]">
                Flight Options
              </div>
              <div className="space-y-1">
                {flightOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                ) : (
                  flightOptions.map(opt => (
                    <Link
                      key={opt.id}
                      to={opt.to}
                      className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#1f2f5c] transition-colors hover:bg-[#f3f6fd] hover:text-[#17307a]"
                    >
                      {opt.label}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          <a href="#hotels" className="text-[13px] font-semibold text-[#1c398e] transition-colors hover:text-[#102a73]">
            Hotels
          </a>
          <a href="#car-hire" className="text-[13px] font-semibold text-[#1c398e] transition-colors hover:text-[#102a73]">
            Car Hire
          </a>
          <div className="group relative">
            <a href="#air-lines" className="text-[13px] font-semibold text-[#1c398e] transition-colors hover:text-[#102a73]">
              Air Lines
            </a>

            <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 translate-y-2 rounded-2xl border border-[#dbe3f2] bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(18,34,70,0.14)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c86a0]">
                Air Line Options
              </div>
              <div className="space-y-1">
                {airlineOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                ) : (
                  airlineOptions.map(opt => (
                    <Link
                      key={opt.id}
                      to={opt.to}
                      className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#1f2f5c] transition-colors hover:bg-[#f3f6fd] hover:text-[#17307a]"
                    >
                      {opt.label}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="group relative">
            <a href="#travel-extras" className="text-[13px] font-semibold text-[#1c398e] transition-colors hover:text-[#102a73]">
              Travel Extras
            </a>

            <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 translate-y-2 rounded-2xl border border-[#dbe3f2] bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(18,34,70,0.14)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c86a0]">
                Travel Extras
              </div>
              <div className="space-y-1">
                <Link
                  to="/travel-extras/insurance"
                  className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#1f2f5c] transition-colors hover:bg-[#f3f6fd] hover:text-[#17307a]"
                >
                  Travel Insurance
                </Link>
                <Link
                  to="/travel-extras/parking"
                  className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#1f2f5c] transition-colors hover:bg-[#f3f6fd] hover:text-[#17307a]"
                >
                  Airport Parking
                </Link>
                <Link
                  to="/travel-extras/documents"
                  className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#1f2f5c] transition-colors hover:bg-[#f3f6fd] hover:text-[#17307a]"
                >
                  Travel Documents
                </Link>
              </div>
            </div>
          </div>
          <Link
            to="/login"
            className="rounded-xl bg-[#1c398e] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(28,57,142,0.22)] transition-colors hover:bg-[#142f7b]"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 md:hidden"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`pointer-events-none absolute left-0 right-0 top-full z-50 origin-top border-t border-slate-200 bg-white/70 backdrop-blur-md transition-all duration-200 ease-out md:hidden ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 px-5 py-4">
          <a
            href="#home"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1c398e] transition-colors hover:bg-white/70"
          >
            Home
          </a>
          <a
            href="#flights"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1c398e] transition-colors hover:bg-white/70"
          >
            Flights
          </a>
          <Link
            to="/car-hire"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1c398e] transition-colors hover:bg-white/70"
          >
            Car Hire
          </Link>
          <a
            href="#hotels"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1c398e] transition-colors hover:bg-white/70"
          >
            Hotels
          </a>
          <Link
            to="/travel-extras"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1c398e] transition-colors hover:bg-white/70"
          >
            Travel Extras
          </Link>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="mt-2 inline-flex justify-center rounded-xl bg-[#1c398e] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(28,57,142,0.22)] transition-colors hover:bg-[#142f7b]"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};
