'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, Trash2, Plus, Minus, ChevronDown } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  specialRequest?: string
}

function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Secret Carbonara',
      price: 18.50,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1612874742237-6526221fcf4f?w=400&h=300&fit=crop',
      specialRequest: 'Extra guanciale please',
    },
    {
      id: '2',
      name: 'Truffle Risotto',
      price: 22.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1476124369162-f4978d1a23a0?w=400&h=300&fit=crop',
    },
  ])

  const [deliveryMode, setDeliveryMode] = useState('delivery')
  const [expandedSpecialRequests, setExpandedSpecialRequests] = useState<string[]>([])

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId)
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      ))
    }
  }

  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = deliveryMode === 'delivery' ? (subtotal >= 30 ? 0 : 2.99) : 0
  const serviceFee = subtotal * 0.05
  const total = subtotal + deliveryFee + serviceFee

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-serif font-bold mb-4">Your basket is empty</h1>
            <p className="text-muted-foreground mb-8">Add some delicious items from your favorite chefs</p>
            <Link
              href="/order"
              className="inline-block px-8 py-3 bg-terracotta text-white font-bold rounded-xl hover:bg-terracotta/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 sm:pt-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/order"
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-serif font-bold">Your Basket</h1>
          </div>

          {/* Chef Header */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-8 flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1577003832033-a0d99e4bed89?w=100&h=100&fit=crop"
              alt="Marco Rossi"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="font-bold text-lg">Marco Rossi</h2>
              <p className="text-sm text-muted-foreground">Italian • 0.8 mi away</p>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4 mb-8">
            {cartItems.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex gap-4 mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">£{item.price.toFixed(2)} each</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="ml-auto font-bold">£{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 p-2 hover:bg-muted rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Special Request */}
                {item.specialRequest && (
                  <button
                    onClick={() => setExpandedSpecialRequests(prev =>
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    )}
                    className="w-full text-left px-3 py-2 bg-muted rounded-lg text-sm flex items-center justify-between hover:bg-muted/80 transition-colors"
                  >
                    <span className="text-muted-foreground">Special request</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedSpecialRequests.includes(item.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
                {expandedSpecialRequests.includes(item.id) && (
                  <p className="mt-2 text-sm text-muted-foreground italic">"{item.specialRequest}"</p>
                )}
              </div>
            ))}
          </div>

          {/* Delivery/Pickup Toggle */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-8">
            <h3 className="font-bold mb-3">Delivery option</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setDeliveryMode('delivery')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  deliveryMode === 'delivery'
                    ? 'bg-terracotta text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setDeliveryMode('pickup')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  deliveryMode === 'pickup'
                    ? 'bg-terracotta text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Pickup
              </button>
            </div>
          </div>

          {/* ChefMii Global Premium Banner */}
          <div className="bg-gradient-to-r from-terracotta/20 to-terracotta/10 border border-terracotta/30 rounded-2xl p-4 mb-8">
            <p className="font-bold text-sm">
              Get £0 delivery fee with <span className="text-terracotta">ChefMii Global Premium</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Join now and save on every order</p>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8 space-y-4">
            <h3 className="font-bold text-lg">Order summary</h3>

            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Delivery fee {deliveryFee === 0 && '(FREE)'}
                </span>
                <span className="font-medium">{deliveryFee === 0 ? 'FREE' : '£' + deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee (5%)</span>
                <span className="font-medium">£{serviceFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-terracotta">£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/order/checkout"
            className="w-full py-4 bg-terracotta text-white font-bold rounded-xl hover:bg-terracotta/90 transition-colors text-center mb-4"
          >
            Proceed to Checkout →
          </Link>

          {/* Continue Shopping */}
          <Link
            href="/order"
            className="w-full py-3 border border-border text-foreground font-medium rounded-xl hover:bg-muted transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">⏳</div>
      </div>
    }>
      <CartContent />
    </Suspense>
  )
}
