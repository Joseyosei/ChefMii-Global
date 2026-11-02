'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
    Newspaper, Download, Mail, ExternalLink, Sparkles,
    Calendar, ArrowRight, Award, Globe, CheckCircle2
} from 'lucide-react'

const PRESS_RELEASES = [
    {
        id: 'pr-1',
        title: 'ChefMii Global Launches Groundbreaking Stripe Escrow Private Chef Platform Across UK & Global Metros',
        date: 'August 10, 2026',
        outlet: 'Global Gastronomy Wire',
        summary: 'Pioneering 100% financial escrow protection, 7-stage master chef vetting, and real-time live GPS driver tracking for bespoke dining.',
        tag: 'Product Launch',
    },
    {
        id: 'pr-2',
        title: 'ChefMii Global Unveils ChefTV: Real-Time Culinary Video Streaming & Instant Table-Side Chef Booking',
        date: 'July 24, 2026',
        outlet: 'Tech In Food',
        summary: 'Foodies can now watch master chefs demonstrate authentic technique and reserve the chef directly from the video reel.',
        tag: 'Innovation',
    },
    {
        id: 'pr-3',
        title: 'Corporate Executive Catering Surges 300% on ChefMii Global Business Tier for Fortune 500 Summits',
        date: 'June 15, 2026',
        outlet: 'Business Hospitality Daily',
        summary: 'Enterprises replace traditional banquet catering with multi-chef bespoke culinary stations and BACS VAT invoicing.',
        tag: 'Corporate Growth',
    },
]

const MEDIA_COVERAGE = [
    { quote: "ChefMii Global is doing for private dining what Airbnb did for luxury villas — creating an uncompromised gold standard.", publication: "Financial Times" },
    { quote: "The Michelin-trained talent on ChefMii Global is astounding. Pure culinary theater in your own living room.", publication: "Forbes Luxury" },
    { quote: "Stripe Escrow protection plus 1-click video booking makes ChefMii Global the standout culinary platform of 2026.", publication: "TechCrunch" },
]

const BRAND_ASSETS = [
    { title: 'Official Logo & Emblem Pack (Vector SVG + PNG)', size: '4.2 MB', desc: 'Light, dark, monochrome, and terracotta emblem variations in vector format.' },
    { title: 'Brand Guidelines & Typography Specsheet', size: '2.1 MB', desc: 'Color hex codes, Libre Caslon Text pairings, and visual usage standards.' },
    { title: 'Executive Team & Master Chef Press Photos', size: '18.5 MB', desc: 'High-resolution print-ready 300dpi founder and chef portraits.' },
]

export default function PressPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                {/* Hero */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-16 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-6">
                        <Newspaper className="w-3.5 h-3.5" />
                        Press & Media Hub
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                        ChefMii Global in the News.
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                        Read official company announcements, download brand media kits, and access high-resolution assets for editorial coverage.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href="mailto:press@chefmii.com"
                            className="px-8 py-3.5 rounded-2xl gradient-brand text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Press Team
                        </a>
                        <a
                            href="#media-kit"
                            className="px-8 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm text-foreground transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Media Kit
                        </a>
                    </div>
                </section>

                {/* Media Quotes */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MEDIA_COVERAGE.map((c, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs flex flex-col justify-between space-y-4">
                                <p className="text-sm italic text-foreground leading-relaxed">&ldquo;{c.quote}&rdquo;</p>
                                <p className="text-xs font-bold uppercase tracking-wider text-terracotta">{c.publication}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Press Releases */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="border-b border-border pb-6 mb-8">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Official Press Releases</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Latest company milestones, partnerships, and product announcements</p>
                    </div>

                    <div className="space-y-6">
                        {PRESS_RELEASES.map(pr => (
                            <article
                                key={pr.id}
                                className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs hover:border-terracotta/40 hover:shadow-md transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="px-2.5 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-bold text-[11px]">
                                        {pr.tag}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{pr.date}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-foreground">{pr.outlet}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-foreground leading-snug">{pr.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{pr.summary}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Media Kit Download */}
                <section id="media-kit" className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 scroll-mt-28">
                    <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 text-white border border-stone-800 shadow-2xl">
                        <div className="max-w-2xl mb-8">
                            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">Brand Assets & Media Kit</span>
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1 mb-3">Official Media Resources</h2>
                            <p className="text-sm text-stone-300">
                                Journalists, conference organizers, and publications may freely use these official high-resolution assets in compliance with our brand guidelines.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {BRAND_ASSETS.map((asset, i) => (
                                <div
                                    key={i}
                                    className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/80 flex items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-white">{asset.title}</p>
                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 font-mono">
                                                {asset.size}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-400">{asset.desc}</p>
                                    </div>
                                    <a
                                        href="/icon.svg"
                                        download="chefmii_brand_assets.svg"
                                        className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-stone-200 transition-all flex items-center gap-1.5 shrink-0"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-400">
                            <p>For urgent press inquiries, email <a href="mailto:press@chefmii.com" className="text-terracotta underline font-bold">press@chefmii.com</a>.</p>
                            <p>Response time: &lt; 4 hours for press.</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
