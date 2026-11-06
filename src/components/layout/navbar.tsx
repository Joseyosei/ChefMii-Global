'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, dashboardHref } from '@/context/auth-context'
import {
    Moon, Sun, User, Menu, X, ChefHat, ChevronDown,
    LayoutDashboard, LogIn, UserPlus, LogOut, Loader2,
    Sparkles, Tv, GraduationCap, Accessibility
} from 'lucide-react'
import { useAccessibility } from '@/context/accessibility-context'

import { WaitlistModal } from '@/components/waitlist/waitlist-modal'
import { BrandLogo } from '@/components/layout/logo'
import { useCurrency, CURRENCIES, CurrencyCode } from '@/context/currency-context'

export function Navbar() {
    const router = useRouter()
    const { user, profile, role, signOut, signInWithGoogle, loading } = useAuth()
    const { currency, setCurrencyCode } = useCurrency()
    const { setIsOpen: setA11yOpen } = useAccessibility()

    const dropdownRef = useRef<HTMLDivElement>(null)
    const exploreRef = useRef<HTMLDivElement>(null)
    const currencyRef = useRef<HTMLDivElement>(null)

    const [mobileOpen, setMobileOpen] = useState(false)
    const [userOpen, setUserOpen] = useState(false)
    const [exploreOpen, setExploreOpen] = useState(false)
    const [currencyOpen, setCurrencyOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [dark, setDark] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const [waitlistOpen, setWaitlistOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 15)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setUserOpen(false)
            if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setExploreOpen(false)
            if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const toggleTheme = () => {
        setDark(d => { const n = !d; document.documentElement.classList.toggle('dark', n); return n })
    }

    const handleSignOut = async () => {
        setSigningOut(true)
        await signOut()
        setUserOpen(false); setMobileOpen(false)
        router.replace('/')
        setSigningOut(false)
    }

    const handleGoogleLogin = async () => {
        await signInWithGoogle()
        setUserOpen(false)
    }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.[0]?.toUpperCase() ?? '?'

    const EXPLORE_DROPDOWN_LINKS = [
        { href: '/order', label: '🍽️ Order Food Delivery', desc: 'Fresh chef meals delivered to your door' },
        { href: '/reviews', label: '⭐ Client & Business Reviews', desc: 'Verified dining ratings & testimonials' },
        { href: '/marketplace', label: '🛒 Chef Marketplace', desc: 'Artisanal ingredients & specialty produce' },
        { href: '/packages', label: '🎉 Event Packages', desc: 'Bespoke menus for weddings & parties' },
        { href: '/pricing', label: '💳 Subscription Plans', desc: 'Consumer & Business corporate tiers' },
        { href: '/kids-zone', label: "🧒 Kids' Zone", desc: 'Gamified cooking challenges & badges' },
    ]

    return (
        <header className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
            {/* FLOATING GLASSMORPHISM ISLAND CONTAINER */}
            <div className={`pointer-events-auto w-full max-w-6xl transition-all duration-300 rounded-full border shadow-2xl backdrop-blur-xl ${
                scrolled
                    ? 'bg-card/90 border-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.18)] py-2 px-4 sm:px-6'
                    : 'bg-card/75 border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-2.5 px-4 sm:px-6'
            }`}>
                <div className="flex items-center justify-between gap-2 sm:gap-4">

                    {/* Logo & Brand */}
                    <BrandLogo size="md" priority />

                    {/* Desktop Navigation Links (Clean & Categorized) */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {/* Primary Find Chefs Button */}
                        <Link
                            href="/find-chefs"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full gradient-brand text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <ChefHat className="w-3.5 h-3.5" />Find Chefs
                        </Link>

                        {/* Direct Essential Links */}
                        <Link
                            href="/chef-media"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <Tv className="w-3.5 h-3.5 text-terracotta" />ChefTV
                        </Link>

                        <Link
                            href="/academy"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />Academy
                        </Link>

                        {/* Explore Dropdown */}
                        <div className="relative" ref={exploreRef}>
                            <button
                                onClick={() => setExploreOpen(!exploreOpen)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted rounded-full transition-colors"
                            >
                                Explore <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {exploreOpen && (
                                <div className="absolute top-full left-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                                    {EXPLORE_DROPDOWN_LINKS.map(item => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setExploreOpen(false)}
                                            className="block p-2.5 rounded-xl hover:bg-muted transition-colors group"
                                        >
                                            <p className="text-xs font-bold text-foreground group-hover:text-terracotta transition-colors">{item.label}</p>
                                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Waitlist Highlight Pill */}
                        <Link
                            href="/waitlist"
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/30 text-xs font-bold hover:bg-terracotta hover:text-white transition-all shadow-sm ml-1"
                        >
                            Waitlist
                        </Link>
                    </nav>

                    {/* Right Actions (Currency, Theme, Messages, User Profile) */}
                    <div className="flex items-center gap-1.5">
                        {/* Currency Selector */}
                        <div className="relative" ref={currencyRef}>
                            <button
                                onClick={() => setCurrencyOpen(!currencyOpen)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors"
                                aria-label="Select currency"
                            >
                                <span>{currency.flag}</span>
                                <span>{currency.code}</span>
                                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {currencyOpen && (
                                <div className="absolute top-full right-0 mt-3 w-44 bg-card border border-border rounded-2xl shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                                        const c = CURRENCIES[code]
                                        return (
                                            <button
                                                key={code}
                                                onClick={() => {
                                                    setCurrencyCode(code)
                                                    setCurrencyOpen(false)
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                                    currency.code === code
                                                        ? 'gradient-brand text-white'
                                                        : 'hover:bg-muted text-foreground'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span>{c.flag}</span>
                                                    <span>{c.code}</span>
                                                </span>
                                                <span className="text-[11px] opacity-80">{c.symbol}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Accessibility Options */}
                        <button
                            onClick={() => setA11yOpen(true)}
                            className="w-8 h-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-foreground/80 hover:text-terracotta"
                            aria-label="Accessibility options (Alt + A)"
                            title="Accessibility options (Alt + A)"
                        >
                            <Accessibility className="w-4 h-4" />
                        </button>

                        {/* Dark mode */}
                        <button
                            onClick={toggleTheme}
                            className="w-8 h-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-foreground/70"
                            aria-label="Toggle theme"
                        >
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* Messages link */}
                        <Link
                            href="/messages"
                            className="hidden sm:flex w-8 h-8 rounded-full hover:bg-muted transition-colors items-center justify-center text-foreground/70"
                            aria-label="Messages"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </Link>

                        {/* User Profile / Menu */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setUserOpen(!userOpen)}
                                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                                aria-label="User menu"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                ) : user ? (
                                    <div className="w-7 h-7 rounded-full gradient-brand text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                                        {initials}
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground/70 hover:text-foreground">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </button>

                            {userOpen && (
                                <div className="absolute right-0 top-full mt-3 w-60 bg-card border border-border rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {user ? (
                                        <>
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="font-bold text-sm truncate">{profile?.full_name || 'User'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full gradient-brand text-white font-bold uppercase">
                                                    {role || 'client'}
                                                </span>
                                            </div>
                                            <Link href={dashboardHref(role)} onClick={() => setUserOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-colors">
                                                <LayoutDashboard className="w-4 h-4 text-terracotta" />My Dashboard
                                            </Link>
                                            <Link href="/messages" onClick={() => setUserOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-colors">
                                                <svg className="w-4 h-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                Messages
                                            </Link>
                                            <div className="border-t border-border my-1" />
                                            <button onClick={handleSignOut} disabled={signingOut}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                                                {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <div className="p-1 space-y-1">
                                            <Link href="/login" onClick={() => setUserOpen(false)}
                                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-colors">
                                                <LogIn className="w-4 h-4 text-terracotta" />Log In with Email
                                            </Link>
                                            <Link href="/register" onClick={() => setUserOpen(false)}
                                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-colors">
                                                <UserPlus className="w-4 h-4 text-terracotta" />Create Account
                                            </Link>
                                            <div className="p-1 pt-1.5">
                                                 <button onClick={handleGoogleLogin}
                                                     className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs">
                                                     <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                                     Continue with Google
                                                 </button>
                                             </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle */}
                        <button
                            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-foreground/70"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle navigation"
                        >
                            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileOpen && (
                    <div className="lg:hidden mt-3 bg-card/95 border border-border/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="space-y-2">
                            <Link
                                href="/find-chefs"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl gradient-brand text-white font-bold text-sm shadow-md"
                            >
                                <ChefHat className="w-4 h-4" />Find Chefs
                            </Link>

                            <Link
                                href="/waitlist"
                                onClick={() => setMobileOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-3 rounded-2xl bg-terracotta/15 text-terracotta font-bold text-sm border border-terracotta/30"
                            >
                                Join Waitlist
                            </Link>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link href="/chef-media" onClick={() => setMobileOpen(false)} className="p-3 bg-muted/60 rounded-xl text-xs font-bold text-center block">
                                    📺 ChefTV
                                </Link>
                                <Link href="/academy" onClick={() => setMobileOpen(false)} className="p-3 bg-muted/60 rounded-xl text-xs font-bold text-center block">
                                    🎓 Academy
                                </Link>
                                <Link href="/marketplace" onClick={() => setMobileOpen(false)} className="p-3 bg-muted/60 rounded-xl text-xs font-bold text-center block">
                                    🛒 Marketplace
                                </Link>
                                <Link href="/order" onClick={() => setMobileOpen(false)} className="p-3 bg-muted/60 rounded-xl text-xs font-bold text-center block">
                                    🍽️ Order Food
                                </Link>
                                <Link href="/packages" onClick={() => setMobileOpen(false)} className="p-3 bg-muted/60 rounded-xl text-xs font-bold text-center block">
                                    🎉 Packages
                                </Link>
                                <Link href="/kids-zone" onClick={() => setMobileOpen(false)} className="p-3 bg-muted/60 rounded-xl text-xs font-bold text-center block">
                                    🧒 Kids Zone
                                </Link>
                                <button
                                    onClick={() => { setMobileOpen(false); setA11yOpen(true) }}
                                    className="col-span-2 p-3 bg-stone-800 text-stone-100 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 border border-stone-700 hover:bg-stone-700"
                                >
                                    <Accessibility className="w-4 h-4 text-terracotta" />
                                    Accessibility Settings (Alt+A)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
        </header>
    )
}
