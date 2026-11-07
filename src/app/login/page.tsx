'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { useAuth, dashboardHref } from '@/context/auth-context'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/layout/logo'
import { BrandPanel, GoogleMark } from '@/components/auth/brand-panel'

/**
 * Sign-in.
 *
 * The amber "1-Click Instant Demo Login (Hackathon Access)" panel has been
 * removed. It called signInAsDemo(), which minted a localStorage-only session
 * with no real Firebase user behind it, letting any visitor one-click become a
 * "business" account. Real accounts only now; demo access for the owner is
 * provisioned by scripts/seed-demo-accounts.ts.
 */
function LoginContent() {
    const router = useRouter()
    const params = useSearchParams()
    const { signIn, signInWithGoogle, user, role } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [forgotSent, setForgotSent] = useState(false)

    const redirectTo = params.get('redirectTo')

    useEffect(() => {
        if (user && role) {
            router.push(redirectTo || dashboardHref(role))
        }
    }, [user, role, redirectTo, router])

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!email.trim() || !password.trim()) {
            setError('Enter your email and password.')
            return
        }
        setLoading(true)
        try {
            const res = await signIn(email.trim(), password)
            if (res.error) {
                setError(res.error)
                setLoading(false)
            } else {
                router.push(redirectTo || '/user-dashboard')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'That email and password did not match. Try again.')
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError(null)
        setGoogleLoading(true)
        try {
            const res = await signInWithGoogle()
            if (res.error) {
                setError(res.error)
                setGoogleLoading(false)
            } else {
                router.push(redirectTo || '/user-dashboard')
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-in did not complete. Try again.')
            setGoogleLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setError('Enter your email first, then tap reset.')
            return
        }
        setError(null)
        try {
            await sendPasswordResetEmail(auth, email.trim())
            setForgotSent(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Could not send the reset email. Check the address and try again.')
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground">
            <BrandPanel />

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-sm space-y-7">
                    <div className="md:hidden">
                        <BrandLogo size="lg" />
                    </div>

                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back</h1>
                        <p className="text-muted-foreground text-sm">Sign in to manage your bookings and dashboard.</p>
                    </div>

                    {error && (
                        <div role="alert" className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}
                    {forgotSent && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm">
                            Reset link sent. Check your inbox.
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <Field label="Email" htmlFor="login-email">
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Password" htmlFor="login-password">
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Your password"
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
                            <div className="flex justify-end mt-2">
                                <button type="button" onClick={handleForgotPassword} className="text-xs text-terracotta hover:underline font-semibold">
                                    Forgot password?
                                </button>
                            </div>
                        </Field>

                        <button
                            type="submit"
                            id="login-submit"
                            disabled={loading || googleLoading}
                            className="w-full min-h-[48px] py-3 gradient-brand text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm flex items-center justify-center gap-2 shadow-md"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in</> : 'Sign in'}
                        </button>
                    </form>

                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading || googleLoading}
                        className="w-full min-h-[48px] py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-3 disabled:opacity-50 text-foreground"
                    >
                        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-terracotta" /> : <><GoogleMark /> Continue with Google</>}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        New to ChefMii?{' '}
                        <Link href="/register" className="text-terracotta font-semibold hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

const inputClass =
    'w-full px-4 py-3 min-h-[48px] rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition-all text-sm'

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
            {children}
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
