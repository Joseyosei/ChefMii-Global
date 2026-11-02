'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
    ChefHat, DollarSign, Calendar, ShieldCheck,
    Sparkles, ArrowRight, CheckCircle2, Award, Users
} from 'lucide-react'

const CHEF_BENEFITS = [
    {
        icon: DollarSign,
        title: 'Keep Up to 90% of Earnings',
        desc: 'Set your own hourly rates and menu pricing. Automated instant Stripe bank payouts within 24 hours of dinner completion.',
    },
    {
        icon: Calendar,
        title: 'Total Schedule Flexibility',
        desc: 'Cook when you want. Block out calendar dates, accept only dinner parties you love, and balance private clients effortlessly.',
    },
    {
        icon: ShieldCheck,
        title: '100% Escrow & Insurance Protection',
        desc: 'Zero risk of client payment defaults. All funds are secured in advance via Stripe Escrow with comprehensive liability coverage.',
    },
    {
        icon: Sparkles,
        title: 'ChefTV & Global Exposure',
        desc: 'Broadcast your signature dishes on ChefTV, attract high-net-worth diners, and get booked for private celebrity events.',
    },
]

export default function BecomeAChefPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-16 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-6">
                        <ChefHat className="w-3.5 h-3.5" />
                        Join the ChefMii Global Guild
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                        Earn on Your Own Terms. Share Your Culinary Passion.
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                        Join an elite roster of Michelin-trained culinary artists. We handle payment escrow, client insurance, and marketing so you can focus on cooking.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/register?role=chef"
                            className="px-8 py-3.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <ChefHat className="w-4 h-4" />
                            Apply as a Chef Now
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-8 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm text-foreground transition-all"
                        >
                            Explore Chef Pro Tiers
                        </Link>
                    </div>
                </section>

                {/* Benefits Grid */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CHEF_BENEFITS.map((b, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs space-y-4 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                                    <b.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{b.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 7-Stage Vetting Info */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 text-white border border-stone-800 shadow-2xl">
                        <div className="max-w-2xl mb-8">
                            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">Excellence Standards</span>
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1 mb-3">Our 7-Stage Vetting Process</h2>
                            <p className="text-sm text-stone-300">
                                To ensure the ultimate dining experience for our hosts, all prospective chefs complete our culinary audition and background review.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-300">
                            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                                <p className="font-bold text-white">1. Culinary CV & Portfolio Review</p>
                                <p>Verification of professional restaurant & banquet kitchen experience.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                                <p className="font-bold text-white">2. Food Hygiene & Safety Certification</p>
                                <p>Active Level 2 / Level 3 Food Safety certification verification.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                                <p className="font-bold text-white">3. Knife Skills & Blind Tasting Audition</p>
                                <p>In-person or video panel assessment by our Culinary Advisory Board.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                                <p className="font-bold text-white">4. DBS & Identity Verification</p>
                                <p>Comprehensive criminal background & identity checks for in-home safety.</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <Link
                                href="/register?role=chef"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-stone-100 shadow-lg transition-all"
                            >
                                Start Your Chef Application →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
