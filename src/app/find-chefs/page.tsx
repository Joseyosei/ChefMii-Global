'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { Search, Star, MapPin, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { CUISINES } from '@/lib/chefs/seed-catalogue'
import { fetchDirectory, seedCards, type DirectoryCard } from '@/lib/chefs/directory-client'


function FindChefsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const initialQuery = searchParams.get('q') || searchParams.get('location') || ''
    const initialCuisine = searchParams.get('cuisine') || 'All'

    const [query, setQuery] = useState(initialQuery)
    const [cuisine, setCuisine] = useState(initialCuisine)
    const [maxRate, setMaxRate] = useState(500)
    const [minRate, setMinRate] = useState(0)
    const [sort, setSort] = useState<'rating' | 'price-low' | 'price-high'>('rating')
    const [filtersOpen, setFiltersOpen] = useState(false)

    // Live chef directory. Seeded with the demo catalogue so the grid renders
    // immediately, then replaced with real verified chefs from /api/chefs.
    const [chefs, setChefs] = useState<DirectoryCard[]>(() => seedCards())
    const [loadingChefs, setLoadingChefs] = useState(true)

    useEffect(() => {
        const controller = new AbortController()

        fetchDirectory(controller.signal)
            .then(({ chefs: live }) => {
                // An aborted fetch resolves to an empty list; keep what we have.
                if (live.length > 0) setChefs(live)
            })
            .finally(() => setLoadingChefs(false))

        return () => controller.abort()
    }, [])

    useEffect(() => {
        const q = searchParams.get('q') || searchParams.get('location') || ''
        const c = searchParams.get('cuisine') || 'All'
        if (q) setQuery(q)
        if (c && c !== 'All') setCuisine(c)
    }, [searchParams])

    let filtered = chefs.filter(c => {
        const matchesCuisine = (cuisine === 'All' || c.cuisine.toLowerCase() === cuisine.toLowerCase())
        const matchesRate = c.rate >= minRate && c.rate <= maxRate
        const matchesQuery = !query || (
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.cuisine.toLowerCase().includes(query.toLowerCase()) ||
            c.location.toLowerCase().includes(query.toLowerCase())
        )
        return matchesCuisine && matchesRate && matchesQuery
    })

    if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating)
    if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.rate - b.rate)
    if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.rate - a.rate)

    return (
        <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20">
            {/* Search header */}
            <div className="gradient-brand py-10 sm:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3 sm:mb-4">Find Your Perfect Chef</h1>
                    <p className="text-white/80 mb-6 sm:mb-8 text-sm sm:text-lg">Browse verified master chefs across 16 countries worldwide</p>
                    <div className="flex bg-white rounded-2xl overflow-hidden shadow-xl border border-white/20">
                        <div className="flex items-center flex-1 px-4">
                            <Search className="w-5 h-5 text-muted-foreground shrink-0 mr-3" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && router.push(`/find-chefs?q=${encodeURIComponent(query)}`)}
                                placeholder="Cuisine, chef name, or city (e.g. London, Tokyo, Paris)…"
                                className="flex-1 py-3 sm:py-4 text-sm text-foreground bg-transparent focus:outline-none min-h-[44px]"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-1 hover:text-foreground text-muted-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => router.push(`/find-chefs?q=${encodeURIComponent(query)}`)}
                            className="bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold px-6 py-3 transition-colors flex items-center gap-2"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Cuisines horizontal scroller */}
            <div className="border-b border-border bg-white dark:bg-stone-900 sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
                    {CUISINES.map(c => (
                        <button
                            key={c}
                            onClick={() => setCuisine(c)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${cuisine === c
                                ? 'bg-terracotta text-white border-terracotta shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-foreground border-border hover:border-terracotta/50'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Filter and count bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {loadingChefs && <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta" />}
                        Showing <span className="font-bold text-foreground">{filtered.length}</span> verified master chefs
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-xs font-bold bg-white dark:bg-stone-900 hover:bg-stone-100 transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-terracotta" />
                            Filters
                        </button>
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value as any)}
                            className="px-3 py-2 border border-border rounded-xl text-xs font-bold bg-white dark:bg-stone-900 focus:outline-none"
                        >
                            <option value="rating">Top Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Filter drawer */}
                {filtersOpen && (
                    <div className="bg-white dark:bg-stone-900 border border-border rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-sm">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                                Max Hourly Rate: £{maxRate}/hr
                            </label>
                            <input
                                type="range"
                                min={50}
                                max={500}
                                step={10}
                                value={maxRate}
                                onChange={e => setMaxRate(Number(e.target.value))}
                                className="w-full accent-terracotta"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>£50/hr</span>
                                <span>£500/hr</span>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setQuery(''); setCuisine('All'); setMaxRate(500); }}
                                className="text-xs font-bold text-terracotta hover:underline"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Chefs grid */}
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-stone-900 border border-border rounded-3xl p-12 text-center space-y-4">
                        <p className="text-4xl">👨‍🍳</p>
                        <h3 className="text-xl font-bold text-foreground">No chefs found matching your criteria</h3>
                        <p className="text-sm text-muted-foreground">Try clearing your filters or searching for another cuisine or location.</p>
                        <button
                            onClick={() => { setQuery(''); setCuisine('All'); setMaxRate(500); }}
                            className="px-6 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl shadow-md"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map(chef => (
                            <div
                                key={chef.id}
                                className="bg-white dark:bg-stone-900 border border-border/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-terracotta/50 transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div className="relative h-60 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                                    <Image
                                        src={chef.photo}
                                        alt={chef.name}
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                                    {chef.badge && (
                                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                                            {chef.badge}
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                                        <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                                            <MapPin className="w-3.5 h-3.5 text-terracotta" />
                                            {chef.location}
                                        </span>
                                        <span className="flex items-center gap-1 bg-amber-500/90 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                                            <Star className="w-3 h-3 fill-white text-white" />
                                            {chef.rating}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="font-bold text-base text-foreground group-hover:text-terracotta transition-colors mb-1">
                                            {chef.name}
                                        </h3>
                                        <p className="text-xs text-terracotta font-bold mb-2">{chef.cuisine}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {chef.bio}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Rate</span>
                                            <span className="text-terracotta font-black text-lg">£{chef.rate}/hr</span>
                                        </div>
                                        <Link
                                            href={`/book/${chef.id}`}
                                            className="px-4 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-xs"
                                        >
                                            Book Chef →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

export default function FindChefsPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
                    <Loader2 className="w-8 h-8 text-terracotta animate-spin" />
                </div>
            }>
                <FindChefsContent />
            </Suspense>
            <Footer />
            <ChatbotWidget />
        </>
    )
}
