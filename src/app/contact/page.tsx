'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
    MessageSquare, Mail, Phone, Clock, MapPin,
    ShieldCheck, Sparkles, Send, CheckCircle2, ChevronDown,
    Headphones, AlertCircle, HelpCircle
} from 'lucide-react'

const FAQ_ITEMS = [
    {
        q: 'How does ChefMii Global Escrow Protection work for clients?',
        a: 'When you book a chef, 100% of your payment is safely held in Stripe Escrow. Funds are only transferred to the chef 24 hours after your dining experience is complete and you are delighted.',
    },
    {
        q: 'What should I do if my event is today and I need urgent assistance?',
        a: 'For live bookings scheduled within the next 24 hours, call our 24/7 VIP Dining Concierge hotline directly at +44 (0) 20 7946 0912 or select "Urgent Today Event" on the support form.',
    },
    {
        q: 'How are master chefs vetted before cooking in my home?',
        a: 'Every chef undergoes a rigorous 7-stage vetting process including background DBS checks, food hygiene certification, blind tasting auditions, and references from Michelin/fine dining establishments.',
    },
    {
        q: 'Can I request bespoke menus for severe dietary allergies?',
        a: 'Yes! During booking checkout, you can input granular allergy profiles (celiac, shellfish, nut-free, vegan, kosher, halal). Your chef will custom-design your menu accordingly.',
    },
]

export default function ContactSupportPage() {
    const [inquiryType, setInquiryType] = useState('booking')
    const [priority, setPriority] = useState('standard')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [bookingId, setBookingId] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)
    const [openFaq, setOpenFaq] = useState<number | null>(0)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setTimeout(() => {
            const ticketId = `CM-${Math.floor(100000 + Math.random() * 900000)}`
            setSubmittedTicket(ticketId)
            setSubmitting(false)
        }, 1000)
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                {/* Hero */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-16 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-6">
                        <Headphones className="w-3.5 h-3.5" />
                        24/7 Global Dining Concierge
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                        We&apos;re Here to Assist You.
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Whether you&apos;re planning a bespoke private dinner, have a question about Stripe escrow, or need chef assistance — our team responds in minutes.
                    </p>
                </section>

                {/* Direct Channels Cards */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">Emergency Hotline</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Dedicated 24/7 line for active in-progress bookings and live event coordination.</p>
                            <p className="text-sm font-bold text-terracotta pt-1">+44 (0) 20 7946 0912</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">Client Concierge</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Menu customizations, chef matching, dietary consulting, and billing support.</p>
                            <a href="mailto:concierge@chefmii.com" className="text-sm font-bold text-terracotta pt-1 block hover:underline">
                                concierge@chefmii.com
                            </a>
                        </div>

                        <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">Chef & Business Desk</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">Chef verification, Stripe Connect payouts, corporate summits, and partnership inquiries.</p>
                            <a href="mailto:chefs@chefmii.com" className="text-sm font-bold text-terracotta pt-1 block hover:underline">
                                chefs@chefmii.com
                            </a>
                        </div>
                    </div>
                </section>

                {/* Form & FAQs Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Form */}
                        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-border rounded-3xl p-8 sm:p-10 shadow-md">
                            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Send Concierge Message</h2>
                            <p className="text-xs text-muted-foreground mb-6">Fill out the details below and a dedicated concierge agent will follow up.</p>

                            {submittedTicket ? (
                                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-fade-in">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Support Request Dispatched!</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                        Your ticket <span className="font-mono font-bold text-emerald-600">{submittedTicket}</span> has been assigned to our Mayfair Concierge Team. Check your email for real-time updates.
                                    </p>
                                    <button
                                        onClick={() => { setSubmittedTicket(null); setMessage(''); setBookingId(''); }}
                                        className="px-6 py-2 rounded-xl bg-card border border-border text-xs font-bold hover:bg-muted"
                                    >
                                        Submit Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1">Inquiry Type</label>
                                            <select
                                                value={inquiryType}
                                                onChange={e => setInquiryType(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                            >
                                                <option value="booking">Private Chef Reservation</option>
                                                <option value="billing">Stripe Billing & Escrow</option>
                                                <option value="chef">Chef Onboarding & Payouts</option>
                                                <option value="corporate">Corporate Summit & Catering</option>
                                                <option value="tech">Technical App Issue</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1">Priority</label>
                                            <select
                                                value={priority}
                                                onChange={e => setPriority(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                            >
                                                <option value="standard">Standard (Within 4 hours)</option>
                                                <option value="high">High Priority</option>
                                                <option value="urgent">🚨 Urgent Today Event (&lt;15 mins)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1">Your Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="Marcus Aurelius"
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="marcus@example.com"
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1">Booking / Order ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={bookingId}
                                            onChange={e => setBookingId(e.target.value)}
                                            placeholder="e.g. BK-9821 or #CF892"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1">Message Details *</label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Please describe how we can assist with your menu, booking, or chef inquiries..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submitting ? 'Connecting with Concierge...' : 'Dispatch Message →'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* FAQs Accordion */}
                        <div className="lg:col-span-5 space-y-6">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-foreground mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-terracotta" />
                                    Quick Answers
                                </h2>
                                <p className="text-xs text-muted-foreground">Frequently asked client & chef questions.</p>
                            </div>

                            <div className="space-y-3">
                                {FAQ_ITEMS.map((faq, i) => (
                                    <div
                                        key={i}
                                        className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-border shadow-xs cursor-pointer transition-all"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-bold text-xs text-foreground leading-snug">{faq.q}</h3>
                                            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-terracotta' : ''}`} />
                                        </div>
                                        {openFaq === i && (
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border/60 animate-fade-in">
                                                {faq.a}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-black text-white border border-stone-800 space-y-2">
                                <p className="font-bold text-sm">Need direct WhatsApp support?</p>
                                <p className="text-xs text-stone-300">Message our on-duty chef coordinator for instant live dining assistance.</p>
                                <a
                                    href="https://wa.me/442079460912"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                                >
                                    Open WhatsApp Concierge →
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
