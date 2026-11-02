'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ChatbotWidget } from '@/components/chatbot/chatbot-widget'
import { Check, X, HelpCircle, ChevronDown, ChevronUp, Star, Calendar, Package, Leaf, GraduationCap, Video, DollarSign, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// --- Types & Data ---

type UserType = 'customers' | 'professionals'
type ProfessionalType = 'chefs' | 'farmers' | 'influencers'

const CUSTOMER_PLANS = [
  {
    name: 'FREE',
    badge: 'Get Started',
    price: '£0',
    period: '/month',
    subtext: 'Forever free',
    border: 'border-border',
    features: [
      { text: 'Browse all chefs', included: true },
      { text: 'Book private chefs', included: true },
      { text: 'Order food from chefs', included: true },
      { text: 'Order from farmers', included: true },
      { text: 'Access ChefMii Global Academy free courses', included: true },
      { text: 'ChefMii Global Media (watch chef videos)', included: true },
      { text: 'Free delivery', included: false },
      { text: 'Booking cashback', included: false },
      { text: 'Priority access', included: false },
      { text: 'Exclusive masterclasses', included: false },
    ],
    button: 'Get Started Free',
    buttonVariant: 'outline',
  },
  {
    name: 'CHEFMII GLOBAL PLUS',
    badge: 'Most Popular',
    price: '£9.99',
    period: '/month',
    subtext: 'or £89.99/year (save 25%)',
    border: 'border-terracotta ring-2 ring-terracotta/20',
    popular: true,
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'FREE delivery on all chef orders', included: true },
      { text: 'FREE delivery on all farmer orders', included: true },
      { text: '5% cashback on every booking', included: true },
      { text: 'Priority order acceptance', included: true },
      { text: 'Early access to new chefs', included: true },
      { text: 'Exclusive Academy masterclasses', included: true },
      { text: 'ChefMii Global Plus badge on profile', included: true },
      { text: 'Priority customer support', included: true },
    ],
    savings: '💰 Pays for itself in just 4 orders. Save £2.99 per delivery × 4 = £11.96',
    button: 'Start Plus Free for 7 Days',
    buttonVariant: 'filled',
    smallText: 'Cancel anytime. No commitment.',
  },
  {
    name: 'CHEFMII GLOBAL BUSINESS',
    badge: 'For Teams',
    price: '£49.99',
    period: '/month',
    subtext: 'Up to 10 team members',
    border: 'border-[#1A1A1A]',
    features: [
      { text: 'Everything in Plus', included: true },
      { text: '10 team member accounts', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Priority chef booking (guaranteed)', included: true },
      { text: 'Corporate event management', included: true },
      { text: 'Monthly invoice billing', included: true },
      { text: 'Custom branding on bookings', included: true },
      { text: 'API access', included: true },
      { text: 'Volume booking discounts', included: true },
      { text: 'Quarterly business review', included: true },
    ],
    button: 'Start Business →',
    buttonVariant: 'filled',
  },
]

const SERVICE_FEES = [
  {
    icon: '📅',
    title: 'Private Chef Booking',
    rows: [
      { label: "Chef's rate", value: 'You set' },
      { label: 'Platform fee', value: '5%' },
      { label: 'No delivery fee', value: '✓ Free' },
    ],
    example: 'Chef at £120/hr × 4hrs = £480\nPlatform fee: £24\nYou pay: £504 total',
    plusNote: 'Plus members get 5% cashback = £25.20 back',
  },
  {
    icon: '📦',
    title: 'Chef Food Order',
    rows: [
      { label: 'Food subtotal', value: 'As listed' },
      { label: 'Delivery fee', value: '£2.99' },
      { label: 'Service fee', value: '5%' },
    ],
    example: 'Order subtotal: £35.00\nDelivery: £2.99\nService fee: £1.75\nYou pay: £39.74 total',
    plusNote: 'Plus members: £0 delivery fee',
  },
  {
    icon: '🌾',
    title: 'Farmer Order',
    rows: [
      { label: 'Produce price', value: 'As listed' },
      { label: 'Delivery fee', value: '£3.99' },
      { label: 'Service fee', value: '3%' },
    ],
    example: 'Order subtotal: £28.00\nDelivery: £3.99\nService fee: £0.84\nYou pay: £32.83 total',
    freeNote: 'Free delivery on orders over £40',
    plusNote: 'Plus members: £0 delivery fee always',
  },
]

