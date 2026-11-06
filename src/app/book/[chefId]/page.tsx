'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { useAuth } from '@/context/auth-context'
import { useCurrency } from '@/context/currency-context'
import { useToast } from '@/context/toast-context'
import { CHEF_IMAGES, CHEF_FALLBACKS } from '@/lib/images'
import { apiFetch, NotSignedInError } from '@/lib/api-client'
import {
    Calendar, Users, MapPin, Clock, ChefHat, Loader2, CheckCircle,
    Star, MessageCircle, X, Send, ShieldCheck
} from 'lucide-react'

// Extended Chef Data Source
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CHEFS: Record<string, any> = {
    'marco-rossi': {
        id: 'marco-rossi', name: 'Chef Marco Rossi', cuisine: 'Italian', rate: 150, rating: 4.9, reviews: 128, badge: 'Fine Dining', verified: true,
        location: 'London, UK',
        bio: 'With over 15 years in Michelin-starred kitchens across Italy and the UK, Chef Marco brings authentic, elevated Italian dining directly to your home. Known for his handmade pasta and truffles.',
        image: CHEF_IMAGES['chef-marco-rossi'] || CHEF_FALLBACKS['chef-marco-rossi'],
        menus: ['Lazio Classic 5-Course', 'Truffle & Wine Tasting', 'Italian Rustic Family Feast'],
        menuImages: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80', 'https://images.unsplash.com/photo-1626844131082-256783844137?w=400&q=80', 'https://images.unsplash.com/photo-1598866594230-a4fcfa46a838?w=400&q=80'],
        media: ['https://www.w3schools.com/html/mov_bbb.mp4']
    },
    'yuki-tanaka': {
        id: 'yuki-tanaka', name: 'Chef Yuki Tanaka', cuisine: 'Japanese', rate: 200, rating: 5.0, reviews: 67, badge: 'Omakase Master', verified: true,
        location: 'Dubai, UAE',
        bio: 'Trained in Tokyo at top sushi houses, Chef Yuki offers a premium Omakase experience focusing on seasonal seafood imported directly from Japan.',
        image: CHEF_IMAGES['chef-yuki-tanaka'] || CHEF_FALLBACKS['chef-yuki-tanaka'],
        menus: ['10-Course Edomae Omakase', 'Aged Wagyu & Sushi', 'Modern Kyoto Kaiseki'],
        menuImages: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&q=80'],
        media: ['https://www.w3schools.com/html/mov_bbb.mp4']
    },
    'pierre-dubois': {
        id: 'pierre-dubois', name: 'Chef Pierre Dubois', cuisine: 'French', rate: 180, rating: 4.7, reviews: 212, badge: 'Haute Cuisine', verified: false,
        location: 'Paris, France',
        bio: 'Former executive chef at Hôtel de Crillon in Paris. Chef Pierre specializes in classic French Haute Cuisine, bringing the elegance of a Parisian dining room to your table.',
        image: CHEF_IMAGES['chef-pierre-dubois'] || CHEF_FALLBACKS['chef-pierre-dubois'],
        menus: ['A Night in Paris 6-Course', 'Bordeaux Wine Pairing Dinner', 'French Countryside Brunch'],
        menuImages: ['https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80'],
        media: []
    },
    'aisha-okafor': {
        id: 'aisha-okafor', name: 'Chef Aisha Okafor', cuisine: 'West African', rate: 80, rating: 4.8, reviews: 94, badge: 'Traditional', verified: true,
        location: 'Lagos, Nigeria',
        bio: 'Award-winning cookbook author bringing the bold, authentic flavors of West Africa to private events. Her signature smoky Jollof rice is legendary.',
        image: CHEF_IMAGES['chef-aisha-okafor'] || CHEF_FALLBACKS['chef-aisha-okafor'],
        menus: ['Lagos Luxury Feast', 'Pan-African BBQ', 'Spice Route Tasting Menu'],
        menuImages: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&q=80'],
        media: ['https://www.w3schools.com/html/mov_bbb.mp4']
    },
    'sofia-mendez': {
        id: 'sofia-mendez', name: 'Chef Sofía Mendez', cuisine: 'Spanish', rate: 120, rating: 4.9, reviews: 89, badge: 'Tapas & Paella', verified: true,
        location: 'Barcelona, Spain',
        bio: 'Expert in traditional Catalan cuisine and modernist tapas. Sofia curates lively dining experiences perfect for sharing and celebration.',
        image: CHEF_IMAGES['chef-sofia-mendez'] || CHEF_FALLBACKS['chef-sofia-mendez'],
        menus: ['Tapas & Sangria Night', 'Seafood Paella Masterclass', 'Modern Catalan Dinner'],
        menuImages: ['https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&q=80', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80', 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400&q=80'],
        media: []
    },
    'james-osei': {
        id: 'james-osei', name: 'Chef James Osei', cuisine: 'Pan-African', rate: 70, rating: 4.8, reviews: 156, badge: 'Events Specialist', verified: true,
        location: 'Accra, Ghana',
        bio: 'Specializing in large format dynamic events and weddings. Chef James creates vibrant Pan-African feasts that fuse tradition with modern culinary techniques.',
        image: CHEF_IMAGES['chef-james-osei'] || '/images/chefs/chef_james_osei.png',
        menus: ['Ghanaian Royal Tilapia Feast', 'Suya Lamb Banquet', 'Afro-Modern Fusion Canapés'],
        menuImages: ['/images/orders/order_pan_african_tilapia.png', '/images/orders/order_pan_african_suya.png', '/images/orders/order_west_african_jollof.png'],
        media: []
    },
    'meera-patel': {
        id: 'meera-patel', name: 'Chef Meera Patel', cuisine: 'Indian', rate: 95, rating: 4.9, reviews: 203, badge: 'Ayurvedic Chef', verified: true,
        location: 'Birmingham, UK',
        bio: 'Focusing on Ayurvedic principles, Chef Meera crafts deeply flavorful and healing South Asian cuisine. Beautiful spices mixed with holistic nutrition.',
        image: CHEF_IMAGES['chef-meera-patel'] || CHEF_FALLBACKS['chef-meera-patel'],
        menus: ['Ayurvedic Thali Experience', 'Modern Indian Spice Journey', 'Vegan Mumbai Street Food'],
        menuImages: ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'],
        media: ['https://www.w3schools.com/html/mov_bbb.mp4']
    },
    'marcus-vance': {
        id: 'marcus-vance', name: 'Chef Marcus Vance', cuisine: 'American', rate: 160, rating: 4.9, reviews: 142, badge: 'Farm-to-Table', verified: true,
        location: 'New York, USA',
        bio: 'James Beard nominee specializing in modern American farm-to-table tasting menus and wood-fired gastronomy in Manhattan.',
        image: CHEF_IMAGES['chef-marcus-vance'] || '/images/chefs/chef_marcus_vance.png',
        menus: ['Hudson Valley Tasting Menu', 'Wood-Fired Prime Ribeye Feast', 'Brooklyn Artisanal 5-Course'],
        menuImages: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'],
        media: []
    },
    'elena-beauchamp': {
        id: 'elena-beauchamp', name: 'Chef Éléna Beauchamp', cuisine: 'French-Canadian', rate: 140, rating: 4.8, reviews: 98, badge: 'Nordic-French', verified: true,
        location: 'Montreal, Canada',
        bio: 'Crafts refined Quebecois-French fusion menus featuring wild foraged herbs, artisanal cheeses, and Atlantic seafood.',
        image: CHEF_IMAGES['chef-elena-beauchamp'] || '/images/chefs/chef_elena_beauchamp.png',
        menus: ['St. Lawrence Fjord Seafood', 'Quebecois Forest Foraged Feast', 'Montreal Modern Bistro'],
        menuImages: ['https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&q=80', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80', 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400&q=80'],
        media: []
    },
    'wei-zhang': {
        id: 'wei-zhang', name: 'Chef Wei Zhang', cuisine: 'Chinese', rate: 175, rating: 5.0, reviews: 184, badge: 'Dim Sum & Wok Master', verified: true,
        location: 'Shanghai, China',
        bio: '20 years mastering imperial Cantonese banquet dining, handmade dim sum, and precision wok artistry.',
        image: CHEF_IMAGES['chef-wei-zhang'] || '/images/chefs/chef_wei_zhang.png',
        menus: ['Imperial Cantonese 8-Course', 'Handmade Artisan Dim Sum Banquet', 'Sichuan Peppercorn Tasting'],
        menuImages: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80'],
        media: []
    },
    'olena-kovalenko': {
        id: 'olena-kovalenko', name: 'Chef Olena Kovalenko', cuisine: 'Ukrainian', rate: 110, rating: 4.9, reviews: 115, badge: 'Heritage Cuisine', verified: true,
        location: 'Kyiv, Ukraine',
        bio: 'Reimagining Eastern European heritage cooking with modern fermentation techniques, delicate borscht reductions, and smoked delicacies.',
        image: CHEF_IMAGES['chef-olena-kovalenko'] || '/images/chefs/chef_olena_kovalenko.png',
        menus: ['Kyiv Modern Heritage 6-Course', 'Carpathian Forest Mushroom Feast', 'Artisanal Varenyky & Duck Tasting'],
        menuImages: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'],
        media: []
    },
    'henrik-lindqvist': {
        id: 'henrik-lindqvist', name: 'Chef Henrik Lindqvist', cuisine: 'Nordic', rate: 190, rating: 4.9, reviews: 87, badge: 'Michelin Nordic', verified: true,
        location: 'Oslo, Norway',
        bio: 'Former head chef at leading Scandinavian fine dining establishments; specialized in cold-smoked fjord salmon and reindeer tartare.',
        image: CHEF_IMAGES['chef-henrik-lindqvist'] || '/images/chefs/chef_henrik_lindqvist.png',
        menus: ['Fjord to Table 7-Course', 'Nordic Foraging & Cloudberry Dinner', 'Arctic Char & Birch Smoke Tasting'],
        menuImages: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80'],
        media: []
    },
    'kenji-sato': {
        id: 'kenji-sato', name: 'Chef Kenji Sato', cuisine: 'Japanese', rate: 220, rating: 5.0, reviews: 153, badge: 'Kaiseki Master', verified: true,
        location: 'Kyoto, Japan',
        bio: 'Trained in Gion Kyoto, specializing in traditional seasonal Kaiseki multicourse banquets and Wagyu A5 preparations.',
        image: CHEF_IMAGES['chef-kenji-sato'] || '/images/chefs/chef_kenji_sato.png',
        menus: ['Kyoto Gion Seasonal Kaiseki (9 Courses)', 'Wagyu A5 & Truffle Tasting', 'Zen Garden Tea Ceremony Dinner'],
        menuImages: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&q=80'],
        media: []
    },
    'min-jun-park': {
        id: 'min-jun-park', name: 'Chef Min-Jun Park', cuisine: 'Korean', rate: 165, rating: 4.9, reviews: 126, badge: 'K-Fine Dining', verified: true,
        location: 'Seoul, South Korea',
        bio: 'Pioneering modernist Korean fine dining with 10-year aged jang sauces, Hanwoo beef pairing, and royal court banquets.',
        image: CHEF_IMAGES['chef-min-jun-park'] || '/images/chefs/chef_min_jun_park.png',
        menus: ['Joseon Royal Court Banquet', 'Hanwoo Beef & Aged Fermentation', 'Modern Seoul Gastronomy 7-Course'],
        menuImages: ['https://images.unsplash.com/photo-1583394293214-d4e8a3a959b1?w=400&q=80', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'],
        media: []
    },
    'tariq-al-ghamdi': {
        id: 'tariq-al-ghamdi', name: 'Chef Tariq Al-Ghamdi', cuisine: 'Middle Eastern', rate: 195, rating: 4.9, reviews: 109, badge: 'Royal Banquet', verified: true,
        location: 'Riyadh, Saudi Arabia',
        bio: 'Specializes in royal banquet hospitality, slow-cooked Najdi lamb, saffron-cardamom infusions, and luxury private dining.',
        image: CHEF_IMAGES['chef-tariq-al-ghamdi'] || '/images/chefs/chef_tariq_al_ghamdi.png',
        menus: ['Najdi Royal Lamb Feast', 'Arabian Peninsula Saffron Journey', 'Modern Khaleeji Seafood Night'],
        menuImages: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80'],
        media: []
    },
    'carlos-garcia': {
        id: 'carlos-garcia', name: 'Chef Carlos Garcia', cuisine: 'Mexican', rate: 85, rating: 4.7, reviews: 71, badge: 'Street Food Expert', verified: true,
        location: 'Mexico City',
        bio: 'Elevating the vibrant street foods of Mexico City into a fine dining narrative. Carlos brings tacos, mole, and artisanal mezcal pairings alive.',
        image: CHEF_IMAGES['chef-carlos-garcia'] || '/images/chefs/chef_carlos_garcia.png',
        menus: ['Taco Omakase', 'Oaxacan Mole Tasting', 'Coastal Ceviche & Aguachile'],
        menuImages: ['https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80', 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?w=400&q=80', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80'],
        media: []
    },
}

const EVENT_TYPES = ['Dinner Party', 'Birthday Celebration', 'Corporate Event', 'Wedding/Banquet', 'Other']

export default function ChefProfileAndBooking() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const { formatPrice, currency } = useCurrency()
    const { showToast } = useToast()
    const chefId = typeof params.chefId === 'string' ? params.chefId : ''
    const chef = CHEFS[chefId]

    // Navigation state
    const [view, setView] = useState<'profile' | 'book'>('profile')
    const [isChatOpen, setIsChatOpen] = useState(false)

    // Booking state
    const [date, setDate] = useState('')
    const [time, setTime] = useState('19:00')
    const [hours, setHours] = useState(4)
    const [guests, setGuests] = useState(6)
    const [event, setEvent] = useState('Dinner Party')
    const [location, setLocation] = useState('')
    const [notes, setNotes] = useState('')
    const [selectedMenu, setSelectedMenu] = useState(0)
    const [isDeposit, setIsDeposit] = useState(true)
    const [wineTier, setWineTier] = useState<'none' | 'reserve' | 'prestige'>('none')

    // UI state
    const [loading, setLoading] = useState(false)
    const [bookingComplete, setBookingComplete] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isSaved, setIsSaved] = useState(false)

    // Chat state
    const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'chef' }>>([
        { id: 1, text: "Hello! I'm happy to customize our menu for any dietary preferences or occasions. What are you planning?", sender: 'chef' }
    ])
    const [chatInput, setChatInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping, isChatOpen])

    if (!chef) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h1 className="text-2xl font-bold mb-2">Chef not found</h1>
                    <Link href="/find-chefs" className="text-[#FF5A36] font-medium hover:underline">← Back to chefs</Link>
                </div>
            </div>
        )
    }

    const wineRate = wineTier === 'reserve' ? 35 : wineTier === 'prestige' ? 75 : 0
    const wineTotal = wineRate * guests
    const subtotal = (chef.rate * hours) + wineTotal
    const serviceFee = Math.round(subtotal * 0.1)
    const total = subtotal + serviceFee
    const depositAmount = Math.round(total * 0.2)

    const handleConfirmBooking = async () => {
        if (!user) { router.push(`/login?redirectTo=/book/${chefId}`); return }
        if (!date || !location) { alert('Please fill in the date and event location.'); return }
        setLoading(true)
        try {
            // The ID token is what authenticates this call. `userId` is no
            // longer sent: the server derives identity from the token, because
            // trusting a body field let anyone book as another user.
            const result = await apiFetch<{ url?: string; bookingId?: string }>('/api/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    chefId: chef.id,
                    chefName: chef.name,
                    chefSlug: chefId,
                    eventDate: date,
                    eventTime: time || '19:00',
                    durationHours: hours,
                    guestCount: guests,
                    eventType: event,
                    location,
                    specialRequests: notes,
                    depositOnly: isDeposit,
                    email: user.email,
                })
            })

            if (result.ok && result.data?.url) {
                window.location.href = result.data.url
                return
            }

            if (result.ok) {
                // Succeeded with no payment redirect (nothing left to charge).
                // The booking is recorded, so confirm it inline.
                setBookingComplete(true)
                return
            }

            // A failure must never render as a completed booking. The previous
            // version called setBookingComplete(true) from the catch block, so
            // a failed checkout looked successful to the guest.
            alert(result.error || 'We could not start the payment. Your card has not been charged.')
        } catch (e) {
            if (e instanceof NotSignedInError) {
                router.push(`/login?redirectTo=/book/${chefId}`)
                return
            }
            console.error('Booking checkout error:', e)
            alert('We could not start the payment. Your card has not been charged. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = () => {
        if (!chatInput.trim()) return
        if (!user) { router.push(`/login?redirectTo=/book/${chefId}`); return }

        const userMsg = { id: Date.now(), text: chatInput, sender: 'user' as const }
        setMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsTyping(true)

        // Real-time simulated response
        setTimeout(() => {
            setIsTyping(false)
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "That sounds excellent. I'll check my calendar and we can finalize the menu details shortly! I specialize in customizing the menu to fit your dietary needs.",
                sender: 'chef'
            }])
        }, 2000)
    }

    return (
        <div className="bg-background min-h-screen text-foreground">
            <Navbar />

            {/* Profile Header Image */}
            <div className="relative h-[300px] sm:h-[450px] w-full">
                <Image
                    src={chef.image}
                    alt={chef.name}
                    fill
                    unoptimized
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="flex items-end gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background overflow-hidden relative shadow-xl">
                            <Image src={chef.image} alt={chef.name} fill unoptimized className="object-cover" />
                        </div>
                        <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-[#FF5A36] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                                    {chef.badge}
                                </span>
                                <span className="flex items-center gap-1 text-sm font-semibold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/10">
                                    <MapPin className="w-3.5 h-3.5" /> {chef.location}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-md flex items-center gap-3">
                                {chef.name}
                                {chef.verified && (
                                    <span title="Verified Chef"><ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 fill-white mt-1" /></span>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">

                    {/* Left Column: Details or Booking Form */}
                    <div className="flex-1">

                        {!bookingComplete && (
                            <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
                                <button
                                    onClick={() => setView('profile')}
                                    className={`text-lg font-bold pb-4 -mb-[17px] border-b-2 transition-colors ${view === 'profile' ? 'border-[#FF5A36] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    Chef Profile
                                </button>
                                <button
                                    onClick={() => setView('book')}
                                    className={`text-lg font-bold pb-4 -mb-[17px] border-b-2 transition-colors ${view === 'book' ? 'border-[#FF5A36] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    Book Now
                                </button>
                            </div>
                        )}

                        {bookingComplete ? (
                            <div className="py-12 text-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-serif font-bold mb-4">You&apos;re booked!</h2>
                                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                                    {chef.name} has received your booking for {event} on {date}. They will review the details and confirm shortly.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <Link href="/user-dashboard" className="px-6 py-3 bg-[#FF5A36] text-white font-bold inline-flex rounded-xl hover:opacity-90 transition-opacity">
                                        View Dashboard
                                    </Link>
                                    <button onClick={() => setIsChatOpen(true)} className="px-6 py-3 border border-border font-bold inline-flex rounded-xl hover:bg-muted transition-colors">
                                        Chat with Chef
                                    </button>
                                </div>
                            </div>
                        ) : view === 'profile' ? (
                            <div className="space-y-10 animate-in fade-in">
                                {/* Bio */}
                                <section>
                                    <h2 className="text-2xl font-serif font-bold mb-4">About the Chef</h2>
                                    <p className="text-lg leading-relaxed text-muted-foreground">{chef.bio}</p>
                                </section>

                                {/* Sample Menus */}
                                <section>
                                    <h2 className="text-2xl font-serif font-bold mb-4">Signature Concepts</h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {chef.menus.map((menu: string, i: number) => (
                                            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden hover:border-[#FF5A36]/50 transition-colors cursor-pointer group shadow-sm flex flex-col">
                                                <div className="relative h-32 w-full">
                                                    <Image src={chef.menuImages[i]} alt={menu} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm text-[#FF5A36] flex items-center justify-center font-bold text-sm shadow-md">
                                                        {i + 1}
                                                    </div>
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="font-bold mb-1 group-hover:text-[#FF5A36] transition-colors">{menu}</h3>
                                                    <p className="text-sm text-muted-foreground mt-auto">Ask to customize this tasting menu for your event.</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Media / In Action */}
                                {chef.media && chef.media.length > 0 && (
                                    <section className="pt-6 border-t border-border">
                                        <h2 className="text-2xl font-serif font-bold mb-4">{chef.name.split(' ')[1] || 'Chef'} In Action</h2>
                                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
                                            {chef.media.map((url: string, i: number) => (
                                                <div key={i} className="relative w-48 sm:w-64 aspect-[9/16] rounded-2xl overflow-hidden snap-center shrink-0 border border-border shadow-sm">
                                                    <video src={url} playsInline autoPlay muted loop className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Location Map */}
                                <section className="pt-6 border-t border-border">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-6 h-6 text-[#FF5A36]" />
                                        <h2 className="text-2xl font-serif font-bold">Service Area</h2>
                                    </div>
                                    <p className="text-muted-foreground mb-4 font-medium">{chef.location} & Surrounding Areas</p>
                                    <div className="w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden border border-border shadow-sm relative bg-muted">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(chef.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}>
                                        </iframe>
                                    </div>
                                </section>

                                {/* Reviews snippet */}
                                <section className="pt-6 border-t border-border">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                                            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                            {chef.rating} <span className="text-muted-foreground text-lg font-normal">({chef.reviews} reviews)</span>
                                        </h2>
                                    </div>
                                    <div className="space-y-6">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="pb-6 border-b border-border last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold font-serif text-muted-foreground">
                                                        {i === 1 ? 'SL' : 'MK'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{i === 1 ? 'Sarah L.' : 'Michael K.'}</p>
                                                        <p className="text-xs text-muted-foreground">Reviewed 2 weeks ago</p>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    &quot;An absolutely incredible experience. The food was restaurant quality, perfectly timed, and the chef left our kitchen spotless. Highly recommend for any special occasion!&quot;
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 animate-in slide-in-from-right-4 duration-300 shadow-sm">
                                <h2 className="text-2xl font-serif font-bold mb-6">Event Details</h2>

                                {/* Event type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Event Type</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {EVENT_TYPES.map(e => (
                                            <button key={e} onClick={() => setEvent(e)}
                                                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${event === e ? 'bg-[#FF5A36] text-white border-[#FF5A36]' : 'bg-transparent border-border hover:border-foreground'}`}>
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date + Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#FF5A36] text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Start Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input type="time" value={time} onChange={e => setTime(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#FF5A36] text-sm font-medium" />
                                        </div>
                                    </div>
                                </div>

                                {/* Guests + Hours */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Guests</label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input type="number" min={1} max={100} value={guests} onChange={e => setGuests(+e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#FF5A36] text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Duration</label>
                                        <select value={hours} onChange={e => setHours(+e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#FF5A36] text-sm font-medium">
                                            {[2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h} hours</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input value={location} onChange={e => setLocation(e.target.value)}
                                            placeholder="Full address where the chef will cook"
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#FF5A36] text-sm font-medium" />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Special Requests</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Allergies, kitchen access notes, etc..."
                                        className="w-full px-5 py-4 rounded-2xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#FF5A36] text-sm resize-none font-medium" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Action Sidebar */}
                    <div className="lg:w-[400px] shrink-0">
                        <div className="sticky top-24 bg-card border border-border rounded-3xl p-6 shadow-xl shadow-[#FF5A36]/5">

                            {/* Chef rate header */}
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                                <div>
                                    <span className="text-3xl font-black text-foreground">{formatPrice(chef.rate)}</span>
                                    <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider ml-1">/ hour</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-bold">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" /> {chef.rating}
                                </div>
                            </div>

                            {/* Sommelier Wine Pairing Add-on */}
                            <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                                        🍷 Sommelier Wine Pairing
                                    </span>
                                    <span className="text-[10px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                                        Optional
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${wineTier === 'none' ? 'border-terracotta bg-terracotta/5 font-bold' : 'border-border bg-card'}`}>
                                        <input type="radio" name="wine" checked={wineTier === 'none'} onChange={() => setWineTier('none')} className="mt-0.5 accent-terracotta" />
                                        <div className="flex-1">
                                            <p className="text-foreground">No Wine Pairing</p>
                                            <p className="text-[10px] text-muted-foreground">BYO or soft drinks only</p>
                                        </div>
                                        <span className="text-muted-foreground">+£0</span>
                                    </label>

                                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${wineTier === 'reserve' ? 'border-terracotta bg-terracotta/5 font-bold' : 'border-border bg-card'}`}>
                                        <input type="radio" name="wine" checked={wineTier === 'reserve'} onChange={() => setWineTier('reserve')} className="mt-0.5 accent-terracotta" />
                                        <div className="flex-1">
                                            <p className="text-foreground">Sommelier Reserve</p>
                                            <p className="text-[10px] text-muted-foreground">Biodynamic & vintage European pairings</p>
                                        </div>
                                        <span className="text-terracotta font-bold">+{formatPrice(35)}/guest</span>
                                    </label>

                                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${wineTier === 'prestige' ? 'border-terracotta bg-terracotta/5 font-bold' : 'border-border bg-card'}`}>
                                        <input type="radio" name="wine" checked={wineTier === 'prestige'} onChange={() => setWineTier('prestige')} className="mt-0.5 accent-terracotta" />
                                        <div className="flex-1">
                                            <p className="text-foreground">Grand Cru Prestige</p>
                                            <p className="text-[10px] text-muted-foreground">Rare vintage Champagne & Bordeaux</p>
                                        </div>
                                        <span className="text-terracotta font-bold">+{formatPrice(75)}/guest</span>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Options (Deposit & Escrow) */}
                            <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                                    Payment Schedule (Escrow Protected)
                                </span>
                                <div className="space-y-2">
                                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${!isDeposit ? 'border-terracotta bg-terracotta/5' : 'border-border bg-card'}`}>
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            checked={!isDeposit}
                                            onChange={() => setIsDeposit(false)}
                                            className="mt-1 accent-terracotta"
                                        />
                                        <div className="text-xs">
                                            <p className="font-bold text-foreground">Pay in Full Today ({formatPrice(total)})</p>
                                            <p className="text-muted-foreground">Held securely in platform escrow until after event</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isDeposit ? 'border-terracotta bg-terracotta/5' : 'border-border bg-card'}`}>
                                        <input
                                            type="radio"
                                            name="paymentType"
                                            checked={isDeposit}
                                            onChange={() => setIsDeposit(true)}
                                            className="mt-1 accent-terracotta"
                                        />
                                        <div className="text-xs">
                                            <p className="font-bold text-terracotta">Pay 20% Deposit ({formatPrice(depositAmount)})</p>
                                            <p className="text-muted-foreground">Remaining {formatPrice(total - depositAmount)} charged automatically 14 days prior</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-3 mb-6 text-sm font-medium">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Chef fee ({hours}h × {formatPrice(chef.rate)})</span>
                                    <span className="text-foreground font-semibold">{formatPrice(chef.rate * hours)}</span>
                                </div>
                                {wineTotal > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Wine pairing ({guests} guests)</span>
                                        <span className="text-terracotta font-semibold">+{formatPrice(wineTotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Service & Escrow Insurance (10%)</span>
                                    <span className="text-foreground font-semibold">{formatPrice(serviceFee)}</span>
                                </div>
                                <div className="pt-4 mt-2 border-t border-border flex justify-between items-center text-xl font-bold">
                                    <span>Due Today</span>
                                    <span className="text-[#FF5A36]">{formatPrice(isDeposit ? depositAmount : total)}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!bookingComplete && (
                                    <>
                                        <button
                                            onClick={() => view === 'book' ? handleConfirmBooking() : setView('book')}
                                            disabled={loading}
                                            className="w-full py-4 bg-[#FF5A36] text-white font-bold text-lg rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF5A36]/20"
                                        >
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : view === 'book' ? `Pay ${formatPrice(isDeposit ? depositAmount : total)} via Stripe` : 'Book Chef'}
                                        </button>
                                        <button
                                            onClick={() => setIsChatOpen(true)}
                                            className="w-full py-4 border-2 border-border bg-background hover:bg-muted text-foreground font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle className="w-5 h-5" /> Message {chef.name.split(' ')[1]}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Trust signals & Test notice */}
                            <div className="mt-6 flex flex-col gap-3">
                                <div className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-xl text-xs font-semibold text-terracotta flex items-center gap-2">
                                    <span>💳 Test Mode: Use card <strong>4242 4242 4242 4242</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium bg-muted p-3 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Escrow Protection: Funds released post-event</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                    <Users className="w-5 h-5 shrink-0" /> Over {chef.reviews * 3} guests served
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />

            {/* Real-time Demo Chat Window */}
            {isChatOpen && (
                <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[600px] sm:h-[650px] max-h-screen bg-card border border-border sm:rounded-3xl shadow-2xl flex flex-col z-[100] animate-in fade-in slide-in-from-bottom-10">

                    {/* Chat Header */}
                    <div className="h-16 bg-muted/50 border-b border-border flex items-center justify-between px-4 shrink-0 sm:rounded-t-3xl backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cover bg-center border border-border shadow-sm" style={{ backgroundImage: `url(${chef.image})` }} />
                            <div>
                                <h3 className="font-bold leading-tight">{chef.name}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 flex items-center justify-center bg-card hover:bg-border rounded-full transition-colors border border-border shadow-sm">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                        <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest my-4 opacity-50">
                            Conversation started
                        </div>

                        {messages.map(msg => (
                            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed relative shadow-sm ${msg.sender === 'user'
                                    ? 'bg-[#FF5A36] text-white rounded-br-sm'
                                    : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-muted border border-border/50 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card border-t border-border shrink-0 sm:rounded-b-3xl">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                placeholder={`Message ${chef.name.split(' ')[1]}...`}
                                className="flex-1 max-h-[120px] min-h-[48px] bg-muted/50 border border-border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/50 resize-none text-[15px]"
                                rows={1}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim()}
                                className="w-12 h-12 shrink-0 bg-[#FF5A36] text-white rounded-2xl flex items-center justify-center hover:bg-[#E84A2A] disabled:opacity-40 transition-colors shadow-sm"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </div>
                        {!user && (
                            <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                                <Link href="/login" className="text-[#FF5A36] hover:underline">Log in</Link> to save this conversation.
                            </p>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}
