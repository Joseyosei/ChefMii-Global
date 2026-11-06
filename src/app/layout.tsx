import type { Metadata, Viewport } from 'next'
import { Roboto, Libre_Caslon_Text } from 'next/font/google'
import { AuthProvider } from '@/context/auth-context'
import { CurrencyProvider } from '@/context/currency-context'
import { ToastProvider } from '@/context/toast-context'
import { AccessibilityProvider } from '@/context/accessibility-context'
import { AccessibilityWidget } from '@/components/layout/accessibility-widget'
import { CookieBanner } from '@/components/layout/cookie-banner'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import './globals.css'

const roboto = Roboto({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700', '900'],
    variable: '--font-roboto',
    display: 'swap',
})

const caslon = Libre_Caslon_Text({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-caslon',
    display: 'swap',
})

export const viewport: Viewport = {
    themeColor: '#FF5A36',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
}

export const metadata: Metadata = {
    title: {
        template: '%s | ChefMii Global',
        default: 'ChefMii Global – Hire a Master Private Chef Worldwide',
    },
    description: 'ChefMii Global connects you with Michelin-trained private chefs globally. 100% Stripe Escrow Protection, split-billing, and ChefTV culinary streaming.',
    keywords: ['private chef', 'chef booking', 'personal chef', 'chef marketplace', 'escrow dining', 'michelin chef hire', 'chefmii global'],
    authors: [{ name: 'ChefMii Global' }],
    manifest: '/manifest.json',
    openGraph: {
        title: 'ChefMii Global – Hire a Master Private Chef Worldwide',
        description: 'Connect with verified master chefs globally with 100% Escrow Protection.',
        type: 'website',
        locale: 'en_US',
        siteName: 'ChefMii Global',
    },
    robots: { index: true, follow: true },
    icons: {
        icon: [
            { url: '/icon.svg', type: 'image/svg+xml' },
            { url: '/icon.png', type: 'image/png' },
            { url: '/favicon.ico', sizes: 'any' },
        ],
        shortcut: '/icon.png',
        apple: '/apple-icon.png',
    },
}

const JSON_LD = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': 'https://chefmii.com/#organization',
            'name': 'ChefMii Global',
            'url': 'https://chefmii.com',
            'logo': 'https://chefmii.com/icon.png',
            'description': 'Global luxury private chef booking marketplace with Stripe Escrow protection.',
            'sameAs': [
                'https://twitter.com/chefmii',
                'https://instagram.com/chefmii',
                'https://linkedin.com/company/chefmii'
            ]
        },
        {
            '@type': 'WebSite',
            '@id': 'https://chefmii.com/#website',
            'url': 'https://chefmii.com',
            'name': 'ChefMii Global',
            'publisher': { '@id': 'https://chefmii.com/#organization' }
        }
    ]
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${roboto.variable} ${caslon.variable}`}>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
                />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <a href="#main-content" className="skip-to-main-link">
                    Skip to main content (Alt + S)
                </a>
                <AuthProvider>
                    <CurrencyProvider>
                        <ToastProvider>
                            <AccessibilityProvider>
                                <div id="main-content" tabIndex={-1} className="focus:outline-none">
                                    {children}
                                </div>
                                <CookieBanner />
                                <ChatbotWidget />
                                <AccessibilityWidget />
                            </AccessibilityProvider>
                        </ToastProvider>
                    </CurrencyProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
