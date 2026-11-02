'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import {
    Briefcase, Sparkles, MapPin, Clock, ArrowRight,
    CheckCircle2, Heart, Award, Users, Coffee, Zap, X
} from 'lucide-react'

interface JobRole {
    id: string
    title: string
    dept: string
    location: string
    type: string
    experience: string
    desc: string
    tags: string[]
}

const ROLES: JobRole[] = [
    {
        id: 'eng-1',
        title: 'Staff Full-Stack Engineer',
        dept: 'Engineering',
        location: 'London / Remote',
        type: 'Full-Time',
        experience: '5+ years',
        desc: 'Lead the architecture of our Next.js web application, real-time WebSocket messaging, and Stripe Connect escrow infrastructure.',
        tags: ['Next.js', 'TypeScript', 'Stripe Connect', 'Firebase'],
    },
    {
        id: 'culinary-1',
        title: 'Head of Global Chef Operations & Vetting',
        dept: 'Culinary Operations',
        location: 'London (Mayfair)',
        type: 'Full-Time',
        experience: '7+ years',
        desc: 'Direct the 7-stage vetting process for international master chefs, establish kitchen hygiene benchmarks, and scale chef onboarding.',
        tags: ['Michelin Standards', 'Culinary Operations', 'Chef Relations'],
    },
    {
        id: 'ai-1',
        title: 'AI Culinary Intelligence Engineer',
        dept: 'Engineering & AI',
        location: 'Remote (UK / US)',
        type: 'Full-Time',
        experience: '4+ years',
        desc: 'Build next-gen multimodal taste-matching algorithms using Google Gemini AI, semantic menu parsing, and hyper-personalized diner recommendations.',
        tags: ['Google Gemini', 'Python', 'Vector Search', 'AI Recommendation'],
    },
    {
        id: 'corp-1',
        title: 'Enterprise Corporate Sales Director',
        dept: 'Growth & Business',
        location: 'London / New York',
        type: 'Full-Time',
        experience: '5+ years',
        desc: 'Scale our ChefMii Global Business corporate tier, closing multi-chef executive summit packages with Fortune 500 companies and investment firms.',
        tags: ['B2B Sales', 'Corporate Catering', 'Executive Hospitality'],
    },
    {
        id: 'des-1',
        title: 'Senior Product Designer (UI/UX)',
        dept: 'Design',
        location: 'Remote',
        type: 'Full-Time',
        experience: '4+ years',
        desc: 'Craft intuitive, luxury digital interfaces for diners, chefs, and corporate clients across web and mobile surfaces.',
        tags: ['Figma', 'Design Systems', 'Micro-Interactions', 'Mobile UX'],
    },
]

const PERKS = [
    { icon: UtensilsIcon, title: '£300 Monthly Dining Credit', desc: 'Book private chefs on ChefMii Global every month on us.' },
    { icon: Zap, title: 'Competitive Salary & Equity', desc: 'Meaningful stock option packages for all full-time teammates.' },
    { icon: Coffee, title: 'Remote-First Flexibility', desc: 'Work from anywhere with London and NYC clubhouse access.' },
    { icon: Heart, title: 'Premium Health & Wellness', desc: 'Full medical, dental, optical, and mental health coverage.' },
]

function UtensilsIcon(props: any) {
    return <Briefcase {...props} />
}

export default function CareersPage() {
    const [deptFilter, setDeptFilter] = useState('All')
    const [selectedJob, setSelectedJob] = useState<JobRole | null>(null)
    const [applied, setApplied] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', portfolio: '', notes: '' })

    const depts = ['All', 'Engineering', 'Culinary Operations', 'Engineering & AI', 'Growth & Business', 'Design']

    const filteredRoles = deptFilter === 'All'
        ? ROLES
        : ROLES.filter(r => r.dept === deptFilter)

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault()
        setApplied(true)
        setTimeout(() => {
            setApplied(false)
            setSelectedJob(null)
            setFormData({ name: '', email: '', portfolio: '', notes: '' })
            alert('Application submitted successfully! Our recruiting team will review your portfolio within 48 hours.')
        }, 1200)
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-20 text-foreground">
                {/* Hero */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-16 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        We&apos;re Hiring Exceptional Talent
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
                        Shape the Future of Global Culinary Artistry.
                    </h1>
                    <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Join an ambitious team uniting world-class software engineering with Michelin-grade gastronomy. We&apos;re building the infrastructure that powers the private dining economy.
                    </p>
                </section>

                {/* Perks Grid */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PERKS.map((p, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs space-y-3">
                                <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                                    <p.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-base text-foreground">{p.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Open Positions */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Open Roles</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">{filteredRoles.length} active positions available</p>
                        </div>
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-1.5">
                            {depts.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDeptFilter(d)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        deptFilter === d
                                            ? 'gradient-brand text-white shadow-xs'
                                            : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Cards List */}
                    <div className="space-y-4">
                        {filteredRoles.map(job => (
                            <div
                                key={job.id}
                                className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-border shadow-xs hover:border-terracotta/40 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta px-2 py-0.5 rounded-md bg-terracotta/10">
                                            {job.dept}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {job.location}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {job.type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{job.desc}</p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {job.tags.map(t => (
                                            <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground/80">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedJob(job)}
                                    className="px-6 py-3 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-90 transition-all shrink-0 flex items-center gap-1.5"
                                >
                                    Apply Now
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Application Modal */}
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                        <div className="bg-card dark:bg-stone-900 border border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-terracotta">{selectedJob.dept}</span>
                                    <h3 className="font-bold text-lg text-foreground">{selectedJob.title}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleApply} className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Gordon Ramsay"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="gordon@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">LinkedIn / GitHub / Portfolio URL *</label>
                                    <input
                                        type="url"
                                        required
                                        value={formData.portfolio}
                                        onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1">Why ChefMii Global? (Short Note)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Tell us why you want to join ChefMii Global and what excites you..."
                                        className="w-full px-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={applied}
                                    className="w-full py-3 rounded-xl gradient-brand text-white font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {applied ? 'Submitting Application...' : 'Submit Application →'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    )
}
