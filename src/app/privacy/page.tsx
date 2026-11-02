'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ShieldCheck, Lock, Eye, FileText, CheckCircle, Mail, Globe } from 'lucide-react'

export default function PrivacyPolicyPage() {
    const lastUpdated = 'August 17, 2026'

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="border-b border-border pb-8 mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4">
                            <ShieldCheck className="w-4 h-4" />
                            GDPR & CCPA Compliant
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground mb-3">
                            Privacy Policy
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Effective Date: {lastUpdated} • Version 2.4
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs mb-12 space-y-3">
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Lock className="w-4 h-4 text-terracotta" />
                            Our Privacy Commitment
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            At ChefMii Global (&ldquo;ChefMii Global&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), we take your personal privacy seriously. We never sell your personal data. We only collect the information necessary to match you with private chefs, guarantee safe escrow transactions, and ensure dietary safety.
                        </p>
                    </div>

                    {/* Policy Content */}
                    <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
                        {/* Section 1 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us when using the ChefMii Global platform:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Account & Profile:</strong> Full name, email address, phone number, and profile photo.</li>
                                <li><strong>Dining & Dietary Profile:</strong> Food allergies, dietary restrictions, preferred cuisine styles, and kitchen appliance specifications.</li>
                                <li><strong>Location & Address:</strong> Physical dining address and delivery coordinates required for chef arrival and food delivery.</li>
                                <li><strong>Payment Information:</strong> Financial transactions are processed securely via Stripe. ChefMii Global does not store raw credit card numbers or bank CVVs; payments are tokenized under PCI-DSS Level 1 compliance.</li>
                                <li><strong>Chef Verification Data:</strong> For registered chefs, we collect food hygiene certificates, identity documents (passport/driver&apos;s license), and DBS background checks.</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">2. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Facilitate private chef reservations, corporate catering, and ChefTV interactions.</li>
                                <li>Execute automated Stripe Escrow billing, deposit guarantees, and instant chef bank transfers.</li>
                                <li>Communicate booking confirmations, live GPS chef arrival alerts, and customer support responses.</li>
                                <li>Ensure kitchen hygiene, food allergy safety, and insurance protection during events.</li>
                                <li>Comply with UK, EU, and global legal, tax, and anti-money laundering (AML) requirements.</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">3. Information Sharing & Disclosure</h2>
                            <p>We only share your information in the following circumstances:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>With Your Booked Chef:</strong> Your name, dietary preferences, menu requirements, and event address are shared with your assigned chef to prepare and serve your meal.</li>
                                <li><strong>With Trusted Service Providers:</strong> Secure infrastructure providers (Google Cloud / Firebase, Stripe Connect, Mapbox for GPS navigation).</li>
                                <li><strong>Legal & Safety Requirements:</strong> If required by law, subpoena, or to protect the safety of clients and chefs during in-home experiences.</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">4. Data Security & Storage</h2>
                            <p>
                                ChefMii Global employs industry-standard 256-bit AES encryption at rest and TLS 1.3 encryption in transit. Our servers and databases are hosted in ISO 27001-certified enterprise data centers.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">5. Your Legal Rights (GDPR & CCPA)</h2>
                            <p>Depending on your location, you hold the following statutory rights:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Right to Access:</strong> Request a copy of all personal data we hold about you.</li>
                                <li><strong>Right to Rectification:</strong> Update or correct inaccurate personal details.</li>
                                <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request the permanent deletion of your ChefMii Global account and associated records.</li>
                                <li><strong>Right to Data Portability:</strong> Export your order history, reviews, and profile data in machine-readable JSON format.</li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">6. Cookies & Tracking Technologies</h2>
                            <p>
                                We use essential session cookies, analytical telemetry, and personalization cookies to enhance your experience. You can manage or revoke cookie consent at any time via our{' '}
                                <Link href="/cookies" className="text-terracotta font-bold underline underline-offset-2">
                                    Cookie Policy
                                </Link>.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="space-y-3">
                            <h2 className="text-xl font-serif font-bold text-foreground">7. Contact Our Data Protection Officer (DPO)</h2>
                            <p>
                                If you have questions about this Privacy Policy or wish to exercise your data rights, contact our Data Privacy Office:
                            </p>
                            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-border space-y-1 text-xs">
                                <p className="font-bold text-foreground">ChefMii Global Legal & Privacy Office</p>
                                <p>Email: <a href="mailto:privacy@chefmii.com" className="text-terracotta underline">privacy@chefmii.com</a></p>
                                <p>Address: Mayfair, London, United Kingdom / New York, NY</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
