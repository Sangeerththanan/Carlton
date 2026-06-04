import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Clock, MapPin, Users, Star } from 'lucide-react';
import { leisurePackagesApi, type FeaturedPackage } from './services/leisurePackagesApi';

const poppins: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };


/*  Star Component  */
function Stars({ count }: { count: number }) {
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={14}
                    fill={i <= count ? '#F5B800' : 'none'}
                    stroke={i <= count ? '#F5B800' : '#ccc'}
                />
            ))}
        </span>
    );
}

/*  Main Component  */
export default function LeisurePlanDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<FeaturedPackage | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedTier, setSelectedTier] = useState(0);
    // Date starts empty — user selects their travel date, no hardcoded default
    const [date, setDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    React.useEffect(() => {
        const fetchPlan = async () => {
            if (!id || isNaN(Number(id))) {
                setLoading(false);
                return;
            }
            try {
                const fetchedPlan = await leisurePackagesApi.getPackage(Number(id));
                setPlan(fetchedPlan);
            } catch (error) {
                console.error('Error fetching plan:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-screen bg-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b6b]"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!plan) {
        return (
            <DashboardLayout>
                <div className="flex flex-col justify-center items-center h-screen bg-white gap-3" style={poppins}>
                    <p className="text-[#1a2b6b] font-semibold text-lg">Package not found</p>
                    <button
                        onClick={() => navigate('/leisure-plan/packages')}
                        className="text-sm text-white bg-[#1a2b6b] px-5 py-2 rounded-lg hover:opacity-90"
                    >
                        Browse Packages
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const totalGuests = adults + children + infants;
    const totalCost = plan.estimatedCost || 0;

    // All display values come from API — no hardcoded fallbacks
    const displaySubtitle = plan.subtitle || '';
    const displayHero = plan.image || '';
    const displayDuration = plan.nights || 'Variable';
    const displayLocation = plan.destination || '';
    const displayPassengers = `${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`;

    // Derive average rating from reviews returned by API — no hardcoded value
    const avgRating = plan.reviews && plan.reviews.length > 0
        ? Math.round((plan.reviews.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / plan.reviews.length) * 10) / 10
        : null;

    const flattenedItinerary: { day: string; title: string; desc: string }[] = plan.itinerary ?? [];
    // Only show 'What's Included' section if the API returned data
    const displayIncluded: { title: string; desc: string }[] = plan.whatsIncluded ?? [];
    // Only show tiers if the API returned them
    const displayTiers: { name: string; price: number; desc: string; isPopular: boolean }[] = plan.tiers ?? [];

    return (
        <DashboardLayout>
            <div style={poppins} className="min-h-screen bg-white">

                {/* Back Nav */}
                <div className="px-6 pt-4 pb-2">
                    <button
                        onClick={() => navigate('/leisure-plan')}
                        className="flex items-center gap-2 text-2xl font-extrabold text-[#1a2b6b] hover:opacity-70 transition-opacity font-poppins"
                    >
                        <ArrowLeft size={28} strokeWidth={2.2} />
                        Explore All Packages
                    </button>
                </div>
                <br></br>

                {/* Hero */}
                <div className="relative mx-6 rounded-2xl overflow-hidden h-72 bg-gray-200">
                    {displayHero ? (
                        <img src={displayHero} alt={plan.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-sm">No image available</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8">
                        <h1 className="text-white text-3xl font-bold drop-shadow-md">{plan.title}</h1>
                        {displaySubtitle && <p className="text-gray-200 text-sm mt-1 max-w-2xl">{displaySubtitle}</p>}
                    </div>
                </div>

                {/* Info Bar */}
                <br></br>
                <div
                    className="mx-6 rounded-xl px-8 py-5 mt-[-1px]"
                    style={{ background: '#FDF3DC' }}
                >
                    <div className="flex items-center justify-between w-full">
                        {/* Duration */}
                        <div className="flex flex-1 items-center justify-center gap-3">
                            <Clock size={22} strokeWidth={1.6} className="text-[#1a2b6b] flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-[#1a2b6b] font-semibold uppercase tracking-wide">Duration</p>
                                <p className="text-sm font-bold text-[#1a2b6b]">{displayDuration}</p>
                                <p className="text-xs text-[#1a2b6b]">Select Dates</p>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-amber-300 flex-shrink-0" />
                        {/* Location */}
                        <div className="flex flex-1 items-center justify-center gap-3">
                            <MapPin size={22} strokeWidth={1.6} className="text-[#1a2b6b] flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-[#1a2b6b] font-semibold uppercase tracking-wide">Location</p>
                                <p className="text-sm font-bold text-[#1a2b6b]">{displayLocation}</p>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-amber-300 flex-shrink-0" />
                        {/* Traveler */}
                        <div className="flex flex-1 items-center justify-center gap-3">
                            <Users size={22} strokeWidth={1.6} className="text-[#1a2b6b] flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-[#1a2b6b] font-semibold uppercase tracking-wide">Travelers</p>
                                <p className="text-sm font-bold text-[#1a2b6b]">{displayPassengers}</p>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-amber-300 flex-shrink-0" />
                        {/* Rating — only shown if reviews exist */}
                        {avgRating !== null && (
                            <div className="flex flex-1 items-center justify-center gap-3">
                                <Star size={22} strokeWidth={1.6} fill="#F5B800" stroke="#F5B800" className="flex-shrink-0" />
                                <p className="text-sm font-bold text-[#1a2b6b]">{avgRating}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 mt-7 space-y-8 pb-12">

                    {/* Experience */}
                    <section>
                        <h2 className="text-lg font-bold text-[#1a2b6b] mb-2">Experience</h2>
                        <p className="text-gray-600 text-sm leading-relaxed">{plan.experience}</p>
                    </section>

                    {/* What's Included — only rendered when API returns data */}
                    {displayIncluded.length > 0 && (
                        <section>
                            <div className="border border-gray-200 rounded-xl p-5">
                                <h3 className="text-[#1a2b6b] font-semibold text-sm mb-4">What's included</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {displayIncluded.map((item, i) => (
                                        <div key={i} className="bg-[#FDF3DC] rounded-lg p-3">
                                            <p className="text-[#1a2b6b] font-semibold text-sm">{item.title}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Day by Day Itinerary */}
                    {flattenedItinerary.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-[#1a2b6b] mb-4">Day by day itinerary</h2>
                            <div className="space-y-5">
                                {flattenedItinerary.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                                                style={{ background: '#1a2b6b' }}
                                            />
                                            {i < flattenedItinerary.length - 1 && (
                                                <div className="w-px flex-1 mt-1" style={{ background: '#e5e7eb' }} />
                                            )}
                                        </div>
                                        <div className="pb-4 flex-1">
                                            <p className="font-bold text-[#1a2b6b] text-sm">{item.day}</p>
                                            <p className="font-semibold text-gray-800 text-sm mt-1">{item.title}</p>
                                            <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Choose Your Tier + Booking */}
                    <section>
                        <div className="border border-gray-200 rounded-xl p-5">
                            <h3 className="text-[#1a2b6b] font-semibold text-sm mb-4">Choose Your Tier</h3>
                            {displayTiers.length === 0 ? (
                                <p className="text-gray-400 text-xs mb-6">No pricing tiers available for this package.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {displayTiers.map((tier, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedTier(i)}
                                            className={`rounded-xl p-4 text-left border-2 transition-all ${selectedTier === i
                                                ? 'border-[#1a2b6b] bg-[#1a2b6b]/5'
                                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-[#1a2b6b] font-semibold text-sm">{tier.name}</p>
                                                {tier.isPopular && (
                                                    <span className="text-[10px] bg-[#1a2b6b] text-white px-2 py-0.5 rounded-full">
                                                        Most Popular
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#1a2b6b] font-bold text-lg">
                                                ${tier.price.toLocaleString()}
                                                <span className="text-xs font-normal text-gray-500 ml-1">/Person</span>
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">{tier.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Date + Guests + Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left: Date & Guests */}
                                <div className="space-y-4">
                                    {/* Select Date */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Select Date</p>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white">
                                            <Clock size={15} strokeWidth={1.6} className="text-gray-400" />
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="text-sm text-gray-700 bg-transparent outline-none flex-1"
                                                placeholder="Select travel date"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-gray-500">Guests</p>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {totalGuests} Total
                                            </span>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                                            {[
                                                { label: 'Adults', sublabel: '12+', count: adults, setter: setAdults, min: 1 },
                                                { label: 'Children', sublabel: 'Age 2-11', count: children, setter: setChildren, min: 0 },
                                                { label: 'Infants', sublabel: 'Under 2', count: infants, setter: setInfants, min: 0 },
                                            ].map((g) => (
                                                <div key={g.label} className="flex items-center justify-between px-4 py-2.5 bg-white">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{g.label}</p>
                                                        <p className="text-xs text-gray-400">{g.sublabel}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => g.setter(Math.max(g.min, g.count - 1))}
                                                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:bg-gray-50"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm font-semibold w-4 text-center">{g.count}</span>
                                                        <button
                                                            onClick={() => g.setter(g.count + 1)}
                                                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:bg-gray-50"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Price Summary */}
                                <div className="flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>7 days accommodation</span>
                                            <span className="font-semibold">
                                                {plan.accommodationCost === 0 ? 'Included' : `$${plan.accommodationCost.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Island Transfers</span>
                                            <span className="font-semibold">
                                                {plan.transfersCost === 0 ? 'Included' : `$${plan.transfersCost.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Editorial Service fee</span>
                                            <span className="font-semibold">
                                                {plan.serviceFee === 0 ? 'Included' : `$${plan.serviceFee.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                                            <span className="text-sm font-semibold text-[#1a2b6b]">
                                                Total for two ({totalGuests})
                                            </span>
                                            <span className="text-lg font-bold text-[#1a2b6b]">
                                                ${totalCost.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full mt-5 py-3 rounded-xl text-white text-sm font-bold tracking-wide transition-opacity hover:opacity-90"
                                        style={{ background: '#1a2b6b' }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Gallery + Reviews — only rendered if API returns data */}
                    {((plan.galleryImages && plan.galleryImages.length > 0) || (plan.reviews && plan.reviews.length > 0)) && (
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Gallery */}
                                {plan.galleryImages && plan.galleryImages.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-lg font-bold text-[#1a2b6b]">Gallery</h2>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {plan.galleryImages.map((src: string, i: number) => (
                                                <div key={i} className="rounded-xl overflow-hidden h-36">
                                                    <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reviews */}
                                {plan.reviews && plan.reviews.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-[#1a2b6b] mb-3">Reviews</h2>
                                        {plan.reviews.map((r: any, i: number) => (
                                            <div key={i} className="rounded-xl p-4" style={{ background: '#FDF3DC' }}>
                                                <Stars count={r.stars} />
                                                <p className="text-gray-700 text-xs mt-2 leading-relaxed">{r.text}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                        style={{ background: '#1a2b6b' }}
                                                    >
                                                        {r.name?.[0] ?? '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                                                        <p className="text-[10px] text-gray-400">{r.stayed}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
