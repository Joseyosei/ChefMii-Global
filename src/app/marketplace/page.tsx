'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { ShoppingCart, Star, Search, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { CartDrawer } from '@/components/marketplace/cart-drawer'
import { ProductDetailModal } from '@/components/marketplace/product-detail-modal'

interface Product {
    id: string
    name: string
    chef: string
    price: number
    rating: number
    reviews: number
    category: string
    photo: string
    badge: string | null
    description?: string
    details?: string[]
}

const CATEGORIES = ['All', 'Oils & Vinegars', 'Spices & Herbs', 'Chocolate', 'Preserved Foods', 'Specialty Salts', 'Tea & Matcha']

const PRODUCTS = [
    {
        id: 'p1',
        name: 'Premium Sicilian Olive Oil',
        chef: 'Chef Marco Rossi',
        price: 18.99,
        rating: 4.9,
        reviews: 214,
        category: 'Oils & Vinegars',
        photo: '/images/marketplace/marketplace_olive_oil.png',
        badge: 'Best Seller',
        description: 'Cold-pressed from hand-picked olives in the heart of Sicily. This extra virgin olive oil features a robust, peppery finish with notes of fresh herbs and almond.',
        details: [
            '100% Organic Extra Virgin Olive Oil',
            'Cold-pressed within 24 hours of harvest',
            'Origin: Sicily, Italy',
            'Perfect for finishing, salads, and dipping'
        ]
    },
    {
        id: 'p2',
        name: 'Authentic Jollof Spice Blend',
        chef: 'Chef Aisha Okafor',
        price: 12.50,
        rating: 4.8,
        reviews: 97,
        category: 'Spices & Herbs',
        photo: '/images/marketplace/marketplace_jollof_spice.png',
        badge: 'Chef Pick',
        description: 'A secret blend of aromatic spices including thyme, bay leaves, and scotch bonnet peppers. Developed by Chef Aisha to bring the true taste of West Africa to your kitchen.',
        details: [
            'All-natural, no preservatives',
            'Spiced for medium heat',
            'Hand-blended in small batches',
            'Ideal for Jollof rice, stews, and grilled chicken'
        ]
    },
    {
        id: 'p3',
        name: 'Matcha Ceremonial Grade',
        chef: 'Chef Yuki Tanaka',
        price: 29.99,
        rating: 5.0,
        reviews: 63,
        category: 'Tea & Matcha',
        photo: '/images/marketplace/marketplace_matcha.png',
        badge: 'Premium',
        description: 'Stone-ground from the finest shade-grown tencha leaves in Uji, Japan. Vibrant green color with a smooth, umami-rich flavor and natural sweetness.',
        details: [
            '100% Japanese Ceremonial Grade Matcha',
            'High in antioxidants and L-theanine',
            'Vibrant emerald green color',
            'Perfect for traditional tea ceremonies or latte'
        ]
    },
    {
        id: 'p4',
        name: 'Black Garlic Fermented Bulbs',
        chef: 'Chef Pierre Dubois',
        price: 11.00,
        rating: 4.7,
        reviews: 138,
        category: 'Specialty Salts',
        photo: '/images/marketplace/marketplace_black_garlic.png',
        badge: null,
        description: 'Slow-fermented for 60 days to develop a complex, balsamic-like sweetness and a soft, spreadable texture. Adds an incredible depth of savory umami.',
        details: [
            'Naturally fermented without additives',
            'Rich in S-Allylcysteine',
            'Peel and use directly',
            'Great for risottos, sauces, and compound butter'
        ]
    },
    {
        id: 'p5',
        name: 'Smoked Spanish Sea Salt',
        chef: 'Chef Sofía Mendez',
        price: 9.99,
        rating: 4.8,
        reviews: 176,
        category: 'Specialty Salts',
        photo: '/images/marketplace/marketplace_sea_salt.png',
        badge: 'Artisan',
        description: 'Harvested from the Mediterranean and naturally smoked over holm oak wood. Provides a delicate crunch and a sophisticated smokiness.',
        details: [
            'Naturally smoked over wood fire',
            'Unrefined sea salt from Spain',
            'Rich in trace minerals',
            'Excellent for finishing grilled meats and vegetables'
        ]
    },
    {
        id: 'p6',
        name: 'Valrhona Dark Chocolate 72%',
        chef: 'Chef Pierre Dubois',
        price: 22.00,
        rating: 4.9,
        reviews: 89,
        category: 'Chocolate',
        photo: '/images/marketplace/marketplace_chocolate.png',
        badge: 'Limited',
        description: 'Exceptional dark chocolate with a high cocoa content. Notes of red fruits and toasted nuts with a long, elegant finish.',
        details: [
            '72% Cocoa solids',
            'Sustainably sourced cocoa beans',
            'The choice of Michelin-starred pastry chefs',
            'Ideal for ganaches, baking, or pure indulgence'
        ]
    },
    {
        id: 'p7',
        name: 'San Marzano DOP Tomatoes',
        chef: 'Chef Marco Rossi',
        price: 7.50,
        rating: 4.8,
        reviews: 245,
        category: 'Preserved Foods',
        photo: '/images/marketplace/marketplace_san_marzano.png',
        badge: 'Best Seller',
        description: 'Grown in the volcanic soil of Mount Vesuvius. Prize for their thin skins, meaty flesh, and perfect balance of sweetness and acidity.',
        details: [
            'DOP Certified San Marzano Tomatoes',
            'Grown in Valle del Sarno, Italy',
            'Hand-picked and peeled',
            'The essential base for Neapolitan pizza and pasta'
        ]
    },
    {
        id: 'p8',
        name: 'White Truffle Infused Oil',
        chef: 'Chef Pierre Dubois',
        price: 44.00,
        rating: 4.9,
        reviews: 52,
        category: 'Oils & Vinegars',
        photo: '/images/marketplace/marketplace_truffle_oil.png',
        badge: 'Luxury',
        description: 'Premium olive oil infused with the rare and intensely aromatic essence of Italian white truffles. A luxurious finishing oil.',
        details: [
            'Infused with real Tuber Magnatum Pico',
            'Base of Italian Extra Virgin Olive Oil',
            'Intense earthy and garlic-like aroma',
            'Elevates pasta, eggs, and mushrooms'
        ]
    },
]

