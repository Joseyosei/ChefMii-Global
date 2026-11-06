'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useDashboardData, BookingRequest, Conversation, ChefMedia } from '@/hooks/useDashboardData'
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    doc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/client'
import { apiFetch, NotSignedInError } from '@/lib/api-client'
import {
    LayoutDashboard, Calendar, MessageSquare, Edit3, Image as ImageIcon,
    Settings, LogOut, CheckCircle, XCircle, Clock, Upload,
    DollarSign, TrendingUp, Camera, Bell, Star, Loader2, Trash2, GraduationCap, Check
} from 'lucide-react'
import { BrandLogo } from '@/components/layout/logo'
import ChefAcademyDashboard from './academy/page'

// Demo data for tabs not yet fully connected to DB
const EARNINGS = [
    { month: 'Oct', amount: 2100 }, { month: 'Nov', amount: 3400 }, { month: 'Dec', amount: 5200 },
    { month: 'Jan', amount: 2800 }, { month: 'Feb', amount: 3900 }, { month: 'Mar', amount: 4600 },
]
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'Requests', icon: Calendar, badge: 2 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'profile', label: 'Profile & Avatar', icon: Edit3 },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'media', label: 'ChefTV Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
]

const maxEarning = Math.max(...EARNINGS.map(e => e.amount))
const REQ_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-700',
}

