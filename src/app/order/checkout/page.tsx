'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, MapPin, Clock, Lock } from 'lucide-react'

function CheckoutContent() {
  const router = useRouter()
  const [deliveryAddress, setDeliveryAddress] = useState('123 Oxford Street, London, W1D 1LL')
  const [deliveryTime, setDeliveryTime] = useState('asap')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false)

  const subtotal = 40.50
  const deliveryFee = 0
  const serviceFee = 2.03
  const total = subtotal + deliveryFee + serviceFee

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      router.push('/order/tracking/order-123')
    }, 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 sm:pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/order/cart"
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-serif font-bold">Checkout</h1>
          </div>

          {/* Delivery Address */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-terracotta" />
              Delivery Address
            </h2>
            <input
              type="text"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-terracotta mb-3"
              placeholder="Enter delivery address"
            />
            <button className="text-sm text-terracotta font-medium hover:underline">
              Use current location
            </button>
          </div>

          {/* Delivery Time */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-terracotta" />
              Delivery Time
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="delivery-time"
                  value="asap"
                  checked={deliveryTime === 'asap'}
                  onChange={e => setDeliveryTime(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">ASAP</p>
                  <p className="text-xs text-muted-foreground">Estimated: 25 mins</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="delivery-time"
                  value="schedule"
                  checked={deliveryTime === 'schedule'}
                  onChange={e => setDeliveryTime(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Schedule for later</p>
                  <p className="text-xs text-muted-foreground">Pick a time that works for you</p>
                </div>
              </label>
            </div>
            {deliveryTime === 'schedule' && (
              <input
                type="datetime-local"
                className="w-full mt-4 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            )}
          </div>

          {/* Special Instructions */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">Special Instructions</h2>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests for the chef or delivery?"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
              rows={4}
            />
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">💳 Card ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/25</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">💰 ChefMii Global Wallet</p>
                  <p className="text-xs text-muted-foreground">Balance: £45.00</p>
                </div>
              </label>
            </div>
            <button className="w-full mt-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              + Add new payment method
            </button>
          </div>

          {/* Order Summary */}
          <button
            onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
            className="w-full bg-card border border-border rounded-2xl p-6 mb-6 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Order Summary</h2>
              <span className={`transition-transform ${orderSummaryExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>

            {orderSummaryExpanded && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Secret Carbonara x2</span>
                  <span>£37.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Truffle Risotto x1</span>
                  <span>£22.00</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Delivery fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee (5%)</span>
                    <span>£{serviceFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-bold text-terracotta">£{total.toFixed(2)}</span>
            </div>
          </button>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full py-4 bg-terracotta text-white font-bold rounded-xl hover:bg-terracotta/90 disabled:opacity-50 transition-colors mb-4 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin">⏳</div>
                Processing...
              </>
            ) : (
              `Place Order £${total.toFixed(2)}`
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Secured by Stripe 🔒
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">⏳</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
