import { ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/layout/logo'

/**
 * Shared brand panel for /login and /register, so the two auth pages read as
 * one matched pair rather than two different left-hand treatments (login used
 * a brand gradient, register used a hardcoded near-black panel).
 *
 * Hidden on mobile, where the compact logo in the form column carries the
 * brand instead.
 */
export function BrandPanel() {
    return (
        <div className="hidden md:flex flex-1 gradient-brand items-center justify-center p-12 relative overflow-hidden">
            {/* Very quiet dot texture so the copy stays the focus. */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, white 1.5px, transparent 1.5px)', backgroundSize: '44px 44px' }}
            />
            <div className="text-white max-w-md relative">
                <div className="mb-8 p-3 bg-white rounded-2xl inline-block shadow-lg">
                    <BrandLogo size="lg" />
                </div>
                <h2 className="text-4xl font-serif font-bold mb-4 leading-[1.15]">
                    Private chefs, booked with confidence.
                </h2>
                <p className="text-white/85 text-lg leading-relaxed">
                    Discover vetted master chefs, book securely, and manage every event from one place.
                </p>
                <div className="mt-10 space-y-3">
                    {[
                        ['Vetted & verified chefs', 'Every chef passes a three-stage check.'],
                        ['Escrow protection', 'Funds are held safely until after your event.'],
                        ['Global reach', 'Master chefs across 16 cuisines worldwide.'],
                    ].map(([title, desc]) => (
                        <div key={title} className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-white/90" />
                            <div>
                                <p className="font-bold text-sm">{title}</p>
                                <p className="text-white/70 text-xs">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Google "G" mark for the OAuth buttons on both auth pages. */
export function GoogleMark() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
        </svg>
    )
}
