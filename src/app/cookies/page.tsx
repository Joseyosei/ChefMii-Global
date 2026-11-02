'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Cookie, ShieldCheck, Settings, CheckCircle, Info, RefreshCw } from 'lucide-react'

const COOKIE_TABLE = [
    {
        name: 'chefmii_session_user',
        provider: 'ChefMii Global Platform',
        category: 'Strictly Essential',
        purpose: 'Authenticates client and chef active user sessions and role permissions.',
        expiry: 'Session / 30 Days',
    },
    {
        name: 'chefmii_cookie_consent',
        provider: 'ChefMii Global Platform',
        category: 'Strictly Essential',
        purpose: 'Stores your granular GDPR cookie consent choices and preferences.',
        expiry: '12 Months',
    },
    {
        name: '__stripe_mid / __stripe_sid',
        provider: 'Stripe Payments Inc.',
        category: 'Strictly Essential',
        purpose: 'Fraud prevention, escrow account security, and payment tokenization.',
        expiry: '1 Year / 30 Mins',
    },
    {
        name: '_chefmii_analytics',
        provider: 'ChefMii Global Telemetry',
        category: 'Performance',
        purpose: 'Tracks route loading speed, chef search latency, and checkout flow reliability.',
        expiry: '6 Months',
    },
    {
        name: 'chefmii_dietary_pref',
        provider: 'ChefMii Global Platform',
        category: 'Personalization',
        purpose: 'Preserves your selected dietary allergies, halal/kosher, and cuisine filters.',
        expiry: '6 Months',
    },
]

export default function CookiePolicyPage() {
    const lastUpdated = 'August 17, 2026'

    const [saved, setSaved] = useState(false)
    const [prefs, setPrefs] = useState({
        essential: true,
        analytics: true,
        personalization: true,
        marketing: false,
    })

    useEffect(() => {
        try {
            const raw = localStorage.getItem('chefmii_cookie_consent')
            if (raw) {
                const parsed = JSON.parse(raw)
                setPrefs({
                    essential: true,
                    analytics: parsed.analytics ?? true,
                    personalization: parsed.personalization ?? true,
                    marketing: parsed.marketing ?? false,
                })
            }
        } catch {}
    }, [])

    const handleSave = () => {
        localStorage.setItem('chefmii_cookie_consent', JSON.stringify({ ...prefs, essential: true, date: new Date().toISOString() }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="border-b border-border pb-8 mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-4">
                            <Cookie className="w-4 h-4" />
                            Cookie Governance & Transparency
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-3">
                            Cookie Policy
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Last Updated: {lastUpdated} • Version 2.2
                        </p>
                    </div>

                    {/* Interactive Preferences Card */}
                    <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-md mb-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-terracotta" />
                                    Your Live Cookie Settings
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Manage your preferences directly on this device.</p>
                            </div>
                            {saved && (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full animate-fade-in flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Preferences Saved
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Essential */}
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">Strictly Essential</p>
                                    <p className="text-[11px] text-muted-foreground">Security, login, escrow billing</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    Always On
                                </span>
                            </div>

                            {/* Analytics */}
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">Analytics & Telemetry</p>
                                    <p className="text-[11px] text-muted-foreground">Performance and flow diagnostics</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.analytics}
                                    onChange={e => setPrefs({ ...prefs, analytics: e.target.checked })}
                                    className="w-4 h-4 accent-[#FF5A36] cursor-pointer"
                                />
                            </div>

                            {/* Personalization */}
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">Chef Personalization</p>
                                    <p className="text-[11px] text-muted-foreground">Dietary memory & search filters</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.personalization}
                                    onChange={e => setPrefs({ ...prefs, personalization: e.target.checked })}
                                    className="w-4 h-4 accent-[#FF5A36] cursor-pointer"
                                />
                            </div>

                            {/* Marketing */}
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-foreground">VIP Event Invites</p>
                                    <p className="text-[11px] text-muted-foreground">Masterclass tasting announcements</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={prefs.marketing}
                                    onChange={e => setPrefs({ ...prefs, marketing: e.target.checked })}
                                    className="w-4 h-4 accent-[#FF5A36] cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition-all"
                            >
                                Update Preferences
                            </button>
                        </div>
                    </div>

                    {/* Explanatory Sections */}
                    <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">1. What Are Cookies?</h2>
                            <p>
                                Cookies are small text files placed on your device by websites you visit. They help make websites work efficiently, provide personalized experiences, and provide operational telemetry to the platform operators.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">2. Active Cookies on ChefMii Global</h2>
                            <div className="overflow-x-auto rounded-2xl border border-border bg-white dark:bg-stone-900">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/60 border-b border-border text-foreground font-bold">
                                        <tr>
                                            <th className="p-3.5">Cookie Name</th>
                                            <th className="p-3.5">Category</th>
                                            <th className="p-3.5">Purpose</th>
                                            <th className="p-3.5">Lifespan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {COOKIE_TABLE.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/20">
                                                <td className="p-3.5 font-mono font-semibold text-foreground">{row.name}</td>
                                                <td className="p-3.5 font-bold text-terracotta">{row.category}</td>
                                                <td className="p-3.5">{row.purpose}</td>
                                                <td className="p-3.5 text-muted-foreground">{row.expiry}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">3. Browser Controls</h2>
                            <p>
                                Most modern web browsers allow you to control cookies through their settings preferences. To learn how to manage cookies on popular browsers, visit:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li>Google Chrome: Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
                                <li>Apple Safari: Preferences &gt; Privacy &gt; Manage Website Data</li>
                                <li>Mozilla Firefox: Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">4. Questions & Support</h2>
                            <p>
                                For any inquiries regarding our Cookie Policy, please contact{' '}
                                <a href="mailto:privacy@chefmii.com" className="text-terracotta underline font-bold">
                                    privacy@chefmii.com
                                </a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
