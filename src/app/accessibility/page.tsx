'use client'

import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { useAccessibility } from '@/context/accessibility-context'
import {
    Accessibility, Eye, Ear, MousePointer, Brain,
    ShieldCheck, CheckCircle2, Sliders, Volume2,
    Mail, ArrowRight, Sparkles, BookOpen, HeartHandshake,
    Keyboard, Headphones
} from 'lucide-react'

export default function AccessibilityPage() {
    const { setIsOpen, applyPreset } = useAccessibility()

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <main className="flex-1 pt-28 pb-20">
                {/* HERO BANNER */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-200 text-xs font-semibold shadow-md">
                            <Accessibility className="w-4 h-4 text-[#FF5A36]" />
                            <span>Accessibility at ChefMii Global</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                WCAG 2.1 AA/AAA
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-serif">
                            Fine Dining Made <span className="gradient-text-brand">Universally Accessible</span>
                        </h1>

                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                            At ChefMii Global, we believe world-class culinary experiences must be accessible to everyone. We are dedicated to providing an inclusive digital environment tailored for individuals with visual, auditory, motor, and cognitive disabilities.
                        </p>

                        {/* Interactive Launch Button */}
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="px-6 py-3 rounded-2xl bg-[#FF5A36] hover:bg-[#e44e2c] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                                <Accessibility className="w-5 h-5" />
                                Open Accessibility Tools (Alt + A)
                            </button>
                            <Link
                                href="#standards"
                                className="px-6 py-3 rounded-2xl bg-muted/60 hover:bg-muted text-foreground font-semibold text-sm border border-border/80 transition-colors"
                            >
                                View Standards & Conformance
                            </Link>
                        </div>
                    </div>

                    {/* 1-CLICK QUICK ACCESS PROFILES */}
                    <div className="mb-16 p-6 rounded-3xl bg-card border border-border shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-[#FF5A36]" />
                            <h2 className="text-base font-bold text-foreground">Quick-Launch Accessibility Profiles</h2>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                            Select a profile to instantly configure your browsing preferences across all ChefMii Global pages:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                onClick={() => { applyPreset('vision'); setIsOpen(true) }}
                                className="p-4 rounded-2xl bg-stone-900/40 dark:bg-stone-900/80 hover:bg-stone-900/60 border border-border hover:border-[#FF5A36] text-left transition-all"
                            >
                                <Eye className="w-5 h-5 text-[#FF5A36] mb-2" />
                                <h3 className="font-bold text-xs text-foreground">Vision Accommodations</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">High contrast, large fonts, cursor enhancement & TTS</p>
                            </button>

                            <button
                                onClick={() => { applyPreset('hearing'); setIsOpen(true) }}
                                className="p-4 rounded-2xl bg-stone-900/40 dark:bg-stone-900/80 hover:bg-stone-900/60 border border-border hover:border-emerald-500 text-left transition-all"
                            >
                                <Ear className="w-5 h-5 text-emerald-400 mb-2" />
                                <h3 className="font-bold text-xs text-foreground">Auditory / Deaf Support</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">Closed captions, transcripts & visual screen alerts</p>
                            </button>

                            <button
                                onClick={() => { applyPreset('motor'); setIsOpen(true) }}
                                className="p-4 rounded-2xl bg-stone-900/40 dark:bg-stone-900/80 hover:bg-stone-900/60 border border-border hover:border-sky-500 text-left transition-all"
                            >
                                <MousePointer className="w-5 h-5 text-sky-400 mb-2" />
                                <h3 className="font-bold text-xs text-foreground">Motor & Mobility</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">Enlarged touch targets, focus borders & reduced motion</p>
                            </button>

                            <button
                                onClick={() => { applyPreset('cognitive'); setIsOpen(true) }}
                                className="p-4 rounded-2xl bg-stone-900/40 dark:bg-stone-900/80 hover:bg-stone-900/60 border border-border hover:border-amber-500 text-left transition-all"
                            >
                                <Brain className="w-5 h-5 text-amber-400 mb-2" />
                                <h3 className="font-bold text-xs text-foreground">Cognitive & Dyslexia</h3>
                                <p className="text-[11px] text-muted-foreground mt-1">Dyslexia fonts, reading ruler, extra line & letter spacing</p>
                            </button>
                        </div>
                    </div>

                    {/* DETAILED ACCOMMODATIONS GRID */}
                    <div className="space-y-12">
                        {/* 1. VISUAL ACCOMMODATIONS */}
                        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#FF5A36]/10 text-[#FF5A36] flex items-center justify-center">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Visual & Low Vision Accommodations</h2>
                                    <p className="text-xs text-muted-foreground">Empowering guests with blindness, partial sight, or color blindness</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Screen Reader Optimization
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        All interactive buttons, forms, chef menus, and booking steps carry descriptive <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">aria-label</code> tags, landmark roles, and live region announcements for NVDA, JAWS, VoiceOver, and TalkBack.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        WCAG AAA Contrast Modes
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Switch between Standard, High Contrast Dark (pure black background with certified high-luminance elements), High Contrast Light, Monochromatic Grayscale, and Color Inversion modes.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Responsive Font Scaling (Up to 150%)
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Enlarge typography across the entire marketplace to 115%, 130%, or 150% without clipping content, breaking responsive card grids, or compromising transactional checkout flows.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Native Speech Synthesis (Read Aloud)
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Built-in Web Speech API screen reader lets users listen to chef bios, culinary descriptions, pricing breakdowns, and page text directly in their browser.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. AUDITORY ACCOMMODATIONS */}
                        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Ear className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Auditory & Hearing Impairment Accommodations</h2>
                                    <p className="text-xs text-muted-foreground">Full access for deaf, hard-of-hearing, and non-auditory users</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Closed Captions (CC) on ChefTV
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        All culinary reels and chef videos on <Link href="/chef-media" className="text-[#FF5A36] underline">ChefTV</Link> support closed captions with culinary technique explanations, spoken dialogue, and ambient sound cues.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Visual Screen Flash Alerts
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        System alerts, booking updates, and toast messages provide high-visibility screen border pulses rather than relying solely on auditory chimes or sound effects.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Text-First Concierge Support
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        We offer 24/7 real-time live chat, in-app messaging with your private chef, and email support so you never need to rely on phone calls for reservations or dietary discussions.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Full Video Transcripts
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Access written transcripts for cooking demonstrations and culinary masterclasses, detailing ingredients, exact measurements, and preparation steps.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. MOTOR & MOBILITY */}
                        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                                    <MousePointer className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Motor, Mobility & Switch-Device Accommodations</h2>
                                    <p className="text-xs text-muted-foreground">Seamless navigation for keyboard, mouth stick, and switch users</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Complete Keyboard Navigation
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Every feature—including chef filtering, calendar date picking, menu selection, split billing, and review submission—is 100% accessible via standard keyboard controls without mouse traps.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Skip to Main Content Bypass Link
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        An immediate top-of-page skip link allows keyboard users to bypass repetitive navigation bars directly to main page contents with a single keystroke.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Enlarged 48px+ Touch & Click Targets
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        All interactive buttons, selectors, and dropdown toggles feature generous padding meeting and exceeding WCAG 2.5.5 Target Size criteria.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        High-Visibility Focus Indicators
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Prominent 4px orange focus rings with 3px offsets ensure users tracking focus with eye gaze or switches always know exactly which control is active.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 4. COGNITIVE & NEURODIVERSITY */}
                        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Cognitive, ADHD & Neurodivergent Accommodations</h2>
                                    <p className="text-xs text-muted-foreground">Clear structures, predictable interactions, and distraction-free options</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Dyslexia-Friendly Typeface & Spacing
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Activate our specialized typography mode with weighted bottom stems, expanded letter tracking, and generous 1.85 line heights to prevent letter reversal and visual crowding.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Interactive Reading Guide (Ruler)
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        A floating visual horizontal band highlights one line of text at a time following your cursor, significantly aiding reading concentration and focus retention.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Prefers-Reduced-Motion & Animation Pause
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Disable all decorative animations, transitions, and auto-scrolling effects to accommodate users with vestibular conditions or motion sensitivity.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                                    <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Clear Dietary, Allergen & Halal Tagging
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Menus clearly identify allergen profiles (nuts, gluten, dairy), religious dietary standards (Halal, Kosher), and culinary styles with unambiguous visual badges.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* CONFORMANCE & STANDARDS STATEMENT */}
                    <div id="standards" className="mt-16 p-8 rounded-3xl bg-stone-900 text-stone-100 border border-stone-800 space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                            <div>
                                <h2 className="text-xl font-bold text-white">Compliance & Conformance Statement</h2>
                                <p className="text-xs text-stone-400">Official Accessibility Policy & Ongoing Monitoring</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                            <p>
                                ChefMii Global strives to adhere to Level AA of the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines 2.1 (WCAG 2.1), and conforms with the Americans with Disabilities Act (ADA) Title III, the European Accessibility Act (EN 301 549), and Section 508 of the U.S. Rehabilitation Act.
                            </p>
                            <p>
                                Our development team conducts continuous automated accessibility testing through axe-core, Chrome Lighthouse audits, and manual assistive technology verification on desktop (macOS VoiceOver, Windows NVDA) and mobile (iOS VoiceOver, Android TalkBack).
                            </p>
                        </div>

                        {/* Accessibility Help & Feedback */}
                        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-sm text-white">Need an accommodation or found a barrier?</h3>
                                <p className="text-xs text-stone-400">Our dedicated accessibility team responds within 2 business days.</p>
                            </div>
                            <a
                                href="mailto:accessibility@chefmii.com"
                                className="px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#e44e2c] text-white font-bold text-xs flex items-center gap-2 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                accessibility@chefmii.com
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
