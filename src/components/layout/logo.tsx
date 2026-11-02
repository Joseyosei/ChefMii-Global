'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
    className?: string
    variant?: 'full' | 'mark' | 'text'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    href?: string
    priority?: boolean
    showGlobal?: boolean
}

const SIZE_MAP = {
    sm: { height: 28, width: 110, badge: 'text-[9px] px-1.5 py-0.5 tracking-wider' },
    md: { height: 36, width: 140, badge: 'text-[10px] px-2 py-0.5 tracking-widest' },
    lg: { height: 44, width: 175, badge: 'text-xs px-2.5 py-0.5 tracking-widest' },
    xl: { height: 56, width: 220, badge: 'text-xs px-3 py-1 tracking-widest' },
}

export function BrandLogo({
    className = '',
    size = 'md',
    href = '/',
    priority = false,
    showGlobal = true,
}: LogoProps) {
    const dimensions = SIZE_MAP[size] || SIZE_MAP.md

    const content = (
        <div className={`flex items-center gap-2 select-none group transition-transform ${className}`}>
            <div className="relative flex items-center justify-center">
                <Image
                    src="/images/logo.png"
                    alt="ChefMii Global Logo"
                    width={dimensions.width}
                    height={dimensions.height}
                    priority={priority}
                    unoptimized
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    style={{
                        height: dimensions.height,
                        width: 'auto',
                    }}
                />
            </div>
            {showGlobal && (
                <span className={`font-sans font-black uppercase rounded-full bg-terracotta/15 text-terracotta border border-terracotta/30 shadow-xs ${dimensions.badge}`}>
                    GLOBAL
                </span>
            )}
        </div>
    )

    if (href) {
        return (
            <Link href={href} className="inline-flex items-center focus:outline-none">
                {content}
            </Link>
        )
    }

    return content
}
