'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search } from 'lucide-react'

const QUICK_TAGS = ['Italian', 'Japanese', 'French', 'London', 'Dubai', 'New York']

export function Hero() {
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSearch = () => {
        const q = query.trim()
        router.push(q ? `/find-chefs?q=${encodeURIComponent(q)}` : '/find-chefs')
    }

    const handleTag = (tag: string) => {
        setQuery(tag)
        router.push(`/find-chefs?q=${encodeURIComponent(tag)}`)
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920&q=80"
                    alt="Chef cooking in a professional kitchen"
                    fill
                    priority
                    className="object-cover"
                    quality={80}
                />
            </div>
            <div className="absolute inset-0 bg-black/65" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto py-16 sm:py-24">
                {/* Badge */}
                <div className="inline-block mb-6 sm:mb-8 px-4 sm:px-5 py-2 bg-white/10 border border-white/20 rounded-full text-white/90 text-xs sm:text-sm font-medium tracking-wide backdrop-blur-sm">
                    🍳 The World&apos;s Premier Private Chef Marketplace
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 sm:mb-6 leading-tight">
                    Hire a Chef for<br className="hidden sm:block" /> Any Occasion
                </h1>

                <p className="text-base sm:text-xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
                    From home dinners to presidential banquets, ChefMii Global connects you with top chefs globally.
                </p>

                {/* CTA Tabs */}
                <div className="w-full max-w-2xl mx-auto mb-6 flex gap-2 justify-center flex-wrap">
                    <button onClick={() => router.push('/find-chefs')} className="px-4 sm:px-6 py-2 bg-white text-black font-bold rounded-full text-xs sm:text-sm hover:bg-white/90 transition-colors">
                        📅 Book a Chef
                    </button>
                    <button onClick={() => router.push('/waitlist')} className="px-4 sm:px-6 py-2 bg-[#FF5A36] text-white font-bold rounded-full text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-lg">
                        Join Waitlist
                    </button>
                    <button onClick={() => router.push('/order')} className="px-4 sm:px-6 py-2 bg-white/20 border border-white/40 text-white font-bold rounded-full text-xs sm:text-sm hover:bg-white/30 transition-colors">
                        🍽️ Order Food
                    </button>
                </div>

                {/* Search box */}
                <div className="w-full max-w-2xl mx-auto">
                    <p className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-3">Find a Chef</p>
                    <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center flex-1 px-4 sm:px-5 py-1">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 mr-3" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Location, cuisine, or chef name…"
                                className="flex-1 py-3 sm:py-4 text-sm text-foreground placeholder:text-muted-foreground/70 bg-transparent focus:outline-none min-h-[44px]"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="gradient-brand text-white font-bold px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] hover:opacity-90 transition-opacity text-sm tracking-wide uppercase"
                        >
                            Search
                        </button>
                    </div>

                    {/* Quick tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 sm:mt-5">
                        {QUICK_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTag(tag)}
                                className="px-3 sm:px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs hover:bg-white/20 transition-colors backdrop-blur-sm min-h-[36px]"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 text-white/60 text-xs sm:text-sm">
                    <span>⭐ <strong className="text-white">4.9</strong> avg rating</span>
                    <span>👨‍🍳 <strong className="text-white">500+</strong> verified chefs</span>
                    <span>🔒 <strong className="text-white">Secure</strong> payments</span>
                    <span>🌍 <strong className="text-white">Worldwide</strong> coverage</span>
                </div>
            </div>
        </section>
    )
}
