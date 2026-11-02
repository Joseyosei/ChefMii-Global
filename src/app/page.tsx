'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { FeaturedChefs } from '@/components/home/featured-chefs'
import {
    Search, MapPin, Calendar, Users, Star, ChefHat,
    ShieldCheck, Sparkles, Utensils, Building2, Baby,
    GraduationCap, ArrowRight, Play, CheckCircle2, Heart,
    ShoppingBag, Award, Clock, Flame
} from 'lucide-react'

const OCCASIONS = [
    {
        title: 'Intimate Dinner Parties',
        desc: 'Elevate birthdays, anniversaries, and dinner gatherings with a dedicated private chef.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
        tag: 'Popular',
        href: '/find-chefs?occasion=dinner',
    },
    {
        title: 'Romantic Date Nights',
        desc: 'A bespoke multi-course candlelit tasting menu cooked and served in your home.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        tag: 'Romantic',
        href: '/find-chefs?occasion=date-night',
    },
    {
        title: 'Corporate & Executive Dining',
        desc: 'Impress VIP clients, board members, and team retreats with gourmet catering.',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
        tag: 'Business',
        href: '/business-dashboard',
    },
    {
        title: 'Weddings & Celebrations',
        desc: 'Unforgettable banquets and bespoke canapés tailored to your dream milestone.',
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80',
        tag: 'Celebration',
        href: '/packages',
    },
]

const HOW_IT_WORKS = [
    {
        step: '01',
        title: 'Discover & Customize',
        desc: 'Browse verified chefs, view sample menus, and customize every dish to match your dietary preferences and occasion.',
        icon: ChefHat,
    },
    {
        step: '02',
        title: 'Seamless Escrow Booking',
        desc: 'Book securely with 10% platform protection or split the bill with guests. Funds are held safely in escrow until after your event.',
        icon: ShieldCheck,
    },
    {
        step: '03',
        title: 'Dine, Relax & Enjoy',
        desc: 'Your chef brings fresh ingredients, cooks in your kitchen, serves restaurant-grade courses, and leaves your kitchen spotless.',
        icon: Utensils,
    },
]

