'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Linkedin, Send } from 'lucide-react'

import { BrandLogo } from '@/components/layout/logo'

const footerLinks = {
    'Explore': [
        { href: '/find-chefs', label: 'Find a Chef' },
        { href: '/reviews', label: 'Verified Reviews ⭐' },
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/packages', label: 'Event Packages' },
        { href: '/academy', label: 'Chef Academy' },
    ],
    'Company': [
        { href: '/about', label: 'About Us' },
        { href: '/become-a-chef', label: 'Join as a Chef' },
        { href: '/careers', label: 'Careers' },
        { href: '/press', label: 'Press' },
    ],
    'Legal': [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/cookies', label: 'Cookie Policy' },
        { href: '/contact', label: 'Contact Support' },
    ],
}

export function Footer() {
    const [email, setEmail] = useState('')

    const handleSubscribe = () => {
        if (email.trim()) {
            alert(`Thanks! You've subscribed with ${email}`)
            setEmail('')
        }
    }

    return (
        <footer className="bg-[#0f0e0e] text-white pt-20 pb-10 border-t border-[#2a2a2a] relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-[#FF5A36] opacity-5 blur-[150px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    {/* Brand Info */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <BrandLogo size="lg" />
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
                            The world&apos;s premier platform for private dining. We connect you with world-class chefs for unforgettable culinary experiences, from intimate dinners to grand banquets.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#FF5A36] hover:text-white hover:border-[#FF5A36] transition-all duration-300"
                                    aria-label="Social link"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title} className="lg:col-span-1">
                            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-xs">
                                {title}
                            </h3>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-zinc-400 text-sm hover:text-[#FF5A36] transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter & Bottom Bar */}
                <div className="pt-8 border-t border-zinc-800 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl w-full max-w-md">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Subscribe to our newsletter..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none min-w-0"
                        />
                        <button
                            onClick={handleSubscribe}
                            className="w-full sm:w-auto bg-[#FF5A36] text-white p-2 sm:px-6 sm:py-2 rounded-xl text-sm font-semibold hover:bg-[#E84A2A] transition-colors flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4 sm:hidden" />
                            <span className="hidden sm:inline">Subscribe</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left text-zinc-500 text-xs sm:text-sm">
                        <p>© {new Date().getFullYear()} ChefMii Global. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
