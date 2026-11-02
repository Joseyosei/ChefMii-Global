'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
    Star,
    ShieldCheck,
    CheckCircle2,
    MessageSquare,
    Sparkles,
    ChefHat,
    Building2,
    Heart,
    Filter,
    Plus,
    X,
    Upload,
    Calendar,
    MapPin,
    ArrowUpRight
} from 'lucide-react'
import { ChefReview, INITIAL_REVIEWS, getAllReviews, saveNewReview } from '@/lib/reviews-store'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'

const CHEF_OPTIONS = [
    { id: 'marco-rossi', name: 'Chef Marco Rossi', cuisine: 'Italian Fine Dining', photo: '/images/chefs/chef_marco_rossi.png', dishPhoto: '/images/orders/order_italian_pasta.png' },
    { id: 'yuki-tanaka', name: 'Chef Yuki Tanaka', cuisine: 'Japanese Omakase', photo: '/images/chefs/chef_yuki_tanaka.png', dishPhoto: '/images/orders/order_japanese_sushi.png' },
    { id: 'pierre-dubois', name: 'Chef Pierre Dubois', cuisine: 'French Haute Cuisine', photo: '/images/chefs/chef_pierre_dubois.png', dishPhoto: '/images/orders/order_french_haute.png' },
    { id: 'aisha-okafor', name: 'Chef Aisha Okafor', cuisine: 'West African Gourmet', photo: '/images/chefs/chef_aisha_okafor.png', dishPhoto: '/images/orders/order_west_african_jollof.png' },
    { id: 'marcus-vance', name: 'Chef Marcus Vance', cuisine: 'American Contemporary BBQ', photo: '/images/chefs/chef_marcus_vance.png', dishPhoto: '/images/orders/order_american_bbq.png' },
    { id: 'sofia-mendez', name: 'Chef Sofía Mendez', cuisine: 'Spanish Tapas & Paella', photo: '/images/chefs/chef_sofia_mendez.png', dishPhoto: '/images/orders/order_spanish_paella.png' },
    { id: 'henrik-lindqvist', name: 'Chef Henrik Lindqvist', cuisine: 'New Nordic', photo: '/images/chefs/chef_henrik_lindqvist.png', dishPhoto: '/images/orders/order_nordic_salmon.png' },
    { id: 'wei-zhang', name: 'Chef Wei Zhang', cuisine: 'Cantonese & Sichuan', photo: '/images/chefs/chef_wei_zhang.png', dishPhoto: '/images/orders/order_chinese_dimsum.png' },
    { id: 'kenji-sato', name: 'Chef Kenji Sato', cuisine: 'Kyoto Kaiseki', photo: '/images/chefs/chef_kenji_sato.png', dishPhoto: '/images/orders/order_japanese_sushi.png' },
    { id: 'min-jun-park', name: 'Chef Min-Jun Park', cuisine: 'Modern Korean', photo: '/images/chefs/chef_min_jun_park.png', dishPhoto: '/images/orders/order_korean_bbq.png' },
    { id: 'meera-patel', name: 'Chef Meera Patel', cuisine: 'Royal Indian', photo: '/images/chefs/chef_meera_patel.png', dishPhoto: '/images/orders/order_indian_biryani.png' },
    { id: 'tariq-al-ghamdi', name: 'Chef Tariq Al-Ghamdi', cuisine: 'Middle Eastern Royal', photo: '/images/chefs/chef_tariq_al_ghamdi.png', dishPhoto: '/images/orders/order_middle_eastern_lamb.png' },
    { id: 'carlos-garcia', name: 'Chef Carlos Garcia', cuisine: 'Modern Mexican', photo: '/images/chefs/chef_carlos_garcia.png', dishPhoto: '/images/orders/order_mexican_birria.png' },
    { id: 'elena-beauchamp', name: 'Chef Éléna Beauchamp', cuisine: 'French-Canadian', photo: '/images/chefs/chef_elena_beauchamp.png', dishPhoto: '/images/orders/order_canadian_duck.png' },
    { id: 'olena-kovalenko', name: 'Chef Olena Kovalenko', cuisine: 'Modern Ukrainian', photo: '/images/chefs/chef_olena_kovalenko.png', dishPhoto: '/images/orders/order_ukrainian_varenyky.png' },
    { id: 'james-osei', name: 'Chef James Osei', cuisine: 'Pan-African Fusion', photo: '/images/chefs/chef_james_osei.png', dishPhoto: '/images/orders/order_pan_african_suya.png' },
]

