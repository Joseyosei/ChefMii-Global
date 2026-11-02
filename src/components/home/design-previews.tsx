'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Calendar, BookOpen, Baby, ShoppingBag } from 'lucide-react'

const PLATFORM_PREVIEWS = [
    {
        id: 'events',
        title: 'Design Your Event',
        desc: 'From intimate dinners to grand weddings, select the perfect package.',
        icon: Calendar,
        image: '/images/events/event_intimate_dinner.png',
        href: '/packages',
        colSpan: 'md:col-span-2'
    },
    {
        id: 'marketplace',
        title: 'Marketplace',
        desc: 'Shop chef-curated premium ingredients.',
        icon: ShoppingBag,
        image: '/images/marketplace/marketplace_truffle_oil.png',
        href: '/marketplace',
        colSpan: 'md:col-span-1'
    },
    {
        id: 'academy',
        title: 'Chef Academy',
        desc: 'Masterclasses by the worlds best.',
        icon: BookOpen,
        image: '/images/events/event_corporate_dining.png',
        href: '/academy',
        colSpan: 'md:col-span-1'
    },
    {
        id: 'kids',
        title: 'Kids Zone',
        desc: 'Interactive cooking experiences for the little ones.',
        icon: Baby,
        image: '/images/events/kids_cooking.png',
        href: '/kids-zone',
        colSpan: 'md:col-span-2'
    },
]

export function DesignPreviews() {
    return (
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-t border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5A36] opacity-5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5A36]/10 text-[#FF5A36] text-sm font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-4 h-4" /> Explore ChefMii Global
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-6">
                        Design Your Experience
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Beyond private dining, ChefMii Global is a culinary ecosystem. Discover exclusive ingredients, book comprehensive event packages, or learn from the masters.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLATFORM_PREVIEWS.map((preview) => (
                        <Link
                            href={preview.href}
                            key={preview.id}
                            className={`group relative rounded-3xl overflow-hidden block ${preview.colSpan} h-[300px] sm:h-[400px] border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500`}
                        >
                            <Image
                                src={preview.image}
                                alt={preview.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity group-hover:opacity-90" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                <div className="w-12 h-12 rounded-full bg-[#FF5A36] text-white flex items-center justify-center mb-4 shadow-lg">
                                    <preview.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">
                                    {preview.title}
                                </h3>
                                <p className="text-white/80 font-medium">
                                    {preview.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
