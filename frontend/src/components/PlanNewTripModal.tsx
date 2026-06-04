import React from 'react';
import Modal from './Modal';
import type { CreateTravelPlanRequest } from '../features/travelPlans/types/travelPlanTypes';

type BudgetSliderConfig = {
  max: number;
  step: number;
};

const CURRENCY_PRESETS: Record<string, { max: number; step: number }> = {
  USD: { max: 20_000, step: 10 },
  EUR: { max: 20_000, step: 10 },
  GBP: { max: 20_000, step: 10 },
  AUD: { max: 20_000, step: 10 },
  CAD: { max: 20_000, step: 10 },
  CHF: { max: 20_000, step: 10 },
  SGD: { max: 20_000, step: 10 },
  NZD: { max: 20_000, step: 10 },

  LKR: { max: 6_000_000, step: 10_000 },
  INR: { max: 2_000_000, step: 1_000 },
  PKR: { max: 6_000_000, step: 10_000 },
  JPY: { max: 3_000_000, step: 1_000 },
  KRW: { max: 30_000_000, step: 10_000 },
  IDR: { max: 350_000_000, step: 500_000 },
  VND: { max: 600_000_000, step: 1_000_000 },
};

const roundUpNice = (n: number) => {
  const value = Number.isFinite(n) ? n : 0;
  if (value <= 0) return 0;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const candidates = [1, 2, 5, 10].map((m) => m * magnitude);
  return candidates.find((c) => c >= value) ?? 10 * magnitude;
};

const stepForMax = (max: number) => {
  if (max <= 20_000) return 10;
  if (max <= 200_000) return 100;
  if (max <= 2_000_000) return 1_000;
  if (max <= 20_000_000) return 10_000;
  if (max <= 200_000_000) return 100_000;
  return 1_000_000;
};

const getBudgetSliderConfig = (currencyCode: string, currentBudget: number): BudgetSliderConfig => {
  const c = (currencyCode ?? '').trim().toUpperCase();
  const preset = CURRENCY_PRESETS[c] ?? { max: 200_000, step: 100 };

  const current = Number.isFinite(currentBudget) ? currentBudget : 0;
  const max = roundUpNice(Math.max(preset.max, current));
  return { max, step: stepForMax(max) };
};

export type PlanNewTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
  form: CreateTravelPlanRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateTravelPlanRequest>>;
  saving: boolean;
  addFlightLeg: () => void;
  updateFlight: (index: number, patch: Partial<CreateTravelPlanRequest['flights'][number]>) => void;
  adjustCount: (field: 'adults' | 'children' | 'infants', delta: number, min: number) => void;
  onSubmit: () => void | Promise<void>;
};

type TripInfoSectionProps = {
  form: CreateTravelPlanRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateTravelPlanRequest>>;
  adjustCount: (field: 'adults' | 'children' | 'infants', delta: number, min: number) => void;
};

