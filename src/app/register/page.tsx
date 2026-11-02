'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from '@/context/auth-context'
import { ChefHat, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/layout/logo'

export default function RegisterPage() {
    const router = useRouter()
    const { signUp } = useAuth()

    const [role, setRole] = useState<UserRole>('client')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [cuisine, setCuisine] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSignUp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setError(null)
        if (!email || !password || !firstName || !lastName) {
            setError('Please fill in all required fields.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        setLoading(true)
        try {
            const fullName = `${firstName} ${lastName}`.trim()
            const res = await signUp(email, password, fullName, role)
            if (res.error) {
                setError(res.error)
                setLoading(false)
                return
            }
            setSuccess(true)
            setTimeout(() => {
                const map: Record<UserRole, string> = {
                    client: '/user-dashboard',
                    chef: '/chef-dashboard',
                    business: '/business-dashboard',
                    admin: '/user-dashboard',
                    kids: '/kids-zone',
                    influencer: '/user-dashboard',
                    farmer: '/marketplace',
                }
                router.push(map[role] || '/user-dashboard')
            }, 800)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4 text-white">
                        <ChefHat className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold mb-2">Welcome to ChefMii Global!</h2>
                    <p className="text-muted-foreground text-sm">Taking you to your dashboard…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Left dark panel — hidden on mobile */}
            <div className="hidden md:flex flex-1 bg-[#1a1a1a] items-center justify-center p-12">
                <div className="text-white max-w-md">
                    <div className="mb-8 p-3 bg-white rounded-2xl inline-block shadow-lg">
                        <BrandLogo size="lg" />
                    </div>
                    <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">
                        Join the world&apos;s premier private chef marketplace
                    </h2>
                    <div className="space-y-4 mt-8">
                        {[
                            { icon: '👤', title: 'For Clients', desc: 'Book world-class chefs for any event' },
                            { icon: '👨‍🍳', title: 'For Chefs', desc: 'Build your business and reach thousands of clients' },
                            { icon: '🏢', title: 'For Businesses', desc: 'Manage corporate events and team catering at scale' },
                        ].map(item => (
                            <div key={item.title} className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-white/60 text-xs">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
                <div className="w-full max-w-md py-6">
                    {/* Mobile logo */}
                    <div className="mb-8 md:hidden">
                        <BrandLogo size="lg" />
                    </div>

                    <h1 className="text-3xl font-serif font-bold mb-2">Create Account</h1>
                    <p className="text-muted-foreground mb-6">Start your ChefMii Global journey today — it&apos;s free.</p>

                    {/* Role toggle */}
                    <div className="flex rounded-xl border border-border overflow-hidden mb-6">
                        {(['client', 'chef', 'business'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors min-h-[44px] ${role === r ? 'gradient-brand text-white' : 'bg-card text-foreground hover:bg-muted'
                                    }`}
                            >
                                {r === 'client' ? '👤 Client' : r === 'chef' ? '👨‍🍳 Chef' : '🏢 Business'}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">First Name *</label>
                                <input
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder="John"
                                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-terracotta text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Last Name</label>
                                <input
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-terracotta text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Email *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-terracotta text-sm"
                            />
                        </div>

                        {role === 'chef' && (
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Cuisine Specialty</label>
                                <input
                                    value={cuisine}
                                    onChange={e => setCuisine(e.target.value)}
                                    placeholder="e.g. Italian, Japanese, French"
                                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-terracotta text-sm"
                                />
                            </div>
                        )}

                        {role === 'business' && (
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Company Name</label>
                                <input
                                    placeholder="e.g. Apex Enterprises Ltd"
                                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-terracotta text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Password *</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-terracotta text-sm"
                            />
                        </div>

                        <button
                            id="register-submit"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full min-h-[44px] py-3 gradient-brand text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</>
                                : `Create Account as ${role === 'client' ? 'Client' : role === 'chef' ? 'Chef' : 'Business'} →`
                            }
                        </button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-4 mb-6">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-terracotta hover:underline">Terms</Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-terracotta hover:underline">Privacy Policy</Link>.
                    </p>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-terracotta font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