const CHEF_PLANS = [
  {
    name: 'STANDARD CHEF (FREE)',
    price: '£0',
    period: '/month',
    features: [
      'Full chef profile',
      'Accept bookings',
      'Upload to Chef Media',
      'Menu management (up to 10 items)',
      'Messaging with clients',
      'Basic analytics',
      '85% on all earnings',
    ],
    button: 'Join as a Chef Free →',
    buttonVariant: 'outline',
  },
  {
    name: 'CHEF PRO',
    price: '£19.99',
    period: '/month',
    popular: true,
    features: [
      'Everything in Standard',
      'Unlimited menu items',
      'Featured listing (top of search)',
      'Priority in Chef Media algorithm',
      'Advanced analytics dashboard',
      'Verified Chef badge (prominent)',
      'Early access to corporate clients',
      'Dedicated onboarding support',
      'Custom chef profile URL',
    ],
    button: 'Go Pro →',
    buttonVariant: 'filled',
    smallText: 'First 30 days free',
  },
]

const FARMER_PLANS = [
  {
    name: 'STANDARD FARMER (FREE)',
    price: '£0',
    period: '/month',
    features: [
      'Farm profile page',
      'Up to 20 produce listings',
      'Chef and customer orders',
      'Delivery zone settings',
      'Basic order management',
      'Weekly payouts',
      '90% on all sales',
    ],
    button: 'Join as a Farmer Free →',
    buttonVariant: 'outline',
  },
  {
    name: 'FARMER PRO',
    price: '£14.99',
    period: '/month',
    popular: true,
    features: [
      'Everything in Standard',
      'Unlimited produce listings',
      'Featured on Farm Fresh homepage',
      'Subscription box feature',
      'Chef partnership programme',
      'Verified Farm badge',
      'Advanced inventory management',
      'Sales analytics dashboard',
      'Priority in Farm Fresh algorithm',
    ],
    button: 'Go Pro →',
    buttonVariant: 'filled',
  },
]

const INFLUENCER_PLANS = [
  {
    name: 'STANDARD INFLUENCER (FREE)',
    price: '£0',
    period: '/month',
    features: [
      'Referral link generator',
      '8% commission on bookings',
      'Basic earnings dashboard',
      'Monthly payouts (min £50)',
      'QR code for offline promotion',
    ],
    button: 'Join as an Influencer →',
    buttonVariant: 'outline',
  },
  {
    name: 'INFLUENCER PRO',
    price: '£9.99',
    period: '/month',
    popular: true,
    features: [
      'Everything in Standard',
      '10% commission on bookings',
      'Priority access to chef events',
      'Advanced performance tracking',
      'Custom vanity referral links',
      'Collaboration opportunities',
      'Monthly payouts (min £10)',
    ],
    button: 'Go Pro →',
    buttonVariant: 'filled',
  },
]

const FAQS = [
  { q: "How do I cancel my ChefMii Global Plus subscription?", a: "You can cancel anytime through your account settings. You'll continue to have access to Plus features until the end of your current billing period." },
  { q: "When do chefs and farmers get paid?", a: "Chefs are paid every Monday for all completed bookings and orders from the previous week. Farmers also receive weekly payouts directly to their linked bank account via Stripe." },
  { q: "What is the service fee for?", a: "The service fee helps us run the platform, provide 24/7 customer support, and maintain secure payment processing for all users." },
  { q: "Can I switch between plans?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle." },
]

// --- Components ---

