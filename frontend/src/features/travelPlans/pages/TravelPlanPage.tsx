import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, Pencil, Plane, Trash2, Users } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import PlanNewTripModal from '../../../components/PlanNewTripModal';
import { travelPlanService } from '../services/travelPlanService';
import type { CreateTravelPlanRequest, TripType, TravelPlan } from '../types/travelPlanTypes';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatLegDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount: unknown, currency: unknown) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';

  const code = String(currency ?? '').trim();
  if (!code) return n.toLocaleString();

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${code} ${n.toLocaleString()}`;
  }
};

const normalizeTripType = (value: string): TripType | null => {
  const v = value?.toLowerCase?.() ?? '';
  if (v === 'multicity' || v === 'multi-city' || v === 'multi_city') return 'MultiCity';
  if (v === 'return' || v === 'roundtrip' || v === 'round-trip') return 'Return';
  if (v === 'oneway' || v === 'one-way' || v === 'one_way') return 'OneWay';
  return null;
};

const makeEmptyForm = (): CreateTravelPlanRequest => ({
  tripName: '',
  tripType: 'OneWay',
  cabinClass: 'Economy',
  preferredAirline: '',
  adults: 1,
  children: 0,
  infants: 0,
  fromDate: '',
  toDate: '',
  budgetType: 'Maximum',
  currency: 'USD',
  maxBudget: 0,
  notes: '',
  flights: [
    { flightOrder: 1, departureAirport: '', arrivalAirport: '', fromDate: '' },
  ],
});

const inferTripType = (form: Pick<CreateTravelPlanRequest, 'flights' | 'toDate'>): TripType => {
  const legs = Array.isArray(form.flights) ? form.flights : [];
  if (legs.length > 1) return 'MultiCity';
  const toDate = String(form.toDate ?? '').trim();
  if (toDate) return 'Return';
  return 'OneWay';
};

export default function TravelPlanPage() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [plans, setPlans] = React.useState<TravelPlan[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<CreateTravelPlanRequest>(() => makeEmptyForm());
  const [editingPlanId, setEditingPlanId] = React.useState<number | null>(null);

  const toDateInputValue = (iso: string | null | undefined) => {
    if (!iso) return '';
    // Supports both 'YYYY-MM-DD' and full ISO timestamps.
    if (typeof iso === 'string' && iso.length >= 10) return iso.slice(0, 10);
    return '';
  };

  const planToForm = (plan: TravelPlan): CreateTravelPlanRequest => ({
    tripName: plan.tripName ?? '',
    tripType: plan.tripType ?? 'MultiCity',
    cabinClass: plan.cabinClass ?? 'Economy',
    preferredAirline: plan.preferredAirline ?? '',
    adults: Number.isFinite(Number(plan.adults)) ? Number(plan.adults) : 1,
    children: Number.isFinite(Number(plan.children)) ? Number(plan.children) : 0,
    infants: Number.isFinite(Number(plan.infants)) ? Number(plan.infants) : 0,
    fromDate: toDateInputValue(plan.fromDate),
    toDate: toDateInputValue(plan.toDate),
    budgetType: plan.budgetType ?? 'Maximum',
    currency: plan.currency ?? 'USD',
    maxBudget: Number.isFinite(Number(plan.maxBudget)) ? Number(plan.maxBudget) : 0,
    notes: plan.notes ?? '',
    flights: Array.isArray(plan.flights) && plan.flights.length
      ? plan.flights
          .slice()
          .sort((a, b) => (a.flightOrder ?? 0) - (b.flightOrder ?? 0))
          .map((f, idx) => ({
            flightOrder: idx + 1,
            departureAirport: f.departureAirport ?? '',
            arrivalAirport: f.arrivalAirport ?? '',
            fromDate: toDateInputValue(f.fromDate),
          }))
      : [{ flightOrder: 1, departureAirport: '', arrivalAirport: '', fromDate: '' }],
  });

  const loadPlans = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await travelPlanService.getAll();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to load travel plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  React.useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const openModal = () => {
    setForm(makeEmptyForm());
    setEditingPlanId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: TravelPlan) => {
    setForm(planToForm(plan));
    setEditingPlanId(plan.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingPlanId(null);
  };

  const updateFlight = (index: number, patch: Partial<CreateTravelPlanRequest['flights'][number]>) => {
    setForm((prev) => {
      const flights = prev.flights.map((f, i) => (i === index ? { ...f, ...patch } : f));
      return { ...prev, flights };
    });
  };

  const addFlightLeg = () => {
    setForm((prev) => {
      const flights = [
        ...prev.flights,
        { flightOrder: prev.flights.length + 1, departureAirport: '', arrivalAirport: '', fromDate: '' },
      ];
      return { ...prev, flights };
    });
  };

  const adjustCount = (field: 'adults' | 'children' | 'infants', delta: number, min: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: Math.max(min, (prev[field] ?? 0) + delta),
    }));
  };

  const submit = async () => {
    if (!form.tripName.trim()) {
      showError('Trip name is required');
      return;
    }

    const inferredTripType = inferTripType(form);

    if (!form.flights.length || form.flights.some(f => !f.departureAirport.trim() || !f.arrivalAirport.trim())) {
      showError('Please fill all flight legs (departure and arrival)');
      return;
    }

    if (inferredTripType === 'MultiCity') {
      if (form.flights.some((f) => !String(f.fromDate ?? '').trim())) {
        showError('Please select a From date for every flight leg');
        return;
      }
    } else {
      if (!String(form.fromDate ?? '').trim()) {
        showError('Please select a From date');
        return;
      }

      if (inferredTripType === 'Return' && !String(form.toDate ?? '').trim()) {
        showError('Please select a date range');
        return;
      }
    }

    setSaving(true);
    try {
      let payloadFromDate = form.fromDate;
      let payloadToDate = form.toDate;

      if (inferredTripType === 'OneWay') {
        payloadToDate = payloadFromDate;
      }

      if (inferredTripType === 'MultiCity') {
        const legDates = form.flights
          .map((f) => String(f.fromDate ?? '').trim())
          .filter(Boolean)
          .sort();

        payloadFromDate = legDates[0] ?? form.fromDate;
        payloadToDate = legDates[legDates.length - 1] ?? payloadFromDate;
      }

      const payload: CreateTravelPlanRequest = {
        ...form,
        tripType: inferredTripType,
        fromDate: payloadFromDate,
        toDate: payloadToDate,
        preferredAirline: form.preferredAirline?.trim() ? form.preferredAirline.trim() : null,
        notes: form.notes?.trim() ? form.notes.trim() : null,
        flights: form.flights.map((f, idx) => ({
          ...f,
          flightOrder: idx + 1,
          departureAirport: f.departureAirport.trim(),
          arrivalAirport: f.arrivalAirport.trim(),
          fromDate: String(f.fromDate ?? '').trim() ? String(f.fromDate).trim() : null,
        })),
      };

      if (editingPlanId != null) {
        await travelPlanService.update(editingPlanId, payload);
        showSuccess('Travel plan updated');
      } else {
        await travelPlanService.create(payload);
        showSuccess('Travel plan saved');
      }

      setIsModalOpen(false);
      setEditingPlanId(null);
      await loadPlans();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to save travel plan');
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: number) => {
    const ok = window.confirm('Delete this travel plan?');
    if (!ok) return;

    try {
      await travelPlanService.delete(id);
      showSuccess('Travel plan deleted');
      await loadPlans();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to delete travel plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Travel Plan</h1>
          <p className="text-sm text-gray-500">Plan now, book whenever you're ready — your travel stays saved.</p>
        </div>

        <button
          onClick={openModal}
          className="px-4 py-2 rounded-md text-white text-sm font-semibold"
          style={{ backgroundColor: '#1E3A8A' }}
        >
          + Plan New Trip
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-gray-600">Loading travel plans...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const type = normalizeTripType(String(plan.tripType)) ?? 'MultiCity';
              const legs = Array.isArray(plan.flights) ? plan.flights : [];
              const preferredAirline = plan.preferredAirline?.trim?.() || '';
              const notesText = plan.notes?.trim?.() || '';
              const maxBudget = Number(plan.maxBudget);
              const budgetValue = Number.isFinite(maxBudget) && maxBudget > 0
                ? `${plan.budgetType ? String(plan.budgetType).toUpperCase() + ' • ' : ''}${formatCurrency(maxBudget, plan.currency)}`
                : '';
              const paxCount = [plan.adults, plan.children, plan.infants]
                .map((v) => {
                  const n = Number(v);
                  return Number.isFinite(n) ? n : 0;
                })
                .reduce((sum, n) => sum + n, 0);

              return (
                <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#F19A36]">{type === 'MultiCity' ? 'MULTI-CITY' : type.toUpperCase()}</div>
                      <div className="text-lg font-bold" style={{ color: '#1E3A8A' }}>
                        {plan.tripName}
                      </div>
                      {!!plan.createdAt && (
                        <div className="text-xs text-gray-500 mt-0.5">Saved {formatDate(plan.createdAt)}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(plan)}
                        type="button"
                        className="w-9 h-9 rounded-md border border-gray-200 flex items-center justify-center text-gray-700"
                        aria-label="Edit travel plan"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        type="button"
                        className="w-9 h-9 rounded-md border border-gray-200 flex items-center justify-center text-gray-700"
                        aria-label="Delete travel plan"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 flex-1">
                    <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 space-y-2">
                      {legs.length > 0 ? (
                        legs.map((leg, idx) => {
                          const legDate = String(leg.fromDate ?? '').trim() || String(plan.fromDate ?? '').trim();
                          return (
                            <div key={idx} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-white border border-blue-200 flex items-center justify-center text-[10px] font-bold shrink-0" style={{ color: '#1E3A8A' }}>
                                  {idx + 1}
                                </div>
                                <div className="text-sm font-semibold truncate" style={{ color: '#1E3A8A' }}>
                                  {leg.departureAirport || '—'} <span className="text-gray-400">→</span> {leg.arrivalAirport || '—'}
                                </div>
                              </div>

                              <div className="text-xs text-gray-500 whitespace-nowrap">
                                {legDate ? formatLegDate(legDate) : '—'}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-gray-500">No flight legs</div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">{formatDate(plan.fromDate)} – {formatDate(plan.toDate)}</div>

                    {(!!notesText || !!budgetValue) && (
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        {!!notesText && (
                          <div>
                            <div className="text-[10px] font-semibold text-gray-500">NOTES</div>
                            <div className="text-[10px] text-gray-700 whitespace-pre-wrap">{notesText}</div>
                          </div>
                        )}
                        {!!budgetValue && (
                          <div>
                            <div className="text-[10px] font-semibold text-gray-500">BUDGET</div>
                            <div className="text-[10px] text-gray-700 whitespace-pre-wrap">{budgetValue}</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 font-semibold text-[#1E3A8A] whitespace-nowrap">
                          <Users size={10} className="text-[#1E3A8A]" />
                          <span>{paxCount} Pax</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-[#1E3A8A] whitespace-nowrap">
                          <Armchair size={10} className="text-[#1E3A8A]" />
                          <span>{plan.cabinClass || '—'}</span>
                        </div>
                        {!!preferredAirline && (
                          <div className="flex items-center gap-1 font-semibold text-[#1E3A8A] max-w-[150px] min-w-0" title={preferredAirline}>
                            <Plane size={10} className="text-[#1E3A8A] shrink-0" />
                            <span className="truncate whitespace-nowrap">
                              {preferredAirline}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          navigate('/flight-search-customer', {
                            state: {
                              travelPlanPrefill: {
                                travelPlanId: plan.id,
                                tripType: plan.tripType,
                                cabinClass: plan.cabinClass,
                                adults: plan.adults,
                                children: plan.children,
                                infants: plan.infants,
                                fromDate: plan.fromDate,
                                toDate: plan.toDate,
                                flights: (plan.flights ?? []).map((f) => ({
                                  departureAirport: f.departureAirport,
                                  arrivalAirport: f.arrivalAirport,
                                  fromDate: f.fromDate,
                                })),
                              },
                            },
                          })
                        }
                        className="px-3 py-1.5 rounded-md text-white text-xs font-semibold shrink-0"
                        style={{ backgroundColor: '#1E3A8A' }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {plans.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center">
              <div className="text-gray-700 font-semibold">No travel plans yet</div>
              <div className="text-sm text-gray-500 mt-1">Click “Plan New Trip” to create your first plan.</div>
            </div>
          )}
        </>
      )}

      <PlanNewTripModal
        isOpen={isModalOpen}
        onClose={closeModal}
        form={form}
        setForm={setForm}
        saving={saving}
        addFlightLeg={addFlightLeg}
        updateFlight={updateFlight}
        adjustCount={adjustCount}
        onSubmit={submit}
      />
    </div>
  );
}
