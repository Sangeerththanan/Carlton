import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Search, Star, ChevronRight } from 'lucide-react';
import { leisurePackagesApi, type FeaturedPackage } from './services/leisurePackagesApi';

const poppins: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };

/* ─── Helper Components ─────────────────────────────────────── */

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={13}
                    strokeWidth={1.6}
                    className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                />
            ))}
            <span className="text-[11px] text-gray-400 ml-1">({reviews} reviews)</span>
        </div>
    );
}

function CategoryBadge({ label }: { label: string }) {
    return (
        <span
            className="text-xs font-semibold text-white px-3 py-1 rounded-full shadow"
            style={{ background: 'linear-gradient(135deg, #D4A22A 0%, #E8C249 100%)' }}
        >
            {label}
        </span>
    );
}

function PlanCard({ plan }: { plan: FeaturedPackage }) {
    const navigate = useNavigate();
    const reviewsCount = plan.reviews?.length ? plan.reviews.length * 42 : 151; // mock review count based on reviews array length
    const highestTierPrice = plan.tiers?.length ? Math.min(...plan.tiers.map(t => t.price)) : Number(plan.price);

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
            onClick={() => navigate(`/leisure-plan/${plan.id}`)}
        >
            {/* Image */}
            <div className="relative h-44 shrink-0">
                <img
                    src={plan.image || ''}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                    <CategoryBadge label={plan.badge || 'Package'} />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-grow">
                <StarRating rating={5} reviews={reviewsCount} />
                <h3 className="font-bold text-[#1a2b6b] text-sm mt-1 leading-snug">
                    {plan.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {plan.destination}&nbsp;·&nbsp;{plan.nights}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {plan.subtitle}
                </p>

                <div className="border-t border-gray-100 mt-auto pt-3 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-gray-400">From</p>
                        <p className="text-base font-bold text-[#1a2b6b]">
                            $ {highestTierPrice.toLocaleString()}
                        </p>
                    </div>
                    <button
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leisure-plan/${plan.id}`);
                        }}
                    >
                        <ChevronRight size={16} className="text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────── */

export default function LeisurePackages() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<'Most Popular' | 'Early Bird Deals'>('Most Popular');
    const [search, setSearch] = useState('');
    const [packages, setPackages] = useState<FeaturedPackage[]>([]);
    const [loading, setLoading] = useState(true);

    const filters: Array<'Most Popular' | 'Early Bird Deals'> = [
        'Most Popular',
        'Early Bird Deals',
    ];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data = await leisurePackagesApi.getPackages();
                setPackages(data);
            } catch (error) {
                console.error("Failed to fetch packages", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50" style={poppins}>
                {/* Page Heading */}
                <div className="mb-2">
                    <h1 className="text-3xl font-extrabold text-[#1a2b6b]">Explore Packages</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Plan your journey, book automatically at the best price.
                    </p>
                </div>

                {/* Back */}
                <button
                    onClick={() => navigate('/leisure-plan')}
                    className="flex items-center gap-2 text-[#1a2b6b] font-semibold text-sm mb-5 mt-3 hover:opacity-80 transition-opacity"
                >
                    <div className="w-6 h-6 rounded-full bg-[#1a2b6b] flex items-center justify-center">
                        <ArrowLeft size={13} strokeWidth={2.5} className="text-white" />
                    </div>
                    Back
                </button>

                {/* Filters + Search row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                    <div className="flex gap-2">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`text-xs font-medium px-4 py-2 rounded-full border transition-all ${activeFilter === f
                                    ? 'bg-white border-gray-300 text-gray-800 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative ml-auto w-full sm:w-72">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Destinations ..."
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#e8d9b0] bg-[#fdf8ee] text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <Search
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                    </div>
                </div>

                {/* ── Featured Plan / Or Loading/Empty States ──────────────────────────────────── */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a2b6b]"></div>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-sm">No packages available at the moment.</p>
                    </div>
                ) : (
                    <>
                        {packages.length > 0 && (() => {
                            const featuredPlan = packages[0];
                            return (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row mb-8">
                                    {/* Image side */}
                                    <div className="relative lg:w-[55%] h-64 lg:h-auto">
                                        <img
                                            src={featuredPlan.image}
                                            alt={featuredPlan.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Overlay badges */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <CategoryBadge label={featuredPlan.badge || 'Featured'} />
                                            {featuredPlan.save && (
                                                <span className="text-xs font-semibold text-white px-3 py-1 rounded-full bg-rose-500 shadow">
                                                    {featuredPlan.save}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info side */}
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <StarRating rating={5} reviews={142} />
                                            <h2 className="text-xl font-bold text-[#1a2b6b] mt-2">
                                                {featuredPlan.title}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {featuredPlan.destination}&nbsp;·&nbsp;{featuredPlan.nights}
                                            </p>
                                            <p className="text-sm text-gray-500 leading-relaxed mt-2 line-clamp-3">
                                                {featuredPlan.subtitle}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {(featuredPlan.tags?.length ? featuredPlan.tags : ['Popular', 'Limited Availability']).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price + CTA */}
                                        <div>
                                            <div className="border-t border-gray-100 mt-5 pt-4 flex items-end justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Price starts from</p>
                                                    <div className="flex items-end gap-2">
                                                        {featuredPlan.wasPrice && (
                                                            <p className="text-sm text-gray-400 line-through mb-[2px]">
                                                                ${featuredPlan.wasPrice}
                                                            </p>
                                                        )}
                                                        <p className="text-2xl font-bold text-[#1a2b6b]">
                                                            ${featuredPlan.price}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-normal text-gray-400">
                                                        {featuredPlan.perLabel || '/Per person'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-rose-500 font-semibold mb-2">
                                                        Available Now
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/leisure-plan/${featuredPlan.id}`)}
                                                        className="flex items-center gap-1 text-sm font-semibold text-[#1a2b6b] border border-[#1a2b6b] px-4 py-2 rounded-lg hover:bg-[#1a2b6b] hover:text-white transition-colors"
                                                    >
                                                        View Details
                                                        <ChevronRight size={15} strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ── All Plans ─────────────────────────────────────── */}
                        {packages.length > 1 && (
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-[#1a2b6b] mb-4">More Plans</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {packages.slice(1).map((plan) => (
                                        <PlanCard key={plan.id} plan={plan} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
