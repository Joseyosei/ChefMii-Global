'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, dashboardHref, type UserRole } from '@/context/auth-context'
import { Eye, EyeOff, Loader2, User as UserIcon, ChefHat, Building2, Check } from 'lucide-react'
import { BrandLogo } from '@/components/layout/logo'
import { BrandPanel, GoogleMark } from '@/components/auth/brand-panel'

/**
 * Create account.
 *
 * Matched to /login via the shared BrandPanel so the two pages read as one
 * pair. The old company-name and cuisine inputs were removed: the company
 * field was never wired to state, and neither value was passed to signUp, so
 * the form was asking for data it silently discarded. Chefs capture cuisine
 * properly in /become-a-chef/apply.
 */

const ROLES: { value: UserRole; title: string; desc: string; icon: typeof UserIcon }[] = [
    { value: 'client', title: 'Client', desc: 'Book chefs for events', icon: UserIcon },
    { value: 'chef', title: 'Chef', desc: 'Cook and get booked', icon: ChefHat },
    { value: 'business', title: 'Business', desc: 'Corporate catering', icon: Building2 },
]

const inputClass =
    'w-full px-4 py-3 min-h-[48px] rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all text-sm'

export default function RegisterPage() {
    const router = useRouter()
    const { signUp, signInWithGoogle } = useAuth()

    const [role, setRole] = useState<UserRole>('client')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSignUp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setError(null)

        if (!firstName.trim() || !email.trim() || !password) {
            setError('Fill in your name, email and a password.')
            return
        }
        if (password.length < 6) {
            setError('Use a password of at least 6 characters.')
            return
        }

        setLoading(true)
        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
            const res = await signUp(email.trim(), password, fullName, role)
            if (res.error) {
                setError(res.error)
                setLoading(false)
                return
            }
            setSuccess(true)
            setTimeout(() => router.push(dashboardHref(role)), 700)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'We could not create your account. Try again.')
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError(null)
        setGoogleLoading(true)
        try {
            const res = await signInWithGoogle()
            if (res.error) {
                setError(res.error)
                setGoogleLoading(false)
            } else {
                router.push(dashboardHref(role))
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-up did not complete. Try again.')
            setGoogleLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 text-white">
                        <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">You&apos;re in</h2>
                    <p className="text-muted-foreground text-sm">Taking you to your dashboard.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground">
            <BrandPanel />

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
                <div className="w-full max-w-sm py-4 space-y-6">
                    <div className="md:hidden">
                        <BrandLogo size="lg" />
                    </div>

                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-serif font-bold text-foreground">Create your account</h1>
                        <p className="text-muted-foreground text-sm">Free to join. Takes under a minute.</p>
                    </div>

                    {/* Role selection as cards */}
                    <div>
                        <span className="block text-sm font-semibold text-foreground mb-2">I&apos;m joining as</span>
                        <div className="grid grid-cols-3 gap-2">
                            {ROLES.map(({ value, title, desc, icon: Icon }) => {
                                const active = role === value
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRole(value)}
                                        aria-pressed={active}
                                        className={`text-left p-3 rounded-xl border transition-colors ${active
                                            ? 'border-terracotta bg-terracotta/10'
                                            : 'border-border bg-card hover:bg-muted'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-terracotta' : 'text-muted-foreground'}`} />
                                        <span className="block text-xs font-bold text-foreground">{title}</span>
                                        <span className="block text-[10px] text-muted-foreground leading-tight mt-0.5">{desc}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {error && (
                        <div role="alert" className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="reg-first" className="block text-sm font-semibold text-foreground mb-1.5">First name</label>
                                <input id="reg-first" autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="reg-last" className="block text-sm font-semibold text-foreground mb-1.5">Last name</label>
                                <input id="reg-last" autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reg-email" className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                            <input id="reg-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                        </div>

                        <div>
                            <label htmlFor="reg-password" className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="reg-password"
                                    type={showPw ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className={`${inputClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full min-h-[48px] py-3 gradient-brand text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm flex items-center justify-center gap-2 shadow-md"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account</> : 'Create account'}
                        </button>
                    </form>

                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={loading || googleLoading}
                        className="w-full min-h-[48px] py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-3 disabled:opacity-50 text-foreground"
                    >
                        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-terracotta" /> : <><GoogleMark /> Continue with Google</>}
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                        By creating an account you agree to our{' '}
                        <Link href="/terms" className="text-terracotta hover:underline">Terms</Link> and{' '}
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