const TESTIMONIALS = [
    {
        quote: 'Chef Marco turned our 10th anniversary into a 3-star Michelin experience right in our London townhouse. Incredible attention to detail!',
        author: 'Lady Charlotte V.',
        role: 'Client • Kensington, London',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
        quote: 'We use ChefMii Global for our quarterly executive dinners. The seamless invoicing and high caliber of culinary talent are unmatched.',
        author: 'Julian Thorne',
        role: 'Managing Director • Vanguard Partners',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
        quote: 'Chef Yuki’s 12-course omakase dinner was the highlight of our year. Fresh wasabi, rare toro, and pure artistry at our kitchen counter.',
        author: 'Dr. Tariq Al-Mansoor',
        role: 'Client • Dubai Marina',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
]

export default function HomePage() {
    const [location, setLocation] = useState('')
    const [cuisine, setCuisine] = useState('')
    const [guests, setGuests] = useState('4')

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="flex-1">
                {/* ── 1. MAIN HERO SECTION ────────────────────────── */}
                <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[#0A0A0B] text-white">
                    {/* Background Hero Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/hero_bg.jpg"
                            alt="ChefMii Global Private Dining"
                            fill
                            priority
                            unoptimized
                            className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]/80" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-terracotta/20 via-transparent to-transparent opacity-80" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                        
                        {/* Launch VIP Tag */}
                        <Link
                            href="/waitlist"
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:border-terracotta/80 hover:bg-terracotta/20 backdrop-blur-md mb-8 transition-all group"
                        >
                            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                                VIP Early Access Waitlist Open • Reserve Priority Launch Spot →
                            </span>
                        </Link>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto">
                            Book World-Class Private Chefs <br className="hidden sm:inline" />
                            <span className="gradient-text-brand">For Any Occasion</span>
                        </h1>

                        <p className="text-base sm:text-xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
                            Experience bespoke restaurant-grade culinary artistry in the intimacy of your home. From Michelin-trained masters to local gourmet artisans.
                        </p>

                        {/* Search & Booking Bar */}
                        <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-xl border border-white/15 p-3 sm:p-4 rounded-3xl shadow-2xl text-foreground mb-12">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    window.location.href = `/find-chefs?location=${encodeURIComponent(location)}&cuisine=${encodeURIComponent(cuisine)}&guests=${guests}`
                                }}
                                className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center"
                            >
                                {/* Location */}
                                <div className="text-left px-3 py-2 rounded-2xl bg-muted/60 border border-border/80">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                                        Location
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g. London, Dubai..."
                                            className="w-full bg-transparent text-xs font-semibold focus:outline-none placeholder:text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                {/* Cuisine */}
                                <div className="text-left px-3 py-2 rounded-2xl bg-muted/60 border border-border/80">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                                        Cuisine Style
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-terracotta shrink-0" />
                                        <select
                                            value={cuisine}
                                            onChange={(e) => setCuisine(e.target.value)}
                                            className="w-full bg-transparent text-xs font-semibold focus:outline-none"
                                        >
                                            <option value="">Any Cuisine</option>
                                            <option value="Italian">Italian Fine Dining</option>
                                            <option value="Japanese">Japanese Omakase</option>
                                            <option value="French">French Haute Cuisine</option>
                                            <option value="Spanish">Spanish Modern Tapas</option>
                                            <option value="West African">West African Gourmet</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Guests */}
                                <div className="text-left px-3 py-2 rounded-2xl bg-muted/60 border border-border/80">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                                        Guest Count
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-terracotta shrink-0" />
                                        <select
                                            value={guests}
                                            onChange={(e) => setGuests(e.target.value)}
                                            className="w-full bg-transparent text-xs font-semibold focus:outline-none"
                                        >
                                            <option value="2">2 Guests (Intimate)</option>
                                            <option value="4">4 - 6 Guests</option>
                                            <option value="8">8 - 12 Guests</option>
                                            <option value="15">15+ Party / Event</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full h-full min-h-[48px] py-3.5 px-6 gradient-brand text-white font-bold text-sm rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>Find Chefs</span>
                                </button>
                            </form>
                        </div>

                        {/* Trust Pillars */}
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-zinc-300">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>100% Escrow Protection</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span>Michelin-Trained & Vetted Chefs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-terracotta" />
                                <span>Ingredients & Full Cleanup Included</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 2. FEATURED CHEFS ROSTER ────────────────────── */}
                <FeaturedChefs />

                {/* ── 3. EXPLORE BY OCCASION ──────────────────────── */}
                <section className="py-24 bg-card/40 border-t border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
                            <div>
                                <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-2">Curated Dining</span>
                                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground">
                                    Crafted for Every Milestone
                                </h2>
                            </div>
                            <Link href="/find-chefs" className="text-sm font-bold text-terracotta hover:underline inline-flex items-center gap-1">
                                View all experiences <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {OCCASIONS.map((occ, idx) => (
                                <Link
                                    key={idx}
                                    href={occ.href}
                                    className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-96"
                                >
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={occ.image}
                                            alt={occ.title}
                                            fill
                                            unoptimized
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    </div>

                                    <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
                                        <span className="self-start px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20">
                                            {occ.tag}
                                        </span>
                                        <div>
                                            <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-terracotta transition-colors">
                                                {occ.title}
                                            </h3>
                                            <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                                                {occ.desc}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 4. HOW CHEFMII GLOBAL WORKS ─────────────────── */}
                <section className="py-24 bg-background border-t border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-2">Simplicity & Luxury</span>
                            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-4">
                                How ChefMii Global Works
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                From chef selection to clean kitchen in 3 effortless steps.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {HOW_IT_WORKS.map((step, idx) => {
                                const Icon = step.icon
                                return (
                                    <div
                                        key={idx}
                                        className="relative bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-terracotta/40 transition-all group"
                                    >
                                        <div className="text-4xl font-serif font-black text-terracotta/20 mb-6 group-hover:text-terracotta/40 transition-colors">
                                            {step.step}
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold mb-3 text-foreground">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* ── 5. CHEFTV & MARKETPLACE PREVIEW ─────────────── */}
                <section className="py-20 bg-muted/30 border-t border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* ChefTV Hub Card */}
                            <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:shadow-xl transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="p-2 rounded-xl bg-red-500/10 text-red-500">
                                            <Flame className="w-5 h-5" />
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-red-500">ChefTV Media</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-foreground mb-4">
                                        Watch Master Chefs in Action
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                        Explore TikTok-style culinary shorts, kitchen techniques, and behind-the-scenes plating videos directly from our verified private chefs.
                                    </p>
                                </div>
                                <Link
                                    href="/chef-media"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 gradient-brand text-white font-bold text-sm rounded-2xl hover:opacity-90 transition-opacity shadow-md"
                                >
                                    <Play className="w-4 h-4 fill-white" /> Watch ChefTV Now
                                </Link>
                            </div>

                            {/* Marketplace Card */}
                            <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:shadow-xl transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                            <ShoppingBag className="w-5 h-5" />
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Curated Pantry</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-foreground mb-4">
                                        Artisanal Chef Marketplace
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                        Order Sicilian extra virgin olive oils, handmade truffle sauces, single-origin spices, and chef cutlery handpicked by our culinary roster.
                                    </p>
                                </div>
                                <Link
                                    href="/marketplace"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-foreground text-background font-bold text-sm rounded-2xl hover:opacity-90 transition-opacity shadow-md"
                                >
                                    <ShoppingBag className="w-4 h-4" /> Shop Marketplace
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 6. CLIENT TESTIMONIALS ──────────────────────── */}
                <section className="py-24 bg-background border-t border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-2">Client Reviews</span>
                            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-4">
                                Loved by Connoisseurs
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                Real experiences from private residences and corporate gatherings.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {TESTIMONIALS.map((t, idx) => (
                                <div key={idx} className="bg-card border border-border p-8 rounded-3xl flex flex-col justify-between shadow-sm">
                                    <div>
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm sm:text-base italic text-foreground leading-relaxed mb-6">
                                            &ldquo;{t.quote}&rdquo;
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                                        <Image
                                            src={t.avatar}
                                            alt={t.author}
                                            width={44}
                                            height={44}
                                            unoptimized
                                            className="rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-sm text-foreground">{t.author}</h4>
                                            <p className="text-xs text-muted-foreground">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 7. VIP WAITLIST CTA BANNER ──────────────────── */}
                <section className="py-20 bg-[#0C0C0E] text-white border-t border-border relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-terracotta/20 via-transparent to-transparent opacity-60" />
                    
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <span className="text-xs font-bold text-terracotta uppercase tracking-widest block mb-3">Pre-Launch Exclusives</span>
                        <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4">
                            Reserve Your Priority VIP Spot
                        </h2>
                        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
                            Join the official ChefMii Global waitlist today to receive £50 booking credit and exclusive early invitations to local tasting events.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/waitlist"
                                className="px-8 py-4 gradient-brand text-white font-bold text-base rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2"
                            >
                                <span>Join Official Waitlist</span>
                            </Link>
                            <Link
                                href="/become-a-chef"
                                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-base rounded-2xl border border-white/15 transition-colors"
                            >
                                <span>Apply to Cook as Chef</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ChatbotWidget />
        </div>
    )
}