export default function ReviewsPage() {
    const { user, profile } = useAuth()
    const { showToast } = useToast()

    const [reviews, setReviews] = useState<ChefReview[]>(INITIAL_REVIEWS)
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [selectedChefFilter, setSelectedChefFilter] = useState<string>('all')
    const [minRating, setMinRating] = useState<number>(0)
    const [modalOpen, setModalOpen] = useState(false)

    // Form state
    const [authorName, setAuthorName] = useState('')
    const [authorRole, setAuthorRole] = useState('Private Dinner Host')
    const [authorLocation, setAuthorLocation] = useState('')
    const [selectedChefId, setSelectedChefId] = useState('marco-rossi')
    const [rating, setRating] = useState(5)
    const [eventType, setEventType] = useState('Private Celebration Dinner')
    const [dishHighlight, setDishHighlight] = useState('')
    const [comment, setComment] = useState('')

    useEffect(() => {
        setReviews(getAllReviews())
        if (profile?.full_name) {
            setAuthorName(profile.full_name)
        }
    }, [profile])

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault()
        if (!authorName.trim() || !comment.trim()) {
            showToast('Please fill in your name and review text', 'error')
            return
        }

        const chef = CHEF_OPTIONS.find(c => c.id === selectedChefId) || CHEF_OPTIONS[0]

        const created = saveNewReview({
            authorName,
            authorRole,
            authorLocation: authorLocation.trim() || 'London, UK',
            chefId: chef.id,
            chefName: chef.name,
            chefPhoto: chef.photo,
            cuisine: chef.cuisine,
            rating,
            eventType: eventType.trim() || 'Private Dining Event',
            comment,
            dishHighlight: dishHighlight.trim() || undefined,
            dishPhoto: chef.dishPhoto
        })

        setReviews(getAllReviews())
        setModalOpen(false)
        setComment('')
        setDishHighlight('')
        showToast('⭐ Thank you for your review!', 'success', 'Your verified feedback is now live on ChefMii Global.')
    }

    const filteredReviews = reviews.filter(r => {
        if (selectedChefFilter !== 'all' && r.chefId !== selectedChefFilter) return false
        if (minRating > 0 && r.rating < minRating) return false
        if (filterCategory === 'corporate' && !r.authorRole.toLowerCase().includes('partner') && !r.authorRole.toLowerCase().includes('head') && !r.authorRole.toLowerCase().includes('corporate') && !r.authorRole.toLowerCase().includes('company')) return false
        if (filterCategory === 'weddings' && !r.eventType.toLowerCase().includes('wedding') && !r.eventType.toLowerCase().includes('anniversary') && !r.eventType.toLowerCase().includes('engagement')) return false
        if (filterCategory === 'private' && (r.authorRole.toLowerCase().includes('partner') || r.authorRole.toLowerCase().includes('head'))) return false
        return true
    })

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24 font-sans text-foreground pt-24 sm:pt-28">
                {/* Hero Banner with Platform Rating Metrics */}
                <section className="bg-stone-900 text-white py-14 px-4 sm:px-6 relative overflow-hidden border-b border-stone-800">
                    <div className="absolute inset-0 bg-radial-gradient from-terracotta/15 via-transparent to-transparent opacity-60 pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-4 text-center lg:text-left max-w-2xl">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-terracotta/20 text-terracotta border border-terracotta/30 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4" />
                                100% Verified Escrow Dining Receipts
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight">
                                Verified Client & Business Reviews
                            </h1>
                            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                                Explore authentic ratings and dining experiences from individual hosts, executive corporations, and wedding organizers who booked our private chefs worldwide.
                            </p>
                        </div>

                        {/* Overall Score Badge Card */}
                        <div className="bg-stone-800/80 backdrop-blur-xl border border-stone-700/80 rounded-3xl p-6 text-white w-full sm:w-80 shadow-2xl flex flex-col items-center text-center space-y-3 shrink-0">
                            <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <div>
                                <span className="text-4xl font-black font-serif">4.95</span>
                                <span className="text-stone-400 text-lg font-bold"> / 5.0</span>
                            </div>
                            <p className="text-xs text-stone-300 font-medium">
                                Based on <strong className="text-white">3,420+ verified dining events</strong> across London, New York, Paris, Tokyo, and Dubai.
                            </p>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="w-full py-3 rounded-2xl gradient-brand text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Write a Verified Review
                            </button>
                        </div>
                    </div>
                </section>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-stone-900 border-b border-border sticky top-20 z-20 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                        {/* Categories */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: '🌟 All Reviews' },
                                { id: 'private', label: '🏡 Private Diners' },
                                { id: 'corporate', label: '🏢 Corporate & Business' },
                                { id: 'weddings', label: '💍 Weddings & Banquets' },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                        filterCategory === cat.id
                                            ? 'bg-terracotta text-white border-terracotta shadow-xs'
                                            : 'bg-stone-100 dark:bg-stone-800 text-foreground border-border hover:border-terracotta/50'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Chef Filter Select */}
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedChefFilter}
                                onChange={e => setSelectedChefFilter(e.target.value)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                            >
                                <option value="all">All Master Chefs ({CHEF_OPTIONS.length})</option>
                                {CHEF_OPTIONS.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.cuisine})</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setModalOpen(true)}
                                className="hidden sm:flex px-4 py-2 rounded-xl gradient-brand text-white font-bold text-xs items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Review
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-bold text-muted-foreground">
                            Showing <strong className="text-foreground">{filteredReviews.length}</strong> verified reviews
                        </p>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            All verified with Stripe Escrow booking confirmations
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReviews.map((rev) => (
                            <article
                                key={rev.id}
                                className="bg-white dark:bg-stone-900 border border-border/80 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-terracotta/50 transition-all duration-300 flex flex-col justify-between space-y-5 group"
                            >
                                <div className="space-y-4">
                                    {/* Header: Author & Verified Badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full gradient-brand text-white font-bold text-sm flex items-center justify-center shadow-xs">
                                                {rev.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-foreground leading-tight">{rev.authorName}</h3>
                                                <p className="text-[11px] text-muted-foreground">{rev.authorRole}</p>
                                                <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" /> {rev.authorLocation}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold shrink-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified Diner
                                        </span>
                                    </div>

                                    {/* Rating Stars & Event Tag */}
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {[...Array(rev.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-medium">{rev.date}</span>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-xs font-semibold text-foreground flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-terracotta shrink-0" />
                                        <span className="truncate">{rev.eventType}</span>
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                                        &ldquo;{rev.comment}&rdquo;
                                    </p>

                                    {/* Dish Photo Highlight if available */}
                                    {rev.dishPhoto && (
                                        <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-border shadow-xs group-hover:scale-[1.01] transition-transform">
                                            <Image
                                                src={rev.dishPhoto}
                                                alt={rev.dishHighlight || 'Culinary dish'}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                            {rev.dishHighlight && (
                                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                                                    <p className="text-xs font-bold truncate">🍽️ {rev.dishHighlight}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Chef Credit Footer */}
                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <Link
                                        href={`/chefs/${rev.chefId}`}
                                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group/chef"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden relative border border-border">
                                            <Image src={rev.chefPhoto} alt={rev.chefName} fill unoptimized className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground group-hover/chef:text-terracotta transition-colors">{rev.chefName}</p>
                                            <p className="text-[10px] text-muted-foreground">{rev.cuisine}</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={`/book/${rev.chefId}`}
                                        className="text-[11px] font-bold text-terracotta hover:underline flex items-center gap-0.5"
                                    >
                                        Book Chef <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            {/* WRITE REVIEW MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-card dark:bg-stone-900 border border-border rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 text-foreground max-h-[92vh] overflow-y-auto space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-2.5">
                                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                                <div>
                                    <h3 className="text-lg font-bold font-serif">Leave a Verified Chef Review</h3>
                                    <p className="text-xs text-muted-foreground">Share your dining or event experience with the community</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-foreground mb-1">Your Full Name / Organisation *</label>
                                <input
                                    type="text"
                                    required
                                    value={authorName}
                                    onChange={e => setAuthorName(e.target.value)}
                                    placeholder="e.g. Eleanor Vance or Acme Corp"
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-foreground mb-1">Your Role / Client Type</label>
                                    <select
                                        value={authorRole}
                                        onChange={e => setAuthorRole(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta font-medium"
                                    >
                                        <option value="Private Dinner Host">Private Dinner Host 🏡</option>
                                        <option value="Corporate Event Organizer">Corporate Event Organizer 🏢</option>
                                        <option value="Wedding & Banquet Host">Wedding & Banquet Host 💍</option>
                                        <option value="Masterclass Student">Academy Masterclass Student 🎓</option>
                                        <option value="Food Critic & Host">Food Critic & Gourmet Club 🍷</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-foreground mb-1">Event Location / City</label>
                                    <input
                                        type="text"
                                        value={authorLocation}
                                        onChange={e => setAuthorLocation(e.target.value)}
                                        placeholder="e.g. Kensington, London"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-foreground mb-1">Select Chef *</label>
                                <select
                                    value={selectedChefId}
                                    onChange={e => setSelectedChefId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta font-bold"
                                >
                                    {CHEF_OPTIONS.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} — {c.cuisine}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Star Rating Selector */}
                            <div>
                                <label className="block font-bold text-foreground mb-1.5">Rating</label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map(starNum => (
                                        <button
                                            type="button"
                                            key={starNum}
                                            onClick={() => setRating(starNum)}
                                            className="p-1 text-2xl focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star className={`w-7 h-7 ${starNum <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'}`} />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold ml-2 text-foreground">{rating} / 5 Stars</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-foreground mb-1">Event Occasion</label>
                                    <input
                                        type="text"
                                        value={eventType}
                                        onChange={e => setEventType(e.target.value)}
                                        placeholder="e.g. Birthday 5-Course Dinner"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-foreground mb-1">Signature Dish Highlight</label>
                                    <input
                                        type="text"
                                        value={dishHighlight}
                                        onChange={e => setDishHighlight(e.target.value)}
                                        placeholder="e.g. Truffle Tagliatelle"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-foreground mb-1">Your Detailed Experience & Feedback *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Describe the chef's punctuality, food presentation, flavor mastery, kitchen cleanup, and guest reactions..."
                                    className="w-full p-3.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                                >
                                    Submit Verified Review →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}
