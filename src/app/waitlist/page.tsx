'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { WaitlistModal } from '@/components/waitlist/waitlist-modal'
import {
    Sparkles, ChefHat, Building2, Baby, GraduationCap, Utensils,
    ShieldCheck, Users, Trophy, Star, ArrowRight, CheckCircle2,
    Copy, MapPin, Phone, Mail, Loader2
} from 'lucide-react'
import type { WaitlistRole, WaitlistFormData, WaitlistSubmissionResponse } from '@/types/waitlist'

const ROLES: { id: WaitlistRole; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { id: 'chef', label: 'Chefs', icon: ChefHat, color: 'from-orange-500 to-amber-600', desc: 'Join as a private chef to host events & earn' },
    { id: 'business', label: 'Businesses', icon: Building2, color: 'from-blue-500 to-indigo-600', desc: 'Book corporate meals & employee dining plans' },
    { id: 'kid', label: 'Kids & Parents', icon: Baby, color: 'from-pink-500 to-rose-600', desc: 'Gamified cooking challenges & junior classes' },
    { id: 'tutor', label: 'Tutors', icon: GraduationCap, color: 'from-purple-500 to-violet-600', desc: 'Teach courses & masterclasses on ChefMii Global Academy' },
    { id: 'client', label: 'Clients', icon: Utensils, color: 'from-emerald-500 to-teal-600', desc: 'Book top chefs for home dinners & events' },
]

const ROLE_BENEFITS: Record<WaitlistRole, { title: string; desc: string; icon: React.ElementType; perks: string[] }> = {
    chef: {
        title: 'For Private Chefs',
        desc: 'Unlock direct access to high-paying client bookings, zero hidden middleman fees, and free promotional video hosting on ChefTV.',
        icon: ChefHat,
        perks: ['0% platform fee for first 3 months', 'Free verified chef badge', 'Priority listing in search results', 'Instant booking notifications']
    },
    business: {
        title: 'For Corporate & Businesses',
        desc: 'Streamline team meals, executive dining, and company event catering with exclusive bulk discounts and custom invoicing.',
        icon: Building2,
        perks: ['Dedicated corporate concierge', 'Custom corporate meal plans', 'Consolidated monthly invoicing', 'Multi-user team dashboard access']
    },
    kid: {
        title: 'For Kids & Families',
        desc: 'Gamified cooking challenges, XP rewards, collectible badges, and junior masterclasses designed for bonding and skill building.',
        icon: Baby,
        perks: ['Early access to Mini Chefs games', 'Free junior apron welcome pack', 'Parent-child co-cooking dashboard', 'Kids holiday camp discounts']
    },
    tutor: {
        title: 'For Academy Tutors',
        desc: 'Monetize your culinary expertise by building live cohort courses and on-demand video masterclasses on ChefMii Global Academy.',
        icon: GraduationCap,
        perks: ['75% revenue share on course sales', 'Production support for lessons', 'Custom student progress tracking', 'Featured tutor spot on homepage']
    },
    client: {
        title: 'For Food Lovers & Clients',
        desc: 'Hire top-rated local and international chefs for intimate home dinners, date nights, weddings, and celebrations.',
        icon: Utensils,
        perks: ['£50 voucher toward your first booking', 'Access to exclusive Michelin-starred chefs', 'Priority customer support 24/7', 'Invite to ChefMii Global VIP food tasting pop-ups']
    }
}