const BADGE_COLORS: Record<string, string> = {
    'Best Seller': 'bg-terracotta text-white',
    'Chef Pick': 'bg-green-600 text-white',
    'Premium': 'bg-purple-600 text-white',
    'Artisan': 'bg-amber-600 text-white',
    'Limited': 'bg-red-600 text-white',
    'Luxury': 'bg-yellow-600 text-white',
}

export default function MarketplacePage() {
    const [category, setCategory] = useState('All')
    const [query, setQuery] = useState('')
    const [liked, setLiked] = useState<string[]>([])
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    // Zustand Cart State
    const { items: cartItems, addItem, removeItem, setIsOpen, getTotalItems } = useCartStore()

    const filtered = PRODUCTS.filter(p =>
        (category === 'All' || p.category === category) &&
        (p.name.toLowerCase().includes(query.toLowerCase()) || p.chef.toLowerCase().includes(query.toLowerCase()))
    )

    const toggleLike = (id: string) => setLiked(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id])

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                {/* Hero */}
                <div className="gradient-brand pt-28 pb-14 sm:pt-32 sm:pb-20 px-4 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70 mb-3 block">🛒 Chef-Curated</span>
                        <h1 className="text-4xl sm:text-6xl font-serif font-bold mb-4">Chef Marketplace</h1>
                        <p className="text-white/80 text-base sm:text-lg mb-8">Premium ingredients & kitchen essentials hand-picked by our world-class chefs</p>
                        {/* Search */}
                        <div className="flex bg-white rounded-2xl overflow-hidden shadow-xl max-w-lg mx-auto">
                            <div className="flex items-center flex-1 px-4">
                                <Search className="w-4 h-4 text-muted-foreground shrink-0 mr-3" />
                                <input value={query} onChange={e => setQuery(e.target.value)}
                                    placeholder="Search products or chefs…"
                                    className="flex-1 py-3.5 text-sm text-foreground bg-transparent focus:outline-none min-h-[48px]" />
                            </div>
                            <button className="gradient-brand text-white px-6 min-h-[48px] font-bold text-sm hover:opacity-90">Search</button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    {/* Cart indicator */}
                    {getTotalItems() > 0 && (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="fixed top-24 sm:top-20 right-4 z-40 gradient-brand text-white font-black rounded-2xl px-4 py-2.5 shadow-[0_8px_30px_rgb(232,82,10,0.3)] flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transition-all"
                        >
                            <ShoppingCart className="w-4 h-4" />{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} added
                        </button>
                    )}

                    {/* Category filter chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                        {CATEGORIES.map(c => (
                            <button key={c} onClick={() => setCategory(c)}
                                className={`px-4 py-2 min-h-[40px] rounded-full text-sm font-semibold border whitespace-nowrap shrink-0 transition-colors ${category === c ? 'gradient-brand text-white border-transparent' : 'border-border bg-card hover:border-terracotta hover:text-terracotta'}`}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-muted-foreground mb-6">
                        <span className="font-bold text-foreground">{filtered.length}</span> products found
                    </p>

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filtered.map(p => {
                            const inCart = cartItems.some(i => i.id === p.id)
                            const isLiked = liked.includes(p.id)
                            return (
                                <div key={p.id} className="bg-card rounded-2xl border border-border flex flex-col overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
                                    {/* Product image */}
                                    <div 
                                        className="relative h-36 sm:h-44 bg-muted overflow-hidden cursor-pointer"
                                        onClick={() => setSelectedProduct(p)}
                                    >
                                        <Image src={p.photo} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {/* Badge */}
                                        {p.badge && (
                                            <span className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full font-bold ${BADGE_COLORS[p.badge] ?? 'bg-gray-500 text-white'}`}>
                                                {p.badge}
                                            </span>
                                        )}
                                        {/* Like button */}
                                        <button onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform">
                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                                        </button>
                                    </div>

                                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                                        <p className="text-xs text-terracotta font-semibold mb-0.5">{p.chef}</p>
                                        <h3 
                                            className="font-bold text-xs sm:text-sm leading-snug mb-2 flex-1 group-hover:text-terracotta transition-colors cursor-pointer"
                                            onClick={() => setSelectedProduct(p)}
                                        >
                                            {p.name}
                                        </h3>
                                        <div className="flex items-center gap-1 mb-3">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                                            <span className="text-xs font-bold">{p.rating}</span>
                                            <span className="text-xs text-muted-foreground">({p.reviews})</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-black text-foreground text-base sm:text-lg">£{p.price.toFixed(2)}</span>
                                            {inCart ? (
                                                <button onClick={() => removeItem(p.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-all bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600">
                                                    ✓ Added
                                                </button>
                                            ) : (
                                                <button onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.photo, chef: p.chef })}
                                                    className="flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-all gradient-brand text-white hover:opacity-90 shadow-md">
                                                    <ShoppingCart className="w-3.5 h-3.5" />Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-5xl mb-4">🛒</p>
                            <h3 className="font-bold text-xl mb-2">No products found</h3>
                            <button onClick={() => { setCategory('All'); setQuery('') }}
                                className="mt-4 px-6 py-2.5 gradient-brand text-white rounded-xl font-semibold text-sm hover:opacity-90">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <CartDrawer />
            <ProductDetailModal 
                product={selectedProduct} 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
            />
            <ChatbotWidget />
        </>
    )
}