function PlanCard({ plan }: { plan: any }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (plan.price === '£0' || plan.name === 'FREE' || plan.name?.includes('STARTER')) {
      window.location.href = '/find-chefs'
      return
    }

    let planId = 'plus-monthly'
    if (plan.name?.includes('PLUS')) planId = 'plus-monthly'
    else if (plan.name?.includes('BUSINESS')) planId = 'business-monthly'
    else if (plan.name?.includes('PRO')) planId = 'chef-pro-monthly'
    else if (plan.name?.includes('ENTERPRISE') || plan.name?.includes('MASTER')) planId = 'chef-enterprise-monthly'

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start subscription. Please try again.')
      }
    } catch (e) {
      console.error(e)
      alert('Subscription error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`relative flex flex-col bg-card rounded-[12px] border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${plan.border} ${plan.popular ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''}`}>
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap ${plan.popular ? 'bg-[#E8520A] text-white' : 'bg-muted text-muted-foreground border border-border'}`}>
          {plan.badge}
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-foreground">{plan.price}</span>
          <span className="text-muted-foreground text-sm">{plan.period}</span>
        </div>
        <p className="text-muted-foreground text-xs mt-1">{plan.subtext}</p>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f: any, i: number) => {
          const isString = typeof f === 'string'
          const included = isString ? true : f.included
          const text = isString ? f : f.text
          return (
            <li key={i} className={`flex items-start gap-2 text-sm ${!included ? 'text-muted-foreground/50' : ''}`}>
              {included ? (
                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-[#E8520A]' : 'text-green-500'}`} />
              ) : (
                <X className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/30" />
              )}
              {text}
            </li>
          )
        })}
      </ul>

      {plan.savings && (
        <div className="bg-[#E8520A] text-white rounded-lg p-3 text-xs font-bold mb-4">
          {plan.savings}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-3 rounded-[999px] font-bold text-sm transition-all disabled:opacity-50 ${
            plan.buttonVariant === 'filled' ? 'bg-[#E8520A] text-white hover:opacity-90' :
            plan.buttonVariant === 'dark' ? 'bg-[#1A1A1A] text-white hover:bg-black' :
            'border-2 border-[#E8520A] text-[#E8520A] hover:bg-[#E8520A]/5'
          }`}
        >
          {loading ? 'Connecting to Stripe...' : plan.button}
        </button>
        {plan.smallText && <p className="text-[10px] text-center text-muted-foreground">{plan.smallText}</p>}
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [userType, setUserType] = useState<UserType>('customers')
  const [proType, setProType] = useState<ProfessionalType>('chefs')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F5F5F5] dark:bg-[#121212] font-sans text-[#1A1A1A] dark:text-white/90">
        
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 leading-tight">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              No hidden fees. No surprises. ChefMii Global only earns when you earn.
            </p>

            {/* Main Toggle */}
            <div className="inline-flex p-1 bg-muted rounded-[999px] border border-border mb-12">
              <button
                onClick={() => setUserType('customers')}
                className={`px-6 sm:px-10 py-2.5 rounded-[999px] text-sm font-bold transition-all ${userType === 'customers' ? 'bg-[#E8520A] text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                👤 For Customers
              </button>
              <button
                onClick={() => setUserType('professionals')}
                className={`px-6 sm:px-10 py-2.5 rounded-[999px] text-sm font-bold transition-all ${userType === 'professionals' ? 'bg-[#E8520A] text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                👨‍🍳 For Professionals
              </button>
            </div>
          </div>
        </section>

        {/* Customer Section */}
        {userType === 'customers' && (
          <div className="max-w-6xl mx-auto px-4 pb-24 space-y-24">
            {/* Plans */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif font-bold mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground">Start free. Upgrade when ready.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CUSTOMER_PLANS.map((p, i) => <PlanCard key={i} plan={p} />)}
              </div>
            </section>

            {/* Service Fees */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif font-bold mb-2">What You Pay Per Transaction</h2>
                <p className="text-muted-foreground">Transparent fees. No surprises at checkout.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SERVICE_FEES.map((fee, i) => (
                  <div key={i} className="bg-card border border-border rounded-[12px] p-6 shadow-sm">
                    <div className="text-4xl mb-4">{fee.icon}</div>
                    <h3 className="font-bold text-xl mb-4">{fee.title}</h3>
                    
                    <div className="border rounded-lg overflow-hidden mb-4">
                      {fee.rows.map((row, j) => (
                        <div key={j} className={`flex justify-between p-3 text-sm ${j !== fee.rows.length - 1 ? 'border-b' : ''}`}>
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-bold">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Example</p>
                      <p className="text-xs whitespace-pre-line leading-relaxed">{fee.example}</p>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                      <Star className="w-4 h-4 text-[#E8520A] shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-orange-800 dark:text-orange-200">{fee.plusNote}</p>
                    </div>
                    {fee.freeNote && <p className="text-[10px] text-muted-foreground mt-2 text-center">{fee.freeNote}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Professional Section */}
        {userType === 'professionals' && (
          <div className="max-w-6xl mx-auto px-4 pb-24">
            {/* Sub Toggle */}
            <div className="flex justify-center mb-16">
              <div className="inline-flex p-1 bg-card rounded-[999px] border border-border">
                <button
                  onClick={() => setProType('chefs')}
                  className={`px-6 py-2 rounded-[999px] text-sm font-bold transition-all ${proType === 'chefs' ? 'bg-[#E8520A] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  👨‍🍳 Chefs
                </button>
                <button
                  onClick={() => setProType('farmers')}
                  className={`px-6 py-2 rounded-[999px] text-sm font-bold transition-all ${proType === 'farmers' ? 'bg-[#E8520A] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  🌾 Farmers
                </button>
                <button
                  onClick={() => setProType('influencers')}
                  className={`px-6 py-2 rounded-[999px] text-sm font-bold transition-all ${proType === 'influencers' ? 'bg-[#E8520A] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  📱 Influencers
                </button>
              </div>
            </div>

            {/* Chefs Content */}
            {proType === 'chefs' && (
              <div className="space-y-24">
                <section className="text-center">
                  <h2 className="text-3xl font-serif font-bold mb-2">The Best Deal for Private Chefs</h2>
                  <p className="text-muted-foreground mb-12">Keep more of what you earn. No upfront fees. Ever.</p>
                  
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border-2 border-[#E8520A] shadow-xl max-w-2xl mx-auto mb-16">
                    <p className="text-5xl font-black text-[#E8520A] mb-2">You keep 85%</p>
                    <p className="text-xl font-bold mb-4">of every booking and every food order.</p>
                    <p className="text-sm text-muted-foreground">Compare that to Deliveroo (65-75%) and chef agencies (50-60%)</p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-4 font-bold">Platform</th>
                          <th className="p-4 font-bold">You Keep</th>
                          <th className="p-4 font-bold">Setup Fee</th>
                          <th className="p-4 font-bold">Monthly</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="bg-orange-50/50 dark:bg-orange-950/10 font-bold">
                          <td className="p-4 text-[#E8520A]">ChefMii Global ✓</td>
                          <td className="p-4">85%</td>
                          <td className="p-4">£0</td>
                          <td className="p-4">£0</td>
                        </tr>
                        <tr>
                          <td className="p-4">Deliveroo</td>
                          <td className="p-4">65-75%</td>
                          <td className="p-4">£0</td>
                          <td className="p-4">£0</td>
                        </tr>
                        <tr>
                          <td className="p-4">Chef Agency</td>
                          <td className="p-4">50-60%</td>
                          <td className="p-4">£500+</td>
                          <td className="p-4">Variable</td>
                        </tr>
                        <tr>
                          <td className="p-4">Hire a Chef</td>
                          <td className="p-4">70%</td>
                          <td className="p-4">£0</td>
                          <td className="p-4">£29/mo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-serif font-bold mb-8 text-center">Chef Revenue Streams</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: <Calendar />, title: 'Private Bookings', earn: '85%', example: '£480 booking → You get £408' },
                      { icon: <Package />, title: 'Food Orders', earn: '85%', example: '£35 order → You get £29.75' },
                      { icon: <GraduationCap />, title: 'Academy Courses', earn: '70%', example: '£49 course × 100 students = £3,430' },
                      { icon: <Video />, title: 'Chef Media', earn: '100%', example: 'Keep 100% of tips received' },
                    ].map((s, i) => (
                      <div key={i} className="bg-card border border-border rounded-xl p-5">
                        <div className="text-[#E8520A] mb-3">{s.icon}</div>
                        <h4 className="font-bold mb-1">{s.title}</h4>
                        <p className="text-sm font-black text-foreground mb-2">You earn: {s.earn}</p>
                        <p className="text-xs text-muted-foreground">{s.example}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl flex flex-wrap justify-center gap-6 text-sm font-bold text-green-800 dark:text-green-200">
                    <span>✓ Paid every Monday</span>
                    <span>✓ Stripe direct to bank</span>
                    <span>✓ Minimum payout: £10</span>
                    <span>✓ No holding period</span>
                  </div>
                </section>

                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {CHEF_PLANS.map((p, i) => <PlanCard key={i} plan={{...p, border: p.popular ? 'border-[#E8520A]' : 'border-border'}} />)}
                  </div>
                </section>
              </div>
            )}

            {/* Farmers Content */}
            {proType === 'farmers' && (
              <div className="space-y-24">
                <section className="text-center">
                  <h2 className="text-3xl font-serif font-bold mb-2">The Fairest Deal for Farmers</h2>
                  <p className="text-muted-foreground mb-12">Cut out the middlemen. Sell directly to chefs and customers.</p>
                  
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border-2 border-green-600 shadow-xl max-w-2xl mx-auto mb-16">
                    <p className="text-5xl font-black text-green-600 mb-2">You keep 90%</p>
                    <p className="text-xl font-bold mb-4">of every sale.</p>
                    <p className="text-sm text-muted-foreground">Supermarkets pay you 40-60% of retail. ChefMii Global pays you 90%.</p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-4 font-bold">Route to Market</th>
                          <th className="p-4 font-bold">You Keep</th>
                          <th className="p-4 font-bold">Who Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="bg-green-50/50 dark:bg-green-950/10 font-bold">
                          <td className="p-4 text-green-600">ChefMii Global ✓</td>
                          <td className="p-4">90%</td>
                          <td className="p-4">You</td>
                        </tr>
                        <tr>
                          <td className="p-4">Supermarket</td>
                          <td className="p-4">40-60%</td>
                          <td className="p-4">Supermarket</td>
                        </tr>
                        <tr>
                          <td className="p-4">Wholesale</td>
                          <td className="p-4">30-50%</td>
                          <td className="p-4">Wholesaler</td>
                        </tr>
                        <tr>
                          <td className="p-4">Farmers Market</td>
                          <td className="p-4">85-95%</td>
                          <td className="p-4">You (but work)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Order Fee Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Farmer earns</span>
                      <span className="font-bold">90% of subtotal</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">ChefMii Global fee</span>
                      <span className="font-bold">10%</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Delivery fee</span>
                      <span className="font-bold">£3.99 (paid by customer)</span>
                    </div>
                    <div className="text-center pt-4 text-sm font-medium text-green-600">
                      Free delivery on orders over £40
                    </div>
                  </div>
                </section>

                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {FARMER_PLANS.map((p, i) => <PlanCard key={i} plan={{...p, border: p.popular ? 'border-[#E8520A]' : 'border-border'}} />)}
                  </div>
                </section>
              </div>
            )}

            {/* Influencers Content */}
            {proType === 'influencers' && (
              <div className="space-y-24">
                <section className="text-center">
                  <h2 className="text-3xl font-serif font-bold mb-2">Earn by Sharing What You Love</h2>
                  <p className="text-muted-foreground mb-12">Turn your food content into a revenue stream.</p>
                  
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border-2 border-purple-600 shadow-xl max-w-2xl mx-auto mb-16">
                    <p className="text-5xl font-black text-purple-600 mb-2">Earn 8-10%</p>
                    <p className="text-xl font-bold mb-4">commission on every booking.</p>
                    <p className="text-sm text-muted-foreground">No cap. No minimum. Paid monthly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                      { step: '1', text: 'Get your unique referral link' },
                      { step: '2', text: 'Share ChefMii Global chefs in your content' },
                      { step: '3', text: 'Earn commission when followers book' },
                    ].map((s, i) => (
                      <div key={i} className="bg-card border border-border rounded-xl p-6">
                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto">{s.step}</div>
                        <p className="font-medium">{s.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border max-w-2xl mx-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-4 font-bold">Booking Value</th>
                          <th className="p-4 font-bold">You Earn (8%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr><td className="p-4">£100 booking</td><td className="p-4">£8.00</td></tr>
                        <tr><td className="p-4">£300 booking</td><td className="p-4">£24.00</td></tr>
                        <tr className="bg-purple-50/30 dark:bg-purple-950/10 font-bold"><td className="p-4">£500 booking</td><td className="p-4">£40.00</td></tr>
                        <tr><td className="p-4">£1,000 booking</td><td className="p-4">£80.00</td></tr>
                        <tr><td className="p-4">£5,000 event</td><td className="p-4">£400.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm font-bold text-purple-600 italic">"10 bookings per month average = £240/month passive income"</p>
                </section>

                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {INFLUENCER_PLANS.map((p, i) => <PlanCard key={i} plan={{...p, border: p.popular ? 'border-[#E8520A]' : 'border-border'}} />)}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section */}
        <section className="bg-white dark:bg-[#1A1A1A] py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold hover:bg-muted/50 transition-colors"
                  >
                    {faq.q}
                    {expandedFaq === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedFaq === i && (
                    <div className="p-5 pt-0 text-muted-foreground text-sm leading-relaxed border-t">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#E8520A] to-[#FF5A36] rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">Ready to elevate your culinary experience?</h2>
            <p className="text-white/90 mb-10">Join thousands of food lovers and professionals on the world's premier private chef platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="px-8 py-4 bg-white text-[#E8520A] font-bold rounded-[999px] hover:bg-white/90 transition-all shadow-lg">
                Create Account
              </Link>
              <Link href="/find-chefs" className="px-8 py-4 bg-black/20 border border-white/40 text-white font-bold rounded-[999px] hover:bg-black/30 transition-all">
                Browse Chefs
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <ChatbotWidget />

      {/* Font loading simulation via style tag for demo */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=Roboto:wght@400;500;700;900&display=swap');
        
        :root {
          --font-serif: 'Libre Caslon Text', serif;
          --font-sans: 'Roboto', sans-serif;
        }

        h1, h2, h3, h4, .font-serif {
          font-family: var(--font-serif);
        }

        body, .font-sans {
          font-family: var(--font-sans);
        }
      `}</style>
    </>
  )
}
