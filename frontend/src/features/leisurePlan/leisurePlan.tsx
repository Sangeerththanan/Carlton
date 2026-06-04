import { DashboardLayout } from '@/components/DashboardLayout';
import { Calendar, Shield, Clock, CheckCircle2, Eye, Pencil, X, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LeisurePlan as LeisurePlanType, LeisurePlanStats, FeaturedPackage } from './services/leisurePlanApi';
import { leisurePlanService } from './services/leisurePlanApi';
import LeisurePlanViewModal from './LeisurePlanViewModal';
import RecreatePlanModal from './RecreatePlanModal';
import { useToast } from '../../contexts/ToastContext';

const poppins: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

// Stats and bookings will be fetched from API


type TabType = 'Confirmed' | 'Pending' | 'Past' | 'Cancelled';

// Using LeisurePlanType from API service

interface BookingCardProps {
  booking: LeisurePlanType;
  isPast?: boolean;
  isCancelled?: boolean;
  isPending?: boolean;
  onCancel?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (booking: LeisurePlanType) => void;
  onEdit?: (booking: LeisurePlanType) => void;
  onRecreate?: (booking: LeisurePlanType) => void;
}

function BookingCard({ booking, isPast = false, isCancelled = false, isPending = false, onCancel, onDelete, onView, onEdit, onRecreate }: BookingCardProps) {
  const isOverBudget = booking.estimatedCost > booking.budget;
  const progressPct = Math.min((booking.estimatedCost / booking.budget) * 100, 100);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={poppins}>
      {/* Card Header */}
      <div
        className="px-6 py-4 flex items-start justify-between"
        style={{ background: '#1a2b6b' }}
      >
        <div>
          <h3 className="text-white font-bold text-lg">{booking.title}</h3>
          <p className="text-blue-300 text-xs mt-0.5">{booking.planType}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white bg-white/20 px-3 py-1 rounded-full font-medium">
            {booking.tier}
          </span>

          {/* Status badge */}
          {isCancelled ? (
            <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/10 px-3 py-1 rounded-full font-medium border border-white/20">
              Cancelled
            </span>
          ) : booking.status === 'Pending' ? (
            <span className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-900/40 px-3 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Saved / Pending
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-green-300 bg-green-900/40 px-3 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Confirmed
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="bg-white px-6 py-5">
        {/* Info Row */}
        <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">From</p>
            <p className="text-sm font-semibold text-[#1a2b6b]">{booking.departureAirport || 'London (LHR)'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Destinations</p>
            <p className="text-sm font-semibold text-[#1a2b6b]">{booking.destinations}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Date Range</p>
            <p className="text-sm font-semibold text-[#1a2b6b]">{booking.dateRange}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Passengers</p>
            <p className="text-sm font-semibold text-[#1a2b6b]">{booking.passengers}</p>
          </div>


        </div>

        {/* Legs */}
        <div className="flex items-center gap-2 py-3 border-b border-gray-100">
          {booking.legs.map((leg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                <span>{leg.flag}</span>
                <span className="font-medium">{leg.city}</span>
                <span className="text-gray-400">· {leg.days}</span>
              </span>
              {i < booking.legs.length - 1 && (
                <span className="text-gray-300 text-xs">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Activities */}
        <div className="flex items-center gap-2 py-3 border-b border-gray-100">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1">Activities:</span>
          {booking.activities.map((act) => (
            <span
              key={act}
              className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full"
            >
              {act}
            </span>
          ))}
        </div>

        {/* Budget */}
        <div className="mt-4 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-500">Estimated Cost</p>
              <p className="text-xl font-bold text-[#1a2b6b]">
                £{booking.estimatedCost.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Your Budget</p>
              <p className="text-sm font-semibold text-gray-700">
                £{booking.budget.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: isCancelled ? '#1a2b6b' : isOverBudget ? '#e24b4a' : '#1a2b6b',
              }}
            />
          </div>

          {/* Cancellation note OR budget status */}
          {isCancelled ? (
            <p className="text-xs mt-2 font-medium text-center text-[#1a2b6b]">
              Plan cancelled by user on {booking.cancelledOn}
            </p>
          ) : (
            <p
              className={`text-xs mt-2 font-medium text-center ${isOverBudget ? 'text-red-500' : 'text-green-600'
                }`}
            >
              {isOverBudget
                ? `£${(booking.estimatedCost - booking.budget).toLocaleString()} over budget`
                : `✓ Within Budget — £${(booking.budget - booking.estimatedCost).toLocaleString()} remaining`}
            </p>
          )}
        </div>

        {isCancelled && (
          <div className="border-t border-dashed border-gray-200 mt-4" />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            {isPending ? (
              <><Clock size={14} strokeWidth={1.8} className="text-amber-500" /> Saved — awaiting payment</>
            ) : (
              <><CheckCircle2 size={14} strokeWidth={1.8} className="text-green-500" /> Confirmed on {booking.confirmedOn}</>
            )}
          </span>

          <div className="flex gap-2">
            {isCancelled ? (
              // Cancelled card actions
              <>
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-5 py-2 rounded-lg"
                  style={{ background: '#1a2b6b' }}
                  onClick={() => onRecreate?.(booking)}
                >
                  <RefreshCw size={13} strokeWidth={2} />
                  Recreate Plan
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-red-500"
                  onClick={() => onDelete?.(booking.id)}
                >
                  <X size={13} strokeWidth={2.2} />
                  Delete
                </button>
              </>
            ) : isPending ? (
              // Pending card actions — view/edit/book now/delete
              <>
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg"
                  style={{ background: '#1a2b6b' }}
                  onClick={() => onView?.(booking)}
                >
                  <Eye size={14} strokeWidth={1.8} />
                  View Plan
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-[#1a2b6b] px-4 py-2 rounded-lg bg-[#f2ae66] font-bold"
                  onClick={() => onView?.(booking)}
                >
                  Book Now
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg"
                  style={{ background: '#2d4a9e' }}
                  onClick={() => onEdit?.(booking)}
                >
                  <Pencil size={14} strokeWidth={1.8} />
                  Edit
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg bg-red-500"
                  onClick={() => onDelete?.(booking.id)}
                >
                  <X size={14} strokeWidth={1.8} />
                  Delete
                </button>
              </>
            ) : (
              <>
                {/* View Plan */}
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg"
                  style={{ background: '#1a2b6b' }}
                  onClick={() => onView?.(booking)}
                >
                  <Eye size={14} strokeWidth={1.8} />
                  View Plan
                </button>

                {/* Edit & Cancel */}
                {!isPast && (
                  <>
                    <button
                      className="flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg"
                      style={{ background: '#2d4a9e' }}
                      onClick={() => onEdit?.(booking)}
                    >
                      <Pencil size={14} strokeWidth={1.8} />
                      Edit
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-xs font-medium text-white px-4 py-2 rounded-lg bg-red-500"
                      onClick={() => onCancel?.(booking.id)}
                    >
                      <X size={14} strokeWidth={1.8} />
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeisurePlan() {
  const [activeTab, setActiveTab] = useState<TabType>('Confirmed');
  const [statsData, setStatsData] = useState<LeisurePlanStats | null>(null);
  const [bookings, setBookings] = useState<LeisurePlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredPackages, setFeaturedPackages] = useState<FeaturedPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRecreateModalOpen, setIsRecreateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LeisurePlanType | null>(null);
  const [selectedPlanForRecreate, setSelectedPlanForRecreate] = useState<LeisurePlanType | null>(null);

  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      const data = await leisurePlanService.getStats();
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leisurePlanService.getPlans(activeTab);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchFeaturedPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const data = await leisurePlanService.getFeaturedPackages();
      setFeaturedPackages(data);
    } catch (error) {
      console.error('Error fetching featured packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchFeaturedPackages();
  }, [fetchStats, fetchFeaturedPackages]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: number) => {
    try {
      await leisurePlanService.cancelPlan(id, 'Cancelled by user');
      fetchStats();
      fetchBookings();
      showSuccess('Your plan has been cancelled. A refund will be provided shortly.');
    } catch (error) {
      console.error('Error cancelling plan:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await leisurePlanService.deletePlan(id);
      fetchStats();
      fetchBookings();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleView = (plan: LeisurePlanType) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleRecreate = (plan: LeisurePlanType) => {
    setSelectedPlanForRecreate(plan);
    setIsRecreateModalOpen(true);
  };

  const handleEdit = (plan: LeisurePlanType) => {
    navigate('/leisure-plan/result', {
      state: {
        plan,
        isEditing: true,
        planId: plan.id
      }
    });
  };

  const stats = [
    { icon: <Calendar size={22} strokeWidth={1.6} />, value: statsData?.totalPlans.toString() || '0', label: 'Total Plans' },
    { icon: <CheckCircle2 size={22} strokeWidth={1.6} />, value: statsData?.booked.toString() || '0', label: 'Booked' },
    { icon: <Shield size={22} strokeWidth={1.6} />, value: statsData?.totalSaved.toLocaleString() || '0', label: 'Total Saved' },
    { icon: <Clock size={22} strokeWidth={1.6} />, value: statsData?.pendingBookings.toString() || '0', label: 'Pending Bookings' },
  ];

  // Each tab count comes from the stats, so they are always correct regardless of active tab
  const tabCounts: Record<TabType, number> = {
    Confirmed: statsData?.booked ?? 0,
    Pending: statsData?.pendingBookings ?? 0,
    Past: statsData?.pastPlans ?? 0,
    Cancelled: statsData?.cancelledPlans ?? 0,
  };

  // Re-fetch tab counts if needed or just use current tab length for simplified view
  // For a better UX, we could have a getCounts API

  return (

    <DashboardLayout>
      <div className="flex min-h-screen bg-gray-50" style={poppins}>
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1a2b6b]">Leisure Plan</h1>
            <p className="text-gray-500 text-sm mt-1">
              Plan your journey, book automatically at the best price.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-5 text-white flex flex-col gap-2"
                style={{ background: 'linear-gradient(135deg, #1a2b6b 0%, #2d4a9e 100%)' }}
              >
                <div className="flex items-center justify-between">
                  <span>{stat.icon}</span>
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <span className="text-sm text-blue-200">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Add New Button */}
          <div className="flex justify-end mb-6">
            <button
              className="px-6 py-2.5 rounded-lg text-white font-medium text-sm"
              style={{ background: '#1a2b6b' }}
              onClick={() => navigate('/leisure-plan/create')}
            >
              Add New
            </button>
          </div>

          {/* Featured Packages — fetched dynamically from backend */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1a2b6b]">Featured Packages</h2>
              <button
                className="text-amber-600 font-medium text-sm hover:underline"
                onClick={() => navigate('/leisure-plan/packages')}
              >
                View All →
              </button>
            </div>

            {loadingPackages ? (
              /* Loading skeleton */
              <div className="grid grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((d) => <div key={d} className="h-8 bg-gray-100 rounded" />)}
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((t) => <div key={t} className="h-5 w-16 bg-gray-100 rounded-full" />)}
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="h-3 w-20 bg-gray-100 rounded" />
                          <div className="h-6 w-24 bg-gray-200 rounded" />
                        </div>
                        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredPackages.length === 0 ? (
              /* Empty state */
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">No featured packages available at the moment.</p>
                <p className="text-gray-300 text-xs mt-1">Check back soon for exciting deals!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {featuredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/leisure-plan/${pkg.id}`)}
                  >
                    <div className="relative h-44">
                      {pkg.image ? (
                        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {pkg.destination && (
                        <span
                          className="absolute top-3 left-3 text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(26,43,107,0.85)' }}
                        >
                          {pkg.destination}
                        </span>
                      )}
                      {pkg.badge && (
                        <span
                          className="absolute top-3 right-3 text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                          style={{ background: pkg.badgeColor || '#1a2b6b' }}
                        >
                          {pkg.badge}
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <span className="text-white text-lg font-bold drop-shadow">{pkg.title}</span>
                        {pkg.nights && (
                          <span className="text-xs text-white bg-black/40 px-2 py-0.5 rounded-full">
                            {pkg.nights}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      {pkg.details && pkg.details.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {pkg.details.map((d, i) => (
                            <div key={i} className="text-center">
                              <div className="text-xs font-semibold text-[#1a2b6b]">{d.value}</div>
                              <div className="text-[10px] text-gray-400">{d.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {pkg.tags && pkg.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {pkg.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-end justify-between mt-3">
                        <div>
                          {pkg.wasPrice && (
                            <p className="text-[11px] text-gray-400 line-through">{pkg.wasPrice}</p>
                          )}
                          {pkg.price && (
                            <p className="text-lg font-bold text-[#1a2b6b]">
                              {pkg.price}
                              {pkg.perLabel && (
                                <span className="text-xs font-normal text-gray-500 ml-1">{pkg.perLabel}</span>
                              )}
                            </p>
                          )}
                          {pkg.save && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              {pkg.save}
                            </span>
                          )}
                        </div>
                        <button
                          className="text-xs text-white font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
                          style={{ background: '#1a2b6b' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/leisure-plan/${pkg.id}`); }}
                        >
                          Book Now →
                        </button>
                      </div>

                      <button
                        className="text-[11px] text-gray-400 mt-2 hover:underline"
                        onClick={(e) => { e.stopPropagation(); navigate(`/leisure-plan/${pkg.id}`); }}
                      >
                        Read more
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              {(['Confirmed', 'Pending', 'Past', 'Cancelled'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab
                    ? 'border-[#1a2b6b] text-[#1a2b6b]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab
                      ? tab === 'Cancelled'
                        ? 'bg-[#1a2b6b] text-white'
                        : 'bg-[#1a2b6b] text-white'
                      : 'bg-gray-100 text-gray-500'
                      }`}
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2b6b]"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No {activeTab.toLowerCase()} plans found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isPast={activeTab === 'Past'}
                  isCancelled={activeTab === 'Cancelled'}
                  isPending={activeTab === 'Pending'}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onView={handleView}
                  onEdit={handleEdit}
                  onRecreate={handleRecreate}
                />
              ))}
            </div>
          )}

          <LeisurePlanViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            plan={selectedPlan}
          />

          <RecreatePlanModal
            isOpen={isRecreateModalOpen}
            onClose={() => setIsRecreateModalOpen(false)}
            plan={selectedPlanForRecreate}
          />
        </main >
      </div >
    </DashboardLayout >
  );
}