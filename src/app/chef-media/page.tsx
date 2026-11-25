'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase/client'
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    increment,
    serverTimestamp,
} from 'firebase/firestore'
import { useAuth } from '@/context/auth-context'
import {
    Heart, MessageCircle, Bookmark, Share2, Volume2, VolumeX,
    Plus, X, ChefHat, Search, Home, Bell, User as UserIcon,
    Send, Loader2, Upload, CheckCircle, Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/layout/logo'
import { uploadChefMediaVideo, MediaUploadError } from '@/lib/chefs/media-upload-client'
import {
    toggleLike,
    toggleFollow,
    loadLikedMediaIds,
    loadFollowedChefIds,
} from '@/lib/chefs/engagement-client'

/* ── Types ───────────────────────────────────────────────────── */
interface MediaItem {
    id: string
    chef_id: string
    video_url: string
    thumbnail_url: string | null
    title: string
    description: string | null
    cuisine_tags: string[]
    likes: number
    views: number
    bookings_generated: number
    comments_count: number
    created_at: string
    chef?: { full_name: string | null; avatar_url: string | null }
    isLiked?: boolean
    isSaved?: boolean
    isFollowed?: boolean
    chef_slug?: string
    score?: number
}

interface Comment {
    id: string
    user_id: string
    content: string
    created_at: string
    user?: { full_name: string | null }
}

/* ── Seed data (shown when DB empty) ────────────────────────── */
/* ── Seed data (16 International Master Chefs Proprietary Culinary Showcases) ── */
const SEED: MediaItem[] = [
    {
        id: 's1', chef_id: 'marco-rossi',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_marco_rossi.png',
        title: 'Authentic Roman Carbonara with Guanciale 🍝',
        description: 'Tossed in pecorino and rich egg yolk emulsion. No cream needed, pure Italian technique!',
        cuisine_tags: ['italian', 'pasta', 'carbonara', 'london'],
        likes: 48200, views: 534000, bookings_generated: 78, comments_count: 384,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        chef: { full_name: 'Chef Marco Rossi', avatar_url: '/images/chefs/chef_marco_rossi.png' },
    },
    {
        id: 's2', chef_id: 'yuki-tanaka',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_yuki_tanaka.png',
        title: 'Omakase Nigiri Slicing & Torched Otoro 🍣',
        description: '14-course Toyosu Market fresh bluefin tuna, sea urchin, and A5 Wagyu nigiri.',
        cuisine_tags: ['japanese', 'sushi', 'omakase', 'tokyo'],
        likes: 64100, views: 812000, bookings_generated: 112, comments_count: 622,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        chef: { full_name: 'Chef Yuki Tanaka', avatar_url: '/images/chefs/chef_yuki_tanaka.png' },
    },
    {
        id: 's3', chef_id: 'marcus-vance',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_marcus_vance.png',
        title: '18-Hour Hickory Smoked Prime Brisket 🔥🥩',
        description: 'Deep mahogany smoke ring, caramelized bark, and melted collagen tenderness.',
        cuisine_tags: ['american', 'bbq', 'brisket', 'austin'],
        likes: 39500, views: 420000, bookings_generated: 64, comments_count: 490,
        created_at: new Date(Date.now() - 10800000).toISOString(),
        chef: { full_name: 'Chef Marcus Vance', avatar_url: '/images/chefs/chef_marcus_vance.png' },
    },
    {
        id: 's4', chef_id: 'aisha-okafor',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_aisha_okafor.png',
        title: 'Smoky Firewood Party Jollof & Dodo 🌍🍛',
        description: 'Simmered in habanero-bell pepper reduction with chargrilled tiger prawns.',
        cuisine_tags: ['westAfrican', 'jollof', 'lagos', 'london'],
        likes: 52000, views: 680000, bookings_generated: 91, comments_count: 890,
        created_at: new Date(Date.now() - 14400000).toISOString(),
        chef: { full_name: 'Chef Aisha Okafor', avatar_url: '/images/chefs/chef_aisha_okafor.png' },
    },
    {
        id: 's5', chef_id: 'pierre-dubois',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_pierre_dubois.png',
        title: 'Crispy Duck Breast with Orange Blossom Glaze 🦆',
        description: 'Classic French haute cuisine reduction served with pomme purée.',
        cuisine_tags: ['french', 'michelin', 'paris'],
        likes: 31600, views: 398000, bookings_generated: 52, comments_count: 267,
        created_at: new Date(Date.now() - 18000000).toISOString(),
        chef: { full_name: 'Chef Pierre Dubois', avatar_url: '/images/chefs/chef_pierre_dubois.png' },
    },
    {
        id: 's6', chef_id: 'sofia-mendez',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_sofia_mendez.png',
        title: 'Valencian Giant Carabineros Paella with Socarrat 🥘',
        description: 'Saffron bomba rice with crispy bottom crust and Mediterranean wild langoustines.',
        cuisine_tags: ['spanish', 'paella', 'barcelona'],
        likes: 29800, views: 344000, bookings_generated: 48, comments_count: 303,
        created_at: new Date(Date.now() - 21600000).toISOString(),
        chef: { full_name: 'Chef Sofía Mendez', avatar_url: '/images/chefs/chef_sofia_mendez.png' },
    },
    {
        id: 's7', chef_id: 'wei-zhang',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_wei_zhang.png',
        title: 'Handcrafted Xiao Long Bao Soup Dumplings 🥟',
        description: 'Delicate 18-fold pleating with rich gelatinous broth and Berkshire pork.',
        cuisine_tags: ['chinese', 'dimsum', 'dumplings', 'shanghai'],
        likes: 47800, views: 560000, bookings_generated: 82, comments_count: 512,
        created_at: new Date(Date.now() - 25200000).toISOString(),
        chef: { full_name: 'Chef Wei Zhang', avatar_url: '/images/chefs/chef_wei_zhang.png' },
    },
    {
        id: 's8', chef_id: 'meera-patel',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_meera_patel.png',
        title: 'Royal Awadhi Dum Biryani Sealed in Clay Handi 🍲',
        description: 'Slow cooked over charcoal with aged basmati, saffron milk, and rose water.',
        cuisine_tags: ['indian', 'biryani', 'ayurvedic', 'mumbai'],
        likes: 38900, views: 491000, bookings_generated: 65, comments_count: 441,
        created_at: new Date(Date.now() - 28800000).toISOString(),
        chef: { full_name: 'Chef Meera Patel', avatar_url: '/images/chefs/chef_meera_patel.png' },
    },
    {
        id: 's9', chef_id: 'elena-beauchamp',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_elena_beauchamp.png',
        title: 'Quebec Duck Breast with Wild Blueberry Demi-Glace 🍁',
        description: 'Laurentian forest foraged mushrooms with maple glazed seasonal root vegetables.',
        cuisine_tags: ['canadian', 'quebec', 'french'],
        likes: 24500, views: 290000, bookings_generated: 39, comments_count: 198,
        created_at: new Date(Date.now() - 32400000).toISOString(),
        chef: { full_name: 'Chef Elena Beauchamp', avatar_url: '/images/chefs/chef_elena_beauchamp.png' },
    },
    {
        id: 's10', chef_id: 'henrik-lindqvist',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_henrik_lindqvist.png',
        title: 'Nordic Cold-Smoked Arctic Trout with Dill Emulsion 🌲',
        description: 'Stockholm archipelago cured fish with juniper smoke and pickled sea buckthorn.',
        cuisine_tags: ['nordic', 'seafood', 'stockholm'],
        likes: 31200, views: 375000, bookings_generated: 44, comments_count: 230,
        created_at: new Date(Date.now() - 36000000).toISOString(),
        chef: { full_name: 'Chef Henrik Lindqvist', avatar_url: '/images/chefs/chef_henrik_lindqvist.png' },
    },
    {
        id: 's11', chef_id: 'min-jun-park',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_min_jun_park.png',
        title: 'Sizzling 1++ Hanwoo Ribeye with Aged Kimchi & Perilla 🥩',
        description: 'Charcoal grilled table-side with 5-year aged doenjang paste and banchan.',
        cuisine_tags: ['korean', 'bbq', 'hanwoo', 'seoul'],
        likes: 54900, views: 710000, bookings_generated: 95, comments_count: 672,
        created_at: new Date(Date.now() - 39600000).toISOString(),
        chef: { full_name: 'Chef Min-Jun Park', avatar_url: '/images/chefs/chef_min_jun_park.png' },
    },
    {
        id: 's12', chef_id: 'tariq-al-ghamdi',
        video_url: '',
        thumbnail_url: '/images/chefs/chef_tariq_al_ghamdi.png',
        title: 'Royal Najdi Lamb Shank with Saffron Cardamom Rice 🍚',
        description: 'Tender fall-off-the-bone lamb shank garnished with golden pine nuts and raisins.',
        cuisine_tags: ['middleEastern', 'arabic', 'dubai'],
        likes: 42300, views: 520000, bookings_generated: 71, comments_count: 489,
        created_at: new Date(Date.now() - 43200000).toISOString(),
        chef: { full_name: 'Chef Tariq Al-Ghamdi', avatar_url: '/images/chefs/chef_tariq_al_ghamdi.png' },
    },
]

/* ── Algorithm: score each item ─────────────────────────────── */
function scoreItems(items: MediaItem[]): MediaItem[] {
    const maxLikes = Math.max(...items.map(i => i.likes), 1)
    const maxViews = Math.max(...items.map(i => i.views), 1)
    const maxBookings = Math.max(...items.map(i => i.bookings_generated), 1)
    const now = Date.now()

    return [...items]
        .map(item => {
            const hoursSince = (now - new Date(item.created_at).getTime()) / 3_600_000
            const score =
                (1 / Math.pow(hoursSince + 2, 1.5)) * 0.30 +
                (item.likes / maxLikes) * 0.25 +
                (item.views / maxViews) * 0.20 +
                (item.bookings_generated / maxBookings) * 0.25
            return { ...item, score }
        })
        .sort((a, b) => {
            // Randomise bottom 30%
            if ((a.score ?? 0) < 0.15 && Math.random() > 0.5) return 1
            return (b.score ?? 0) - (a.score ?? 0)
        })
}

/* ── Formatters ──────────────────────────────────────────────── */
function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
}

/* ── Comments sheet ──────────────────────────────────────────── */
function CommentsSheet({
    item, onClose,
}: { item: MediaItem; onClose: () => void }) {
    const { user } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)

    const load = useCallback(async () => {
        try {
            const commentsQuery = query(
                collection(db, 'chef_media', item.id, 'comments'),
                orderBy('createdAt', 'desc')
            )
            const snap = await getDocs(commentsQuery)
            const list: Comment[] = snap.docs.map(docSnap => {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    user_id: data.user_id || '',
                    content: data.content || '',
                    created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    user: { full_name: data.user_name || 'ChefMii Foodie' }
                }
            })
            setComments(list)
        } catch {
            setComments([])
        }
    }, [item.id])

    useEffect(() => { load() }, [load])

    const sendComment = async () => {
        if (!user || !text.trim()) return
        setSending(true)
        const commentText = text.trim()
        setText('')
        try {
            await addDoc(collection(db, 'chef_media', item.id, 'comments'), {
                media_id: item.id,
                user_id: user.id,
                user_name: user.displayName || user.email || 'ChefMii User',
                content: commentText,
                createdAt: serverTimestamp(),
            })
            await load()
        } catch (err) {
            console.error('Error adding comment:', err)
        }
        setSending(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
            <div className="bg-card rounded-t-3xl border-t border-border max-h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}>
                {/* Handle */}
                <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-4" />
                <div className="px-4 pb-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-base">{item.comments_count} comments</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>

                {/* Comment list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Demo comments */}
                    {[
                        { id: 'd1', content: 'Absolutely incredible! Booking this chef for my anniversary 🔥', user: 'Priya S.', time: '2m' },
                        { id: 'd2', content: 'The technique at 2:30 is mind-blowing. Pure mastery 👏', user: 'James W.', time: '15m' },
                        { id: 'd3', content: 'My husband made this last night and I cried it was so good 😭', user: 'Emma T.', time: '1h' },
                    ].map(c => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {c.user.split(' ')[0][0]}
                            </div>
                            <div>
                                <p className="text-xs font-bold">{c.user} <span className="font-normal text-muted-foreground">{c.time} ago</span></p>
                                <p className="text-sm mt-0.5">{c.content}</p>
                            </div>
                        </div>
                    ))}
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {(c.user?.full_name ?? 'U')[0]}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground">{c.user?.full_name ?? 'Anonymous'}</p>
                                <p className="text-sm mt-0.5">{c.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border flex gap-2">
                    {user ? (
                        <>
                            <input
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendComment()}
                                placeholder="Add a comment…"
                                className="flex-1 bg-muted rounded-2xl px-4 py-2.5 text-sm focus:outline-none"
                            />
                            <button onClick={sendComment} disabled={sending || !text.trim()}
                                className="w-10 h-10 gradient-brand text-white rounded-2xl flex items-center justify-center disabled:opacity-40">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="flex-1 text-center text-sm text-terracotta font-semibold">
                            Sign in to comment →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Upload Modal ────────────────────────────────────────────── */
function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded?: (item: MediaItem) => void }) {
    const { user, profile } = useAuth()
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [tags, setTags] = useState<string[]>(['cooking', 'chefmii'])
    const [tagInput, setTagInput] = useState('')
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        if (t && !tags.includes(t)) setTags(prev => [...prev, t])
        setTagInput('')
    }

    const upload = async () => {
        // A real video file is now required. The old flow let you publish with
        // just a title and wrote a hardcoded w3schools sample as the video, or
        // a blob: URL that only worked in the uploader's own tab.
        if (!file) {
            setError('Choose a video file to publish.')
            return
        }
        if (!title.trim()) {
            setError('Give your video a title.')
            return
        }

        setUploading(true)
        setError(null)
        setProgress(0)

        try {
            // Uploads the actual file to Cloud Storage and returns a durable
            // public URL plus a captured poster frame.
            const { videoUrl, thumbnailUrl, durationSeconds } = await uploadChefMediaVideo({
                file,
                onProgress: setProgress,
            })

            const authorName = profile?.full_name || user?.displayName || 'ChefMii Creator'
            const authorAvatar = profile?.avatar_url || null
            const chefId = user?.id || user?.uid

            if (!chefId) {
                throw new MediaUploadError('Please sign in again before publishing.')
            }

            // Written with the client SDK; firestore.rules requires
            // chef_id === the authenticated uid on create, so this is only ever
            // the uploader's own video.
            const docRef = await addDoc(collection(db, 'chef_media'), {
                chef_id: chefId,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                duration_seconds: durationSeconds,
                title: title.trim(),
                description: desc.trim() || null,
                cuisine_tags: tags.length > 0 ? tags : ['gourmet', 'chef'],
                views: 0,
                likes: 0,
                comments_count: 0,
                bookings_generated: 0,
                createdAt: serverTimestamp(),
            })

            const newItem: MediaItem = {
                id: docRef.id,
                chef_id: chefId,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                title: title.trim(),
                description: desc.trim() || null,
                cuisine_tags: tags.length > 0 ? tags : ['gourmet', 'chef'],
                likes: 0,
                views: 0,
                bookings_generated: 0,
                comments_count: 0,
                created_at: new Date().toISOString(),
                chef: { full_name: authorName, avatar_url: authorAvatar },
            }

            onUploaded?.(newItem)
            setUploading(false)
            setStep(3)
        } catch (e) {
            // Unlike before, a failure is shown as a failure. The old handler
            // advanced to the success screen even when the upload threw.
            console.error('Upload failed:', e)
            setError(
                e instanceof MediaUploadError
                    ? e.message
                    : 'Upload failed. Check your connection and try again.',
            )
            setUploading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold text-lg text-foreground">{step === 3 ? '🎉 Video Published!' : 'Upload to ChefTV'}</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
                </div>

                <div className="p-5 space-y-4">
                    {step === 1 && (
                        <>
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-border hover:border-terracotta rounded-2xl p-10 text-center cursor-pointer transition-colors group bg-muted/20"
                            >
                                <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden"
                                    onChange={e => { if (e.target.files?.[0]) { setError(null); setFile(e.target.files[0]); setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, '')); setStep(2); } }} />
                                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-terracotta mx-auto mb-3 transition-colors" />
                                <p className="font-bold text-sm text-foreground">Tap to select video file</p>
                                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM up to 200MB</p>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {file && (
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                                    <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                                        <ChefHat className="w-5 h-5 text-terracotta" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate text-foreground">{file.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{(file.size / 1_048_576).toFixed(1)} MB</p>
                                    </div>
                                    <button onClick={() => { setFile(null); setStep(1) }}>
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Video Title *</label>
                                <input value={title} onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Perfect Carbonara in 8 Minutes 🍝"
                                    className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Caption & Technique</label>
                                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                                    placeholder="Share your culinary secret, ingredients, or booking tips…"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta resize-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Cuisine Tags</label>
                                <div className="flex gap-1.5 flex-wrap mb-2">
                                    {tags.map(t => (
                                        <span key={t} className="px-2.5 py-1 gradient-brand text-white text-xs rounded-full flex items-center gap-1 font-bold">
                                            #{t}
                                            <button onClick={() => setTags(prev => prev.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag()}
                                        placeholder="Add tag (e.g. italian, truffle)"
                                        className="flex-1 px-4 py-2 min-h-[40px] rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none" />
                                    <button onClick={addTag} className="px-4 py-2 min-h-[40px] gradient-brand text-white text-xs font-bold rounded-xl">Add</button>
                                </div>
                            </div>

                            {uploading && (
                                <div className="space-y-1.5">
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full gradient-brand transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center tabular-nums">
                                        {progress < 100 ? `Uploading ${progress}%` : 'Finishing up…'}
                                    </p>
                                </div>
                            )}

                            {error && (
                                <p role="alert" className="text-xs text-destructive text-center">{error}</p>
                            )}

                            <button onClick={upload} disabled={uploading || !file || !title.trim()}
                                className="w-full py-3.5 min-h-[50px] gradient-brand text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md text-xs">
                                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing to ChefTV…</> : 'Publish to ChefTV Feed →'}
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">Video is Live on ChefTV!</h3>
                            <p className="text-xs text-muted-foreground">Your video has been added to the active feed and is ready for foodies worldwide.</p>
                            <button onClick={onClose} className="px-8 py-3 gradient-brand text-white font-bold rounded-xl hover:opacity-90 text-xs shadow-md">
                                Watch Video in Feed →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Single Video Card ───────────────────────────────────────── */
function VideoCard({
    item, index, active, activeIdx, muted, onMuteToggle,
}: {
    item: MediaItem; index: number; active: boolean; activeIdx: number; muted: boolean; onMuteToggle: () => void
}) {
    const { user } = useAuth()
    const router = useRouter()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [liked, setLiked] = useState(item.isLiked ?? false)
    const [likes, setLikes] = useState(item.likes)
    const [saved, setSaved] = useState(item.isSaved ?? false)
    const [followed, setFollowed] = useState(item.isFollowed ?? false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)
    const [playing, setPlaying] = useState(false)
    const [showHeart, setShowHeart] = useState(false)
    const [comments, setComments] = useState(false)
    const lastTapRef = useRef(0)

    // Virtualization: only load heavy video when user is within 1 card of it
    const shouldMountVideo = Math.abs(index - activeIdx) <= 1

    const showToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 2500)
    }

    // Autoplay / pause when scrolling
    useEffect(() => {
        const v = videoRef.current
        if (!v) return
        if (active) {
            v.play().catch(() => { })
            setPlaying(true)
        } else {
            v.pause()
            setPlaying(false)
        }
    }, [active])

    // Increment view count once
    useEffect(() => {
        if (active && item.id.startsWith('s')) return // skip seed
        if (!active) return
        try {
            updateDoc(doc(db, 'chef_media', item.id), { views: increment(1) }).catch(() => {})
        } catch {
            // ignore
        }
    }, [active, item.id])

    const togglePlay = () => {
        const v = videoRef.current
        if (!v) return
        if (playing) { v.pause(); setPlaying(false) } else { v.play(); setPlaying(true) }
    }

    const handleTap = () => {
        const now = Date.now()
        const diff = now - lastTapRef.current
        lastTapRef.current = now
        if (diff < 320) {
            // Double tap → like
            handleLike(); setShowHeart(true)
            setTimeout(() => setShowHeart(false), 900)
        } else {
            togglePlay()
        }
    }

    const handleLike = async () => {
        if (!user) { showToast('Sign in to like videos'); return }

        // Optimistic: flip immediately, revert if the write fails. The count
        // now changes in the database too, via a transaction, so the number is
        // real rather than local-only.
        const wasLiked = liked
        setLiked(!wasLiked); setLikes(l => l + (wasLiked ? -1 : 1))
        showToast(wasLiked ? 'Removed from liked videos' : 'Added to liked videos ❤️')
        try {
            await toggleLike(item.id)
        } catch {
            setLiked(wasLiked); setLikes(l => l + (wasLiked ? 1 : -1))
            showToast('Could not save that like. Try again.')
        }
    }

    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!user) { showToast('Sign in to follow chefs'); return }
        if (!item.chef_id) return

        const wasFollowed = followed
        setFollowed(!wasFollowed)
        showToast(
            wasFollowed
                ? `Unfollowed ${item.chef?.full_name || 'Chef'}`
                : `Following ${item.chef?.full_name || 'Chef'}! ⭐`,
        )
        try {
            await toggleFollow(item.chef_id)
        } catch (err) {
            setFollowed(wasFollowed)
            showToast(err instanceof Error ? err.message : 'Could not update follow. Try again.')
        }
    }

    const handleShare = async () => {
        const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://chefmii.com/chef-media'
        if (navigator.share) {
            try {
                await navigator.share({ title: item.title, url: shareUrl })
            } catch {}
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl)
                showToast('Video link copied to clipboard! 📋')
            } catch {
                showToast('Video link copied!')
            }
        }
    }

    const chefInitials = (item.chef?.full_name ?? 'CH').split(' ').slice(-2).map(w => w[0]).join('')

    return (
        <div className="relative w-full snap-start flex-shrink-0" style={{ height: '100dvh' }}>
            {/* Video / Thumbnail */}
            <div className="absolute inset-0 bg-black overflow-hidden" onClick={handleTap}>
                {item.video_url && shouldMountVideo ? (
                    <video
                        ref={videoRef}
                        src={item.video_url}
                        poster={item.thumbnail_url ?? undefined}
                        loop
                        playsInline
                        muted={muted}
                        preload={active ? 'auto' : 'metadata'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-zinc-950">
                        <img
                            src={item.thumbnail_url ?? '/images/hero_bg.jpg'}
                            alt={item.title}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
                                active ? 'scale-110 translate-y-[-2%]' : 'scale-100'
                            }`}
                        />
                        {/* Ambient subtle vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none" />
                    </div>
                )}
                {/* Gradient overlays */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
            </div>

            {/* Double-tap heart burst */}
            {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Heart className="w-28 h-28 text-red-500 fill-red-500 animate-ping opacity-80" />
                </div>
            )}

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 shadow-xl animate-fade-in">
                    {toastMessage}
                </div>
            )}

            {/* Play indicator */}
            {!playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-b-8 border-l-16 border-t-transparent border-b-transparent border-l-white ml-1" style={{ borderLeftWidth: 20 }} />
                    </div>
                </div>
            )}

            {/* Volume button — top right */}
            <button
                onClick={e => { e.stopPropagation(); onMuteToggle() }}
                className="absolute top-16 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
                {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>

            {/* Right action sidebar */}
            <div className="absolute right-3 bottom-28 sm:bottom-32 z-20 flex flex-col items-center gap-5">
                {/* Like */}
                <button onClick={e => { e.stopPropagation(); handleLike() }} className="flex flex-col items-center gap-1">
                    <Heart className={`w-7 h-7 drop-shadow-lg transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
                    <span className="text-white text-xs font-semibold drop-shadow">{fmt(likes)}</span>
                </button>
                {/* Comment */}
                <button onClick={e => { e.stopPropagation(); setComments(true) }} className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
                    <span className="text-white text-xs font-semibold drop-shadow">{fmt(item.comments_count)}</span>
                </button>
                {/* Save */}
                <button onClick={e => { e.stopPropagation(); setSaved(s => { const next = !s; showToast(next ? 'Saved to bookmarks' : 'Removed bookmark'); return next; }) }} className="flex flex-col items-center gap-1">
                    <Bookmark className={`w-7 h-7 drop-shadow-lg ${saved ? 'fill-white text-white' : 'text-white'}`} />
                    <span className="text-white text-xs font-semibold drop-shadow">{saved ? 'Saved' : 'Save'}</span>
                </button>
                {/* Share */}
                <button onClick={e => { e.stopPropagation(); handleShare() }} className="flex flex-col items-center gap-1">
                    <Share2 className="w-7 h-7 text-white drop-shadow-lg" />
                    <span className="text-white text-xs font-semibold drop-shadow">Share</span>
                </button>
                {/* Chef avatar + follow */}
                <div className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full gradient-brand text-white font-bold text-sm flex items-center justify-center shadow-lg border-2 border-white overflow-hidden">
                        {item.chef?.avatar_url ? (
                            <img src={item.chef.avatar_url} alt={item.chef.full_name || 'Chef'} className="w-full h-full object-cover" />
                        ) : (
                            <span>{chefInitials}</span>
                        )}
                    </div>
                    <button
                        onClick={handleFollow}
                        className={`w-6 h-6 -mt-3 rounded-full flex items-center justify-center shadow-md text-xs font-bold transition-all ${
                            followed ? 'bg-emerald-500 text-white' : 'gradient-brand text-white'
                        }`}
                        title={followed ? 'Following' : 'Follow Chef'}
                    >
                        {followed ? '✓' : '+'}
                    </button>
                </div>
                {/* TikTok style spinning record */}
                <div className="w-12 h-12 mt-4 rounded-full bg-zinc-900 border-[8px] border-zinc-800 flex items-center justify-center shadow-2xl animate-[spin_4s_linear_infinite]">
                    <div className="w-4 h-4 rounded-full gradient-brand"></div>
                </div>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-14 z-20 p-4 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-white font-bold text-[10px] flex items-center gap-1 shadow-lg">
                        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                        Gemini Veo 10s Reel
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold backdrop-blur-md">
                        HD 60fps
                    </span>
                </div>
                <p className="text-white font-bold text-sm mb-0.5 drop-shadow-lg">{item.chef?.full_name ?? 'Chef'}</p>
                <p className="text-white font-semibold text-base leading-snug mb-1 drop-shadow-lg">{item.title}</p>
                {item.description && (
                    <p className="text-white/80 text-xs leading-relaxed mb-2 drop-shadow line-clamp-2">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                    {item.cuisine_tags.map(tag => (
                        <span key={tag} className="text-white/70 text-xs font-semibold">#{tag}</span>
                    ))}
                </div>
                {/* Book CTA — the conversion edge over TikTok: every reel routes
                    straight to this chef's booking page. Prefer the directory
                    slug; real uploads key chef_id to a uid, which /book also
                    resolves, but the slug gives a cleaner URL. */}
                <Link
                    href={`/book/${item.chef_slug || item.chef_id}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 gradient-brand text-white font-bold rounded-2xl text-sm hover:opacity-90 shadow-lg"
                >
                    <ChefHat className="w-4 h-4 shrink-0" />
                    Book This Chef
                </Link>
            </div>

            {/* Comments sheet */}
            {comments && <CommentsSheet item={item} onClose={() => setComments(false)} />}
        </div>
    )
}

/* ── Main Page ───────────────────────────────────────────────── */
const TABS = ['For You', 'Following', 'Trending', 'Near Me']

export default function ChefMediaPage() {
    const { user, profile } = useAuth()
    const [feed, setFeed] = useState<MediaItem[]>(() => scoreItems(SEED))
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('For You')
    const [activeIdx, setActive] = useState(0)
    const [muted, setMuted] = useState(true)
    const [showUpload, setShowUpload] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQ, setSearchQ] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    /* ── Load dynamic feed in background ─────────────────────────────── */
    useEffect(() => {
        const load = async () => {
            try {
                // Load the feed and the viewer's like/follow sets together, so
                // the heart and Follow button reflect real saved state on first
                // paint instead of always starting empty.
                const [snap, likedIds, followedIds] = await Promise.all([
                    getDocs(
                        query(collection(db, 'chef_media'), orderBy('createdAt', 'desc'), limit(20)),
                    ),
                    loadLikedMediaIds(),
                    loadFollowedChefIds(),
                ])

                const hydrate = (it: MediaItem): MediaItem => ({
                    ...it,
                    isLiked: likedIds.has(it.id),
                    isFollowed: it.chef_id ? followedIds.has(it.chef_id) : false,
                })

                if (!snap.empty) {
                    const items: MediaItem[] = snap.docs.map(docSnap => {
                        const d = docSnap.data()
                        return {
                            id: docSnap.id,
                            chef_id: d.chef_id || 'marco-rossi',
                            chef_slug: d.chef_slug || d.chef_id || undefined,
                            video_url: d.video_url || '',
                            thumbnail_url: d.thumbnail_url || null,
                            title: d.title || 'Chef Special',
                            description: d.description || null,
                            cuisine_tags: d.cuisine_tags || ['food', 'chef'],
                            likes: d.likes || 0,
                            views: d.views || 0,
                            bookings_generated: d.bookings_generated || 0,
                            comments_count: d.comments_count || 0,
                            created_at: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                            chef: { full_name: 'ChefMii Creator', avatar_url: null },
                        }
                    })
                    setFeed(
                        scoreItems(
                            [...items, ...SEED.filter(s => !items.some(it => it.id === s.id))].map(hydrate),
                        ),
                    )
                } else {
                    // No live media yet: still hydrate the seed feed's state.
                    setFeed(prev => prev.map(hydrate))
                }
            } catch {
                // Leave the seed feed in place on error.
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    /* ── Intersection observer for active card ──────────────────── */
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const children = Array.from(container.children) as HTMLElement[]

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActive(children.indexOf(entry.target as HTMLElement))
                    }
                })
            },
            { root: container, threshold: 0.6 }
        )
        children.forEach(child => observer.observe(child))
        return () => observer.disconnect()
    }, [feed])

    // Tabs now actually filter the feed. Before this they were decorative:
    // the `tab` value was tracked but every tab showed the identical list.
    const tabFeed = (() => {
        switch (tab) {
            case 'Following':
                return feed.filter(i => i.isFollowed)
            case 'Trending':
                // Most-watched first; scoreItems already blends recency + likes.
                return [...feed].sort((a, b) => b.views - a.views)
            case 'Near Me':
                // Placeholder until geo is captured on upload: surface the
                // viewer's own city once available. For now, recency.
                return [...feed].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                )
            case 'For You':
            default:
                return feed
        }
    })()

    const displayFeed = searchQ.trim()
        ? tabFeed.filter(i =>
            i.title.toLowerCase().includes(searchQ.toLowerCase()) ||
            i.cuisine_tags.some(t => t.includes(searchQ.toLowerCase())) ||
            (i.chef?.full_name ?? '').toLowerCase().includes(searchQ.toLowerCase())
        )
        : tabFeed

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
            {/* ── Top UI overlay ────────────────────────────── */}
            <div className="absolute top-0 left-0 right-0 z-30 safe-top">
                {/* Back link for desktop */}
                <div className="hidden sm:flex items-center justify-between px-6 pt-4 pb-2">
                    <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-xl">
                        <BrandLogo size="sm" />
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-4 py-2 gradient-brand text-white text-xs font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Upload to ChefTV
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-center gap-1 pt-12 sm:pt-2 pb-3 px-4">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${tab === t ? 'text-white border-b-2 border-white' : 'text-white/60 hover:text-white/80'}`}>
                            {t}
                        </button>
                    ))}
                    <button onClick={() => setShowSearch(!showSearch)} className="ml-1 p-1.5 text-white/70 hover:text-white">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Search bar */}
                {showSearch && (
                    <div className="px-4 pb-3">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20">
                            <Search className="w-4 h-4 text-white/70 shrink-0" />
                            <input
                                value={searchQ}
                                onChange={e => setSearchQ(e.target.value)}
                                placeholder="Search chefs, cuisine, #tags…"
                                autoFocus
                                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/50 focus:outline-none"
                            />
                            {searchQ && <button onClick={() => setSearchQ('')}><X className="w-4 h-4 text-white/70" /></button>}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Video feed ────────────────────────────────── */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            ) : (
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-scroll scrollbar-hide"
                    style={{ scrollSnapType: 'y mandatory' }}
                >
                    {displayFeed.map((item, i) => (
                        <VideoCard
                            key={item.id}
                            item={item}
                            index={i}
                            active={i === activeIdx}
                            activeIdx={activeIdx}
                            muted={muted}
                            onMuteToggle={() => setMuted(m => !m)}
                        />
                    ))}
                    {displayFeed.length === 0 && (
                        <div className="h-full flex items-center justify-center text-white text-center p-8">
                            <div>
                                <p className="text-5xl mb-4">🔍</p>
                                <p className="font-bold text-xl mb-2">No videos found</p>
                                <p className="text-white/60">Try a different search</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Floating upload button ─────────── */}
            <button
                onClick={() => setShowUpload(true)}
                className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-full gradient-brand text-white flex items-center gap-2 shadow-2xl hover:opacity-90 transition-all hover:scale-105 font-bold text-xs"
            >
                <Plus className="w-4 h-4" />
                <span>Upload Video</span>
            </button>

            {/* ── Mobile bottom nav ─────────────────────────── */}
            <nav className="sm:hidden absolute bottom-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-t border-white/10 flex safe-bottom">
                {[
                    { icon: Home, label: 'Home', href: '/' },
                    { icon: Search, label: 'Search', href: '#', action: () => setShowSearch(!showSearch) },
                    { icon: Plus, label: 'Upload', href: '#', action: () => setShowUpload(true), featured: true },
                    { icon: Bell, label: 'Alerts', href: '#' },
                    { icon: UserIcon, label: 'Me', href: user ? '/user-dashboard' : '/login' },
                ].map(({ icon: Icon, label, href, action, featured }: { icon: React.ElementType, label: string, href: string, action?: () => void, featured?: boolean }) => (
                    <button key={label}
                        onClick={() => { if (action) action() }}
                        className="flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] gap-0.5"
                    >
                        {href !== '#' ? (
                            <Link href={href} className="flex flex-col items-center gap-0.5">
                                {featured ? (
                                    <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                ) : <Icon className="w-5 h-5 text-white/70" />}
                                <span className="text-[10px] text-white/60">{label}</span>
                            </Link>
                        ) : (
                            <>
                                {featured ? (
                                    <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                ) : <Icon className="w-5 h-5 text-white/70" />}
                                <span className="text-[10px] text-white/60">{label}</span>
                            </>
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Upload Modal ──────────────────────────────── */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={(newItem) => {
                        setFeed(prev => [newItem, ...prev])
                        setActive(0)
                    }}
                />
            )}
        </div>
    )
}