function TripInfoSection({ form, setForm, adjustCount }: TripInfoSectionProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2">TRIP INFO</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Trip name</label>
          <input
            value={form.tripName}
            onChange={(e) => setForm((p) => ({ ...p, tripName: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Dubai Family Holiday 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred airline (optional)</label>
          <input
            value={form.preferredAirline ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, preferredAirline: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cabin class</label>
          <select
            value={form.cabinClass}
            onChange={(e) => setForm((p) => ({ ...p, cabinClass: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'adults', label: 'Adults', min: 1 },
              { key: 'children', label: 'Children', min: 0 },
              { key: 'infants', label: 'Infants', min: 0 },
            ] as const).map((pax) => (
              <div key={pax.key} className="border border-gray-300 rounded-md p-2">
                <div className="text-xs text-gray-500 font-semibold">{pax.label}</div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => adjustCount(pax.key, -1, pax.min)}
                    className="w-7 h-7 rounded-md border border-gray-300 text-gray-700"
                    type="button"
                  >
                    -
                  </button>
                  <div className="text-sm font-semibold text-gray-800">{form[pax.key]}</div>
                  <button
                    onClick={() => adjustCount(pax.key, 1, pax.min)}
                    className="w-7 h-7 rounded-md border border-gray-300 text-gray-700"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type FlightLegsSectionProps = {
  isMultiCity: boolean;
  flights: CreateTravelPlanRequest['flights'];
  addFlightLeg: () => void;
  updateFlight: (index: number, patch: Partial<CreateTravelPlanRequest['flights'][number]>) => void;
};

function FlightLegsSection({ isMultiCity, flights, addFlightLeg, updateFlight }: FlightLegsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-gray-500">FLIGHT LEGS</div>
        <button onClick={addFlightLeg} type="button" className="text-sm font-semibold" style={{ color: '#1E3A8A' }}>
          + Add another flight leg
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {flights.map((leg, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-gray-500 mb-2">FLIGHT {idx + 1}</div>
            <div className={`grid grid-cols-1 gap-4 ${isMultiCity ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                <input
                  value={leg.departureAirport}
                  onChange={(e) => updateFlight(idx, { departureAirport: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. LHR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arrival</label>
                <input
                  value={leg.arrivalAirport}
                  onChange={(e) => updateFlight(idx, { arrivalAirport: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. DXB"
                />
              </div>
              {isMultiCity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From date</label>
                  <input
                    type="date"
                    value={leg.fromDate ?? ''}
                    onChange={(e) => updateFlight(idx, { fromDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type DateRangeSectionProps = {
  isMultiCity: boolean;
  fromDate: string;
  toDate: string;
  setForm: React.Dispatch<React.SetStateAction<CreateTravelPlanRequest>>;
};

function DateRangeSection({ isMultiCity, fromDate, toDate, setForm }: DateRangeSectionProps) {
  if (isMultiCity) return null;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2">DATE RANGE</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To date (optional)</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

type BudgetSectionProps = {
  form: CreateTravelPlanRequest;
  setForm: React.Dispatch<React.SetStateAction<CreateTravelPlanRequest>>;
};

function BudgetSection({ form, setForm }: BudgetSectionProps) {
  const currency = (form.currency ?? '').trim().toUpperCase();

  const sliderConfig = React.useMemo(
    () => getBudgetSliderConfig(currency, form.maxBudget),
    [currency, form.maxBudget],
  );

  const clampedMaxBudget = Math.min(Number.isFinite(form.maxBudget) ? form.maxBudget : 0, sliderConfig.max);

  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2">BUDGET</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget type</label>
          <input
            value="Maximum"
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <input
            value={form.currency}
            onChange={(e) => {
              const nextCurrency = e.target.value.toUpperCase();
              setForm((p) => ({ ...p, currency: nextCurrency }));
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="USD"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum budget</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={sliderConfig.max}
            step={sliderConfig.step}
            value={clampedMaxBudget}
            onChange={(e) => setForm((p) => ({ ...p, maxBudget: Math.min(Number(e.target.value), sliderConfig.max) }))}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-800">{currency || 'USD'}</div>
            <input
              type="number"
              min={0}
              step={sliderConfig.step}
              value={clampedMaxBudget}
              onChange={(e) => {
                const next = e.target.value === '' ? 0 : Number(e.target.value);
                setForm((p) => {
                  const normalized = Math.max(0, next);
                  return {
                    ...p,
                    maxBudget: normalized,
                  };
                });
              }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type NotesSectionProps = {
  notes: string | null | undefined;
  setForm: React.Dispatch<React.SetStateAction<CreateTravelPlanRequest>>;
};

function NotesSection({ notes, setForm }: NotesSectionProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 mb-2">NOTES</div>
      <textarea
        value={notes ?? ''}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="e.g. Anniversary trip — need aisle seats, vegetarian meals, airport lounge access..."
      />
    </div>
  );
}

type ModalActionsProps = {
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

function ModalActions({ saving, onClose, onSubmit }: ModalActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        onClick={onClose}
        type="button"
        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-semibold"
        disabled={saving}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        type="button"
        className="px-4 py-2 rounded-md text-white text-sm font-semibold"
        style={{ backgroundColor: '#1E3A8A', opacity: saving ? 0.8 : 1 }}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Trip Plan'}
      </button>
    </div>
  );
}

export default function PlanNewTripModal({
  isOpen,
  onClose,
  form,
  setForm,
  saving,
  addFlightLeg,
  updateFlight,
  adjustCount,
  onSubmit,
}: PlanNewTripModalProps) {
  const isMultiCity = (form.flights?.length ?? 0) > 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan a New Trip"
      subtitle="Save now — book whenever you're ready"
      headerClassName="border-b-0 py-4"
      headerStyle={{ backgroundColor: '#1E3A8A' }}
      titleClassName="text-white"
      subtitleClassName="text-white/80 text-xs"
      closeButtonClassName="text-white/80 hover:text-white"
    >
      <div className="space-y-6">
        <FlightLegsSection isMultiCity={isMultiCity} flights={form.flights} addFlightLeg={addFlightLeg} updateFlight={updateFlight} />
        <DateRangeSection isMultiCity={isMultiCity} fromDate={form.fromDate} toDate={form.toDate} setForm={setForm} />
        <TripInfoSection form={form} setForm={setForm} adjustCount={adjustCount} />
        <BudgetSection form={form} setForm={setForm} />
        <NotesSection notes={form.notes} setForm={setForm} />
        <ModalActions saving={saving} onClose={onClose} onSubmit={onSubmit} />
      </div>
    </Modal>
  );
}
