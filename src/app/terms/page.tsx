'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FileText, ShieldAlert, CheckCircle, Scale, DollarSign } from 'lucide-react'

export default function TermsOfServicePage() {
    const lastUpdated = 'August 17, 2026'

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="border-b border-border pb-8 mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-4">
                            <Scale className="w-4 h-4" />
                            Platform User Agreement
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-3">
                            Terms of Service
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Effective Date: {lastUpdated} • Version 3.1
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
                        {/* Section 1 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">1. Agreement to Terms</h2>
                            <p>
                                By creating an account, browsing chefs, booking a private culinary event, or uploading content to ChefTV, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and all applicable laws and regulations. If you do not agree with any part of these Terms, you must not use the ChefMii Global platform.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">2. The ChefMii Global Marketplace Model</h2>
                            <p>
                                ChefMii Global acts as a technology marketplace connecting independent private chefs (&ldquo;Chefs&rdquo;) with diners and corporate entities (&ldquo;Clients&rdquo;). Chefs on ChefMii Global are independent culinary professionals and are not employees or direct agents of ChefMii Global.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">3. Stripe Escrow Payments & Split-Billing</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Escrow Protection:</strong> When a Client books a chef, 100% of the total reservation fee is held securely in Stripe escrow.</li>
                                <li><strong>Release of Funds:</strong> Funds are automatically released to the Chef&apos;s verified bank account 24 hours after the successful completion of the dining service.</li>
                                <li><strong>Platform Commission:</strong> ChefMii Global charges a standard platform facilitation fee (5% to 15% depending on membership tier) to support escrow management, customer concierge, and insurance protection.</li>
                                <li><strong>Split-Billing:</strong> Group dining bills can be split among up to 10 guests via personalized payment links. The booking is confirmed once all guest shares are authorized.</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">4. Cancellation & Refund Policy</h2>
                            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-border space-y-2">
                                <p className="font-bold text-foreground">Standard Cancellation Terms:</p>
                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                    <li><strong>48+ Hours Before Event:</strong> 100% full refund returned to the Client.</li>
                                    <li><strong>24 to 48 Hours Before Event:</strong> 50% refund (to compensate the Chef for fresh perishable ingredient procurement).</li>
                                    <li><strong>Less than 24 Hours:</strong> Non-refundable, full payment released to the Chef.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">5. Food Safety, Allergens, & Kitchen Access</h2>
                            <p>
                                <strong>Client Responsibilities:</strong> Clients must disclose all severe allergies, dietary requirements, and kitchen equipment constraints prior to booking confirmation. Clients must provide a clean, safe cooking environment with functioning water, electricity, and standard cooking facilities.
                            </p>
                            <p>
                                <strong>Chef Responsibilities:</strong> Chefs must hold active Food Hygiene Certification (Level 2 or higher in the UK/equivalent abroad), maintain clean food preparation protocols, and leave the client&apos;s kitchen in a pristine, clean state upon departure.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">6. ChefTV & User Content Rights</h2>
                            <p>
                                By submitting videos, photos, or comments to ChefTV, you grant ChefMii Global a non-exclusive, worldwide, royalty-free license to display, stream, and promote the content on the ChefMii Global platform. You affirm that you own or possess the rights to all uploaded content.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">7. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by applicable law, ChefMii Global shall not be liable for indirect, incidental, or consequential damages resulting from in-person dining services, food consumption, or host property conditions. ChefMii Global maintains platform public liability insurance coverage for qualifying events.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">8. Contact Information</h2>
                            <p>
                                For questions regarding these Terms, contact our Legal Team at{' '}
                                <a href="mailto:legal@chefmii.com" className="text-terracotta underline font-bold">
                                    legal@chefmii.com
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
