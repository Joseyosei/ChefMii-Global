'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
    ChefHat, ShieldCheck, Sparkles, Globe, Heart, Award,
    Users, Star, ArrowRight, Utensils, Clock, CheckCircle2
} from 'lucide-react'

const PILLARS = [
    {
        icon: Award,
        title: 'Rigorous 7-Stage Chef Vetting',
        desc: 'Only the top 3% of applicants are verified. Every chef undergoes background checks, knife-skills tasting auditions, and Michelin kitchen hygiene certification.',
    },
    {
        icon: ShieldCheck,
        title: '100% Escrow Guarantee',
        desc: 'Your payment is safely locked in automated Stripe escrow until your dinner is completed, kitchen spotless, and you are 100% delighted.',
    },
    {
        icon: Globe,
        title: 'Global Culinary Diversity',
        desc: 'From Tokyo Edomae Omakase to Roman Carbonara, Lagos Firewood Jollof, and Nordic Smoked Trout — experience world heritage at your dining table.',
    },
    {
        icon: Utensils,
        title: 'Zero Cleanup Guarantee',
        desc: 'Chefs arrive with fresh ingredients, cook table-side, plate restaurant-grade dishes, and leave your kitchen gleaming and spotless.',
    },
]

const STATS = [
    { number: '16+', label: 'Global Culinary Cuisines' },
    { number: '99.4%', label: 'Five-Star Reviews' },
    { number: '£100%', label: 'Escrow Protection Guarantee' },
    { number: '5,000+', label: 'Bespoke Dinners Hosted' },
]

const VALUES = [
    {
        title: 'Artistry in Every Plate',
        desc: 'Food is culture, memory, and artistry. We empower culinary creators to share their heritage directly with discerning diners.',
    },
    {
        title: 'Fair Compensation for Chefs',
        desc: 'Traditional restaurants take massive margins. ChefMii Global ensures chefs keep up to 90% of their earnings with direct instant Stripe payouts.',
    },
    {
        title: 'Hyperlocal & Sustainable',
        desc: 'We partner directly with organic UK and global farm cooperatives to cut food miles and eliminate kitchen waste.',
    },
]

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20">
                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-bold mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        The ChefMii Global Story & Mission
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground leading-[1.15] mb-6 max-w-4xl mx-auto">
                        Democratizing Michelin-Grade Culinary Artistry Worldwide.
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                        ChefMii Global was founded on a simple belief: the world’s most memorable dining experiences shouldn’t require waiting months for a restaurant table. They belong in the intimacy of your home.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/find-chefs"
                            className="px-8 py-3.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <ChefHat className="w-4 h-4" />
                            Explore Master Chefs
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-8 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm text-foreground transition-all"
                        >
                            View Membership Tiers
                        </Link>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-sm">
                        {STATS.map((s, idx) => (
                            <div key={idx} className="text-center p-4">
                                <p className="text-3xl sm:text-4xl font-serif font-black text-terracotta mb-1">{s.number}</p>
                                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* The Origin Story */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="bg-gradient-to-br from-stone-900 to-black text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-stone-800 relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl space-y-6">
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold">Why We Built ChefMii Global</h2>
                            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                                Great chefs spend decades honing their technique in high-pressure Michelin kitchens, only to be disconnected from the guests eating their food. Meanwhile, diners endure overcrowded dining rooms, rushed seatings, and rigid menus.
                            </p>
                            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                                ChefMii Global bridges this divide with an ultra-secure, escrow-protected booking platform that gives talented private chefs full entrepreneurial independence while giving hosts an unforgettable dining experience where every dish tells a story.
                            </p>
                            <div className="pt-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center font-bold text-lg text-white">
                                    CM
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white">The ChefMii Global Founding Team</p>
                                    <p className="text-xs text-stone-400">London • New York • Dubai • Tokyo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Pillars */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">Our Core Standards</h2>
                        <p className="text-sm text-muted-foreground">Every reservation on ChefMii Global is backed by uncompromising quality and financial safety.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PILLARS.map((p, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs space-y-4 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                                    <p.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Company Values */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="p-8 sm:p-12 rounded-3xl bg-stone-100 dark:bg-stone-900/60 border border-border">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 text-center">What Drives Us Every Day</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {VALUES.map((v, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="w-8 h-8 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
                                        0{i + 1}
                                    </div>
                                    <h3 className="font-bold text-base text-foreground">{v.title}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
                    <div className="p-10 sm:p-14 rounded-3xl gradient-brand text-white shadow-2xl space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold">Ready to Experience ChefMii Global?</h2>
                        <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto">
                            Book a verified private chef for your next dinner party, anniversary, or corporate event today.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                            <Link
                                href="/find-chefs"
                                className="px-8 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-stone-100 shadow-lg transition-all"
                            >
                                Find Your Chef Now
                            </Link>
                            <Link
                                href="/contact"
                                className="px-8 py-3.5 rounded-2xl bg-black/20 text-white border border-white/30 font-bold text-sm hover:bg-black/30 transition-all"
                            >
                                Contact Concierge
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