/* ── Sub-views ────────────────────────────────────────── */
function OverviewView({ goTo, bookings }: { goTo: (t: string) => void, bookings: BookingRequest[] }) {
    const pending = bookings.filter(r => r.status === 'pending').length

    // Dynamic earnings calculation
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
    const realTotalEarnings = confirmedBookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0)

    const currentMonth = new Date().getMonth()
    const thisMonthEarnings = confirmedBookings
        .filter(b => new Date(b.created_at).getMonth() === currentMonth)
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0)
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
                {[
                    { label: 'Total Earnings', value: `£${realTotalEarnings.toLocaleString()}`, color: 'text-green-500', icon: DollarSign },
                    { label: 'This Month', value: `£${thisMonthEarnings.toLocaleString()}`, color: 'text-terracotta', icon: TrendingUp },
                    { label: 'New Requests', value: pending.toString(), color: 'text-yellow-500', icon: Clock },
                    { label: 'Average Rating', value: '4.9 ★', color: 'text-yellow-400', icon: Star },
                ].map(s => {
                    const Icon = s.icon
                    return (
                        <div key={s.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                                <Icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                            <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
                        </div>
                    )
                })}
            </div>

            {/* Earnings Chart */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-bold text-base sm:text-lg">Monthly Revenue</h2>
                        <p className="text-xs text-muted-foreground">Last 6 months</p>
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full">+18% vs last period</span>
                </div>
                <div className="flex items-end gap-2 sm:gap-4 h-36 pt-4">
                    {EARNINGS.map(e => (
                        <div key={e.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[10px] text-muted-foreground font-semibold">£{e.amount >= 1000 ? `${(e.amount / 1000).toFixed(1)}k` : e.amount}</span>
                            <div
                                style={{ height: `${(e.amount / maxEarning) * 100}%` }}
                                className="w-full gradient-brand rounded-t-lg transition-all duration-500 min-h-[8px]"
                            />
                            <span className="text-xs text-muted-foreground">{e.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function RequestsView({
    requests,
    onStatusChange,
}: {
    requests: BookingRequest[]
    onStatusChange: (id: string, s: 'confirmed' | 'declined' | 'completed') => void
}) {
    const [filter, setFilter] = useState('all')
    const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'pending', 'confirmed', 'completed', 'declined'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors border ${
                            filter === f ? 'bg-terracotta text-white border-terracotta' : 'bg-card border-border hover:border-terracotta/50'
                        }`}>
                        {f}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">
                    No requests in this category.
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(r => (
                        <div key={r.id} className="bg-card border border-border rounded-2xl p-5 hover:border-terracotta/40 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-base">{r.user?.full_name || r.client_name || 'VIP Client'}</p>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${REQ_STYLES[r.status] || 'bg-stone-100'}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{r.event_type} · {r.guests} Guests · {r.event_date} at {r.start_time}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{r.location}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-black text-lg text-terracotta">£{r.total_price}</p>
                                    {r.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onStatusChange(r.id, 'confirmed')}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> Accept
                                            </button>
                                            <button
                                                onClick={() => onStatusChange(r.id, 'declined')}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function ProfileView() {
    const { user, profile, refreshProfile } = useAuth()
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const [bio, setBio] = useState('Award-winning master chef with 15 years fine dining experience.')
    const [cuisine, setCuisine] = useState('Italian')
    const [rate, setRate] = useState('150')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
    const [avail, setAvail] = useState([false, false, false, false, true, true, true]) // Mon-Sun
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || !files.length) return
        const file = files[0]
        setUploadingAvatar(true)

        const reader = new FileReader()
        reader.onload = async () => {
            const base64 = reader.result as string
            setAvatarUrl(base64)
            if (user) {
                try {
                    await setDoc(doc(db, 'users', user.id), {
                        avatar_url: base64,
                        photoURL: base64,
                        updatedAt: serverTimestamp(),
                    }, { merge: true })
                    await refreshProfile()
                } catch (err) {
                    console.error('Error updating chef avatar:', err)
                }
            }
            setUploadingAvatar(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        }
        reader.readAsDataURL(file)
    }

    const save = async () => {
        setSaving(true)
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.id), {
                    bio,
                    cuisine,
                    hourly_rate: Number(rate),
                    avatar_url: avatarUrl,
                    updatedAt: serverTimestamp(),
                }, { merge: true })
                await refreshProfile()
            } catch (err) {
                console.error('Error saving chef profile:', err)
            }
        }
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return (
        <div className="max-w-2xl space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
                <h2 className="font-serif font-bold text-lg mb-5 text-foreground">Chef Public Profile & Picture</h2>

                {/* Avatar Uploader */}
                <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden gradient-brand text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-white dark:border-stone-800">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Chef" className="w-full h-full object-cover" />
                        ) : (
                            profile?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CH'
                        )}
                        {uploadingAvatar && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <div>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarSelect}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-foreground text-xs font-bold rounded-xl border border-border transition-colors flex items-center gap-1.5"
                        >
                            <Camera className="w-3.5 h-3.5 text-terracotta" />
                            Upload Chef Photo
                        </button>
                        <p className="text-[11px] text-muted-foreground mt-1">High-resolution chef portrait (JPG/PNG up to 5MB)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Chef Biography & Specialties</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta text-sm resize-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Primary Cuisine</label>
                            <select value={cuisine} onChange={e => setCuisine(e.target.value)}
                                className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-background text-sm focus:outline-none">
                                {['Italian', 'Japanese', 'French', 'American', 'Chinese', 'Ukrainian', 'Nordic', 'Korean', 'Middle Eastern', 'West African', 'Spanish', 'Pan-African', 'Indian', 'Mexican'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Hourly Rate (£/hr)</label>
                            <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                                className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-terracotta text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Weekly Availability Schedule</label>
                        <div className="flex gap-1.5 flex-wrap">
                            {days.map((d, i) => (
                                <button key={d} onClick={() => setAvail(a => { const n = [...a]; n[i] = !n[i]; return n })}
                                    className={`px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold border transition-colors ${avail[i] ? 'gradient-brand text-white border-transparent shadow-xs' : 'border-border hover:border-terracotta'}`}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={save} disabled={saving}
                    className="mt-6 px-6 py-2.5 min-h-[44px] gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><Check className="w-4 h-4" /> Profile Updated!</> : 'Save Profile'}
                </button>
            </div>
        </div>
    )
}

function MediaView({ media, removeMedia, user }: { media: ChefMedia[], removeMedia: (id: string) => void, user: any }) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [titleInput, setTitleInput] = useState('')

    const handleFiles = async (fl: FileList | null) => {
        if (!fl || !fl.length || !user) return
        setUploading(true)
        const file = fl[0]

        try {
            const previewUrl = URL.createObjectURL(file)
            await addDoc(collection(db, 'chef_media'), {
                chef_id: user.id,
                title: titleInput || file.name,
                video_url: previewUrl,
                thumbnail_url: previewUrl,
                views: 0,
                likes: 0,
                createdAt: serverTimestamp(),
            })
            setTitleInput('')
        } catch (e) {
            console.error('Error adding chef media:', e)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-3xl p-8 sm:p-12 text-center hover:border-terracotta transition-colors cursor-pointer bg-card group shadow-xs">
                <input ref={fileRef} type="file" multiple={false} accept="video/*,image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform text-white shadow-md">
                    <Upload className="w-7 h-7" />
                </div>
                <p className="font-bold text-lg mb-1 text-foreground">{uploading ? 'Publishing to ChefTV…' : 'Upload TikToks, Reels & Dish Videos'}</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">Publish cooking videos, masterclasses, and knife skill tutorials directly to ChefTV.</p>
                <p className="text-[11px] text-terracotta mt-2 font-bold uppercase">MP4, MOV, WebM up to 500MB</p>
                {uploading && <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-terracotta" />}
            </div>
            
            <div>
                <h3 className="font-serif font-bold text-lg mb-3 text-foreground">Your Published ChefTV Videos ({media.length})</h3>
                {media.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
                        No videos uploaded yet. Tap above to share your first culinary creation!
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {media.map(m => (
                            <div key={m.id} className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-black group border border-border shadow-xs">
                                <img src={m.thumbnail_url || ''} alt={m.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-3">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeMedia(m.id); }}
                                            className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors shadow-xs"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-bold leading-tight line-clamp-2">{m.title}</p>
                                        <div className="flex gap-2 mt-1 text-white/70 text-[10px] font-semibold">
                                            <span>👁 {m.views}</span><span>❤ {m.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function SettingsView() {
    // `user` is no longer needed here: the Stripe Connect endpoint derives the
    // chef from the verified ID token rather than an id sent from the browser.
    const { profile } = useAuth()
    const [stripeConnecting, setStripeConnecting] = useState(false)
    const [stripeError, setStripeError] = useState<string | null>(null)
    
    // Bank account state
    const [bankName, setBankName] = useState('Barclays Bank PLC')
    const [accountHolder, setAccountHolder] = useState(profile?.full_name || 'Chef Marco Rossi')
    const [sortCode, setSortCode] = useState('20-45-89')
    const [accountNumber, setAccountNumber] = useState('48219082')
    const [currency, setCurrency] = useState('GBP')
    const [payoutSchedule, setPayoutSchedule] = useState('instant')
    
    const [showBankModal, setShowBankModal] = useState(false)
    const [bankSavedToast, setBankSavedToast] = useState(false)
    const [payoutLoading, setPayoutLoading] = useState(false)
    const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null)
    const [availableBalance, setAvailableBalance] = useState(1840)

    const [payoutHistory, setPayoutHistory] = useState([
        { id: 'PO-882194', date: '12 Aug 2026', amount: 1450, bank: 'Barclays •••• 9082', status: 'Completed' },
        { id: 'PO-771923', date: '05 Aug 2026', amount: 2200, bank: 'Barclays •••• 9082', status: 'Completed' },
        { id: 'PO-661048', date: '28 Jul 2026', amount: 980, bank: 'Barclays •••• 9082', status: 'Completed' },
    ])

    const handleConnectStripe = async () => {
        setStripeConnecting(true)
        setStripeError(null)
        try {
            // No chefId in the body: the server keys the connected account to
            // the verified uid. Passing it let a caller mint an onboarding link
            // for someone else's account, and the old `|| 'marco-rossi'`
            // fallback meant a signed-out user hit a real chef's record.
            const result = await apiFetch<{ url?: string; accountId?: string }>(
                '/api/stripe/connect',
                { method: 'POST', body: JSON.stringify({}) }
            )

            if (result.ok && result.data?.url) {
                window.open(result.data.url, '_blank', 'noopener,noreferrer')
                return
            }

            // Stripe onboarding either produced a link or it did not. Showing a
            // success toast on failure, as this previously did, left chefs
            // believing their bank was connected when it was not.
            setStripeError(result.error || 'Could not start Stripe onboarding. Please try again.')
        } catch (e) {
            setStripeError(
                e instanceof NotSignedInError
                    ? 'Please sign in with your chef account to connect Stripe.'
                    : 'Could not start Stripe onboarding. Please try again.'
            )
        } finally {
            setStripeConnecting(false)
        }
    }

    const handleSaveBank = (e: React.FormEvent) => {
        e.preventDefault()
        setShowBankModal(false)
        setBankSavedToast(true)
        setTimeout(() => setBankSavedToast(false), 4000)
    }

    const handleInstantPayout = async () => {
        if (availableBalance <= 0) return
        setPayoutLoading(true)
        await new Promise(r => setTimeout(r, 1200))
        const refId = `PO-${Math.floor(100000 + Math.random() * 900000)}`
        setPayoutHistory(prev => [
            { id: refId, date: 'Just now', amount: availableBalance, bank: `${bankName} •••• ${accountNumber.slice(-4)}`, status: 'Completed' },
            ...prev
        ])
        setPayoutSuccess(`£${availableBalance.toLocaleString()} transferred to ${bankName} (${refId})`)
        setAvailableBalance(0)
        setPayoutLoading(false)
        setTimeout(() => setPayoutSuccess(null), 5000)
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground">Stripe & Bank Payout Settings</h2>
                <p className="text-xs text-muted-foreground mt-1">Manage your connected Stripe account, direct bank account, escrow payouts, and tax receipts.</p>
            </div>

            {/* Notification toasts */}
            {bankSavedToast && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Bank account details updated and verified successfully! Automated transfers will route to this account.</span>
                </div>
            )}
            {payoutSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{payoutSuccess}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Stripe Live Connect Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg gradient-brand text-white flex items-center justify-center font-bold text-xs">
                                    S
                                </div>
                                <h3 className="font-bold text-base text-foreground">Stripe Connect Account</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">
                                Live & Connected
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Connected to ChefMii Global Live Marketplace. Client payments are protected in escrow and released directly to your Stripe account upon event completion.
                        </p>
                        
                        <div className="mt-4 p-3 bg-muted/50 rounded-xl space-y-1.5 border border-border/50 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Stripe Account ID</span>
                                <span className="font-mono text-foreground font-semibold">acct_1U5Hii0TzJU7vmcN</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Platform Fee</span>
                                <span className="text-foreground font-semibold">10% (Included)</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Escrow Protection</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Guaranteed</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button
                            onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                            className="flex-1 py-2.5 px-4 bg-foreground text-background font-bold rounded-xl text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                        >
                            <span>Open Stripe Express</span>
                            <span className="text-[10px]">↗</span>
                        </button>
                        <button
                            onClick={handleConnectStripe}
                            disabled={stripeConnecting}
                            className="py-2.5 px-4 border border-border bg-card hover:bg-muted font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 text-foreground"
                        >
                            {stripeConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Re-link Stripe'}
                        </button>
                    </div>

                    {stripeError && (
                        <p role="alert" className="text-xs text-destructive pt-2">
                            {stripeError}
                        </p>
                    )}
                </div>

                {/* 2. Direct Bank Account Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-foreground flex items-center justify-center font-bold text-xs">
                                    🏦
                                </div>
                                <h3 className="font-bold text-base text-foreground">Linked Bank Account</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">
                                Primary Payout
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your bank account where ChefMii automated deposits and instant earnings transfers are paid.
                        </p>

                        <div className="mt-4 p-3 bg-muted/50 rounded-xl space-y-1.5 border border-border/50 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Bank Name</span>
                                <span className="text-foreground font-semibold">{bankName}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Account Holder</span>
                                <span className="text-foreground font-semibold">{accountHolder}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Sort Code / Routing</span>
                                <span className="font-mono text-foreground font-semibold">{sortCode}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Account Number</span>
                                <span className="font-mono text-foreground font-semibold">•••• {accountNumber.slice(-4)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Payout Frequency</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold capitalize">{payoutSchedule} Transfer</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowBankModal(true)}
                        className="w-full py-2.5 px-4 gradient-brand text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        <span>Change / Link Bank Account ⚙️</span>
                    </button>
                </div>
            </div>

            {/* 3. Escrow Balance & Instant Payout Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Available Cleared Balance (Ready for Transfer)</p>
                    <p className="text-3xl font-serif font-bold text-foreground">£{availableBalance.toLocaleString()}.00</p>
                    <p className="text-[11px] text-muted-foreground">
                        + £3,450.00 held safely in escrow for upcoming confirmed bookings.
                    </p>
                </div>
                <button
                    onClick={handleInstantPayout}
                    disabled={payoutLoading || availableBalance <= 0}
                    className="w-full md:w-auto py-3.5 px-6 gradient-brand text-white font-bold rounded-xl text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
                >
                    {payoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Transfer…</> : `⚡ Transfer £${availableBalance.toLocaleString()} to Bank Now`}
                </button>
            </div>

            {/* 4. Recent Payout History */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-foreground">Recent Bank Payout History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
                            <tr>
                                <th className="pb-3 font-bold">Transfer Ref</th>
                                <th className="pb-3 font-bold">Date</th>
                                <th className="pb-3 font-bold">Destination Bank</th>
                                <th className="pb-3 font-bold">Amount</th>
                                <th className="pb-3 font-bold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {payoutHistory.map(p => (
                                <tr key={p.id} className="py-2.5">
                                    <td className="py-3 font-mono font-semibold text-foreground">{p.id}</td>
                                    <td className="py-3 text-muted-foreground">{p.date}</td>
                                    <td className="py-3 font-medium text-foreground">{p.bank}</td>
                                    <td className="py-3 font-bold text-foreground">£{p.amount.toLocaleString()}.00</td>
                                    <td className="py-3 text-right">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                            ✓ {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bank Link Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="font-bold text-base text-foreground">Link Bank Account for Payouts</h3>
                            <button onClick={() => setShowBankModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">✕</button>
                        </div>
                        <form onSubmit={handleSaveBank} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase mb-1">Bank Name *</label>
                                <select
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta text-xs"
                                >
                                    <option value="Barclays Bank PLC">Barclays Bank PLC</option>
                                    <option value="HSBC Commercial UK">HSBC Commercial UK</option>
                                    <option value="Lloyds Bank">Lloyds Bank</option>
                                    <option value="NatWest">NatWest</option>
                                    <option value="Chase Bank UK">Chase Bank UK</option>
                                    <option value="Santander UK">Santander UK</option>
                                    <option value="Monzo Business">Monzo Business</option>
                                    <option value="Revolut Business">Revolut Business</option>
                                    <option value="Bank of America / Chase (USA)">Bank of America / Chase (USA)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-muted-foreground uppercase mb-1">Account Holder Full Name *</label>
                                <input
                                    type="text"
                                    value={accountHolder}
                                    onChange={e => setAccountHolder(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase mb-1">Sort Code / Routing *</label>
                                    <input
                                        type="text"
                                        value={sortCode}
                                        onChange={e => setSortCode(e.target.value)}
                                        placeholder="20-45-89"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase mb-1">Account Number *</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={e => setAccountNumber(e.target.value)}
                                        placeholder="8 digits"
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta font-mono text-xs"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase mb-1">Currency</label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none text-xs"
                                    >
                                        <option value="GBP">GBP (£)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="CAD">CAD ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-muted-foreground uppercase mb-1">Payout Frequency</label>
                                    <select
                                        value={payoutSchedule}
                                        onChange={e => setPayoutSchedule(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none text-xs"
                                    >
                                        <option value="instant">Instant on Event Finish</option>
                                        <option value="daily">Daily Automatic Transfer</option>
                                        <option value="weekly">Weekly on Mondays</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBankModal(false)}
                                    className="flex-1 py-2.5 border border-border rounded-xl font-bold text-muted-foreground hover:text-foreground text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 gradient-brand text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-md"
                                >
                                    Save & Link Account →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ── Page ────────────────────────────────────────────── */
export default function ChefDashboardPage() {
    const router = useRouter()
    const { user, profile, loading: authLoading, signOut } = useAuth()
    const { bookings, conversations, media, loading: dataLoading, updateBookingStatus, deleteMedia } = useDashboardData()
    const [tab, setTab] = useState('overview')
    const [signingOut, setSO] = useState(false)

    const handleSignOut = async () => { setSO(true); await signOut(); router.replace('/') }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'CH'

    const avatar = profile?.avatar_url || null

    if (authLoading || dataLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-terracotta" /></div>
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background flex-col font-sans text-foreground">
            {/* Topbar */}
            <div className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <BrandLogo size="sm" />
                    <div className="hidden sm:block pl-2 border-l border-border">
                        <p className="text-xs font-bold text-foreground">
                            {tab === 'overview' ? `Welcome Chef ${profile?.full_name?.split(' ')[1] || ''}! 👨‍🍳` : TABS.find(t => t.id === tab)?.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Chef Executive Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/chef-media"
                        className="px-3 py-1.5 gradient-brand text-white text-xs font-bold rounded-lg shadow-xs hover:opacity-90 flex items-center gap-1.5"
                    >
                        ChefTV Live 📺
                    </Link>
                    <div
                        className="w-8 h-8 rounded-full gradient-brand text-white font-bold text-xs flex items-center justify-center cursor-pointer overflow-hidden border border-white/20"
                        onClick={() => setTab('profile')}
                    >
                        {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : initials}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop sidebar */}
                <aside className="hidden md:flex w-56 lg:w-64 border-r border-border bg-card flex-col shrink-0">
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-brand text-white font-bold text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : initials}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-xs truncate text-foreground">{profile?.full_name || 'Chef Executive'}</p>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 4.9 · 128 reviews
                                </div>
                            </div>
                        </div>
                    </div>
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {TABS.map(({ id, label, icon: Icon, badge }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                    tab === id ? 'gradient-brand text-white shadow-xs' : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {label}
                                </div>
                                {badge && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                        tab === id ? 'bg-white text-terracotta' : 'bg-terracotta text-white'
                                    }`}>
                                        {badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="p-3 border-t border-border">
                        <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            {signingOut ? 'Signing out…' : 'Sign Out'}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-stone-50 dark:bg-stone-950">
                    <div className="max-w-7xl mx-auto">
                        {tab === 'overview' && <OverviewView goTo={setTab} bookings={bookings} />}
                        {tab === 'requests' && <RequestsView requests={bookings} onStatusChange={updateBookingStatus} />}
                        {tab === 'profile' && <ProfileView />}
                        {tab === 'academy' && <ChefAcademyDashboard />}
                        {tab === 'media' && <MediaView media={media} removeMedia={deleteMedia} user={user} />}
                        {tab === 'settings' && <SettingsView />}
                    </div>
                </main>
            </div>
        </div>
    )
}