export default function DedicatedWaitlistPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<WaitlistRole>('chef')

    // On-page direct form state
    const [formRole, setFormRole] = useState<WaitlistRole>('chef')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [addressLine1, setAddressLine1] = useState('')
    const [city, setCity] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [country, setCountry] = useState('United Kingdom')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<WaitlistSubmissionResponse['data'] | null>(null)
    const [copied, setCopied] = useState(false)

    const openModalForRole = (roleKey: WaitlistRole) => {
        setSelectedRole(roleKey)
        setModalOpen(true)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!fullName.trim() || !email.trim()) {
            setError('Please fill in both your Name and Email address.')
            return
        }

        setLoading(true)
        const payload: WaitlistFormData = {
            role: formRole,
            fullName,
            email,
            phone,
            addressLine1,
            city,
            postalCode,
            country,
            notes,
        }

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data: WaitlistSubmissionResponse = await res.json()
            if (!data.success || !data.data) {
                throw new Error(data.error || 'Failed to join waitlist')
            }
            setResult(data.data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (!result) return
        navigator.clipboard.writeText(result.referralUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="flex-1">
                {/* ── 1. DEDICATED WAITLIST HERO WITH LUXURY BACKGROUND ── */}
                <section className="relative pt-24 pb-24 sm:pt-32 sm:pb-36 bg-[#0B0B0C] text-white overflow-hidden border-b border-border/40">
                    {/* Background Luxury Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/waitlist_bg.jpg"
                            alt="ChefMii Global Luxury Kitchen"
                            fill
                            priority
                            unoptimized
                            className="object-cover object-center opacity-35 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/70 to-[#0B0B0C]/85" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-terracotta/25 via-transparent to-transparent opacity-80" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        
                        {/* Header Headline */}
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 shadow-md">
                                <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                                    OFFICIAL VIP EARLY ACCESS WAITLIST • COMING SOON
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight leading-[1.1] mb-6">
                                The Future of Private Dining <br />
                                <span className="gradient-text-brand">& Culinary Creation</span>
                            </h1>

                            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                                Reserve your exclusive VIP early spot today. Get £50 first booking credit, 0% chef fees for 3 months, and priority reservations upon launch.
                            </p>
                        </div>

                        {/* Interactive On-Page Waitlist Signup Form Card */}
                        <div className="max-w-3xl mx-auto bg-card/95 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 rounded-3xl shadow-2xl text-foreground">
                            {result ? (
                                /* Success VIP Ticket View */
                                <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                                            VIP Spot Confirmed!
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                            Welcome, <strong className="text-foreground">{result.fullName}</strong>! We have registered your location in our priority launch database.
                                        </p>
                                    </div>

                                    {/* VIP Ticket Badge */}
                                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-muted/60 border border-border text-center space-y-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Priority Queue Number
                                        </span>
                                        <div className="text-4xl font-serif font-black text-terracotta">
                                            #{result.queuePosition}
                                        </div>
                                        <p className="text-xs text-emerald-500 font-bold">
                                            ✓ Early Access Launch List Active
                                        </p>
                                    </div>

                                    {/* Referral Link Box */}
                                    <div className="max-w-md mx-auto text-left space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Your VIP Referral Link (Share to Move Up)
                                        </label>
                                        <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-xl">
                                            <input
                                                type="text"
                                                readOnly
                                                value={result.referralUrl}
                                                className="flex-1 bg-transparent px-3 py-1 text-xs font-mono text-muted-foreground focus:outline-none"
                                            />
                                            <button
                                                onClick={handleCopy}
                                                className="px-4 py-2 gradient-brand text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                                            >
                                                {copied ? 'Copied!' : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setResult(null)}
                                        className="text-xs font-bold text-terracotta hover:underline"
                                    >
                                        ← Register Another Person or Role
                                    </button>
                                </div>
                            ) : (
                                /* Direct Registration Form */
                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    
                                    {/* Role Selector Tabs */}
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                                            I Want to Join As:
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                            {ROLES.map(r => {
                                                const Icon = r.icon
                                                const isSelected = formRole === r.id
                                                return (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() => setFormRole(r.id)}
                                                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                                                            isSelected
                                                                ? 'border-terracotta bg-terracotta/10 text-foreground ring-2 ring-terracotta/30'
                                                                : 'border-border bg-background hover:bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-terracotta' : 'text-muted-foreground'}`} />
                                                        <span className="text-xs font-bold leading-tight">{r.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                placeholder="e.g. Sarah Jenkins"
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="e.g. sarah@example.com"
                                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                                            />
                                        </div>
                                    </div>

                                    {/* Address & Phone */}
                                    <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                                        <span className="text-xs font-bold text-terracotta uppercase tracking-wider flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" /> Location & Contact
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={e => setPhone(e.target.value)}
                                                        placeholder="+44 7123 456789"
                                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-terracotta"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    value={addressLine1}
                                                    onChange={e => setAddressLine1(e.target.value)}
                                                    placeholder="e.g. 42 Baker Street"
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-terracotta"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">City / Region</label>
                                                <input
                                                    type="text"
                                                    value={city}
                                                    onChange={e => setCity(e.target.value)}
                                                    placeholder="e.g. London"
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-terracotta"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-muted-foreground mb-1">Postal Code / Zip</label>
                                                <input
                                                    type="text"
                                                    value={postalCode}
                                                    onChange={e => setPostalCode(e.target.value)}
                                                    placeholder="e.g. W1U 8ED"
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-terracotta"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional Notes */}
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                                            Special Preferences or Notes (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="e.g. Favorite cuisines, dietary requirements, or company size"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-terracotta"
                                        />
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium">
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 gradient-brand text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-terracotta/25 flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Reserving Your VIP Spot…</span>
                                            </>
                                        ) : (
                                            <span>Reserve Priority VIP Spot</span>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── 2. ROLE BENEFITS BREAKDOWN ──────────────────── */}
                <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold text-terracotta uppercase tracking-widest mb-2 block">Exclusive Launch Perks</span>
                        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-4">
                            Tailored Advantages by Category
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg">
                            We engineered ChefMii Global to deliver immense value across our entire culinary ecosystem.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(Object.keys(ROLE_BENEFITS) as WaitlistRole[]).map(roleKey => {
                            const b = ROLE_BENEFITS[roleKey]
                            const Icon = b.icon
                            return (
                                <div key={roleKey} className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl hover:border-terracotta/40 transition-all group">
                                    <div>
                                        <div className="w-14 h-14 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold mb-3">{b.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{b.desc}</p>
                                        
                                        <div className="space-y-2.5 pt-4 border-t border-border/60">
                                            {b.perks.map((p, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-foreground">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span>{p}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openModalForRole(roleKey)}
                                        className="mt-8 w-full py-3 px-4 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                                    >
                                        Join as {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* ── 3. WORLD-CLASS CHEFS SHOWCASE ───────────────── */}
                <section className="py-20 bg-card/60 border-t border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs font-bold text-terracotta uppercase tracking-widest mb-2 block">Verified Roster</span>
                            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-4">
                                World-Class Chefs Joining ChefMii Global
                            </h2>
                            <p className="text-muted-foreground text-base sm:text-lg">
                                Experience Michelin-starred masters and culinary innovators upon launch.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { name: 'Chef Yuki Tanaka', cuisine: 'Japanese Omakase', location: 'Dubai, UAE', badge: 'Omakase Master', rate: 200, photo: '/images/chefs/chef_yuki_tanaka.png' },
                                { name: 'Chef Marco Rossi', cuisine: 'Modern Italian', location: 'London, UK', badge: 'Fine Dining', rate: 150, photo: '/images/chefs/chef_marco_rossi.png' },
                                { name: 'Chef Sofía Mendez', cuisine: 'Spanish Tapas', location: 'Barcelona, Spain', badge: 'Tapas & Paella', rate: 120, photo: '/images/chefs/chef_sofia_mendez.png' },
                                { name: 'Chef Pierre Dubois', cuisine: 'French Haute Cuisine', location: 'Paris, France', badge: 'Haute Cuisine', rate: 180, photo: '/images/chefs/chef_pierre_dubois.png' },
                            ].map((chef, idx) => (
                                <div key={idx} className="bg-background rounded-3xl overflow-hidden border border-border group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="relative h-64 w-full overflow-hidden bg-muted">
                                        <Image
                                            src={chef.photo}
                                            alt={chef.name}
                                            fill
                                            unoptimized
                                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <span className="absolute top-3 right-3 text-xs px-2.5 py-1 bg-black/60 text-white rounded-full font-bold backdrop-blur-md border border-white/10">
                                            {chef.badge}
                                        </span>
                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <h4 className="font-bold text-lg">{chef.name}</h4>
                                            <p className="text-xs text-white/80">{chef.location}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between border-t border-border">
                                        <span className="text-xs font-semibold text-muted-foreground">{chef.cuisine}</span>
                                        <span className="text-sm font-black text-terracotta">£{chef.rate}/hr</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ChatbotWidget />

            <WaitlistModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                defaultRole={selectedRole}
            />
        </div>
    )
}
