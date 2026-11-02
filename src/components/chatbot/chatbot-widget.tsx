'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    MessageCircle,
    X,
    Send,
    ChefHat,
    Maximize2,
    Minimize2,
    RotateCcw,
    Volume2,
    VolumeX,
    Copy,
    Check,
    ArrowUpRight,
    Sparkles,
    ShieldCheck
} from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const CHEF_DATABASE: Record<string, { name: string; cuisine: string; rate: number; location: string; photo: string }> = {
    'marco-rossi': { name: 'Chef Marco Rossi', cuisine: 'Italian Fine Dining', rate: 150, location: 'London, UK', photo: '/images/chefs/chef_marco_rossi.png' },
    'yuki-tanaka': { name: 'Chef Yuki Tanaka', cuisine: 'Japanese Omakase', rate: 200, location: 'Dubai, UAE', photo: '/images/chefs/chef_yuki_tanaka.png' },
    'pierre-dubois': { name: 'Chef Pierre Dubois', cuisine: 'French Haute Cuisine', rate: 180, location: 'Paris, France', photo: '/images/chefs/chef_pierre_dubois.png' },
    'marcus-vance': { name: 'Chef Marcus Vance', cuisine: 'American Contemporary', rate: 160, location: 'New York, USA', photo: '/images/chefs/chef_marcus_vance.png' },
    'elena-beauchamp': { name: 'Chef Éléna Beauchamp', cuisine: 'French-Canadian', rate: 140, location: 'Montreal, Canada', photo: '/images/chefs/chef_elena_beauchamp.png' },
    'wei-zhang': { name: 'Chef Wei Zhang', cuisine: 'Cantonese & Sichuan', rate: 175, location: 'Shanghai, China', photo: '/images/chefs/chef_wei_zhang.png' },
    'olena-kovalenko': { name: 'Chef Olena Kovalenko', cuisine: 'Modern Ukrainian', rate: 110, location: 'Kyiv, Ukraine', photo: '/images/chefs/chef_olena_kovalenko.png' },
    'henrik-lindqvist': { name: 'Chef Henrik Lindqvist', cuisine: 'New Nordic', rate: 190, location: 'Oslo, Norway', photo: '/images/chefs/chef_henrik_lindqvist.png' },
    'kenji-sato': { name: 'Chef Kenji Sato', cuisine: 'Kyoto Kaiseki', rate: 220, location: 'Kyoto, Japan', photo: '/images/chefs/chef_kenji_sato.png' },
    'min-jun-park': { name: 'Chef Min-Jun Park', cuisine: 'Modern Korean', rate: 165, location: 'Seoul, South Korea', photo: '/images/chefs/chef_min_jun_park.png' },
    'tariq-al-ghamdi': { name: 'Chef Tariq Al-Ghamdi', cuisine: 'Contemporary Khaleeji', rate: 195, location: 'Riyadh, Saudi Arabia', photo: '/images/chefs/chef_tariq_al_ghamdi.png' },
    'aisha-okafor': { name: 'Chef Aisha Okafor', cuisine: 'West African Gourmet', rate: 80, location: 'Lagos, Nigeria', photo: '/images/chefs/chef_aisha_okafor.png' },
    'sofia-mendez': { name: 'Chef Sofía Mendez', cuisine: 'Spanish Tapas & Paella', rate: 120, location: 'Barcelona, Spain', photo: '/images/chefs/chef_sofia_mendez.png' },
    'james-osei': { name: 'Chef James Osei', cuisine: 'Pan-African Banquets', rate: 70, location: 'Accra, Ghana', photo: '/images/chefs/chef_james_osei.png' },
    'meera-patel': { name: 'Chef Meera Patel', cuisine: 'Indian Ayurvedic', rate: 95, location: 'Birmingham, UK', photo: '/images/chefs/chef_meera_patel.png' },
    'carlos-garcia': { name: 'Chef Carlos Garcia', cuisine: 'Modern Mexican', rate: 85, location: 'Mexico City', photo: '/images/chefs/chef_carlos_garcia.png' },
}

const QUICK_PROMPTS = [
    { label: '👨‍🍳 Recommend a Chef', prompt: 'Can you recommend a private chef for an upcoming dinner party?' },
    { label: '🛡️ Escrow & Deposits', prompt: 'How does ChefMii Global payment protection and 20% advance deposit work?' },
    { label: '⭐ Join VIP Waitlist', prompt: 'How do I join the VIP early access waitlist and get priority booking?' },
    { label: '🍝 Italian & French', prompt: 'Who are your top Italian and French private chefs?' },
    { label: '🍣 Japanese Omakase', prompt: 'Tell me about Chef Yuki Tanaka and Chef Kenji Sato.' },
]

export function ChatbotWidget() {
    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [speaking, setSpeaking] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            role: 'assistant',
            content:
                "Welcome to **ChefMii Global Concierge** 👨‍🍳\n\nI can curate bespoke private dining experiences, recommend verified chefs across 16+ countries, explain our 100% Escrow payment protection, or reserve your spot on our **VIP Early Access Waitlist**.\n\nHow may I assist your culinary plans today?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            inputRef.current?.focus()
        }
    }, [open, messages])

    const handleSpeak = (text: string, id: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

        if (speaking === id) {
            window.speechSynthesis.cancel()
            setSpeaking(null)
            return
        }

        window.speechSynthesis.cancel()
        const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_#`]/g, '')
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 1.05
        utterance.pitch = 1.0
        utterance.onend = () => setSpeaking(null)
        utterance.onerror = () => setSpeaking(null)
        setSpeaking(id)
        window.speechSynthesis.speak(utterance)
    }

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleReset = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel()
        }
        setSpeaking(null)
        setMessages([
            {
                id: 'reset-1',
                role: 'assistant',
                content:
                    "Conversation refreshed. How can I help you discover the finest private dining experience today?",
                timestamp: new Date(),
            },
        ])
    }

    const sendMessage = async (textToSend?: string) => {
        const text = (textToSend || input).trim()
        if (!text || loading) return

        const userMsg: Message = {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        }

        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setLoading(true)

        try {
            const historyPayload = newMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }))

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: historyPayload }),
            })
            const data = await res.json()
            const assistantMsg: Message = {
                id: `ast-${Date.now()}`,
                role: 'assistant',
                content: data.reply ?? 'I would be delighted to assist you. Please select a recommendation or visit our Find Chefs page.',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMsg])
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: 'I experienced a momentary connection interruption. You can browse all our chefs at [/find-chefs](/find-chefs) or join our [VIP Waitlist](/waitlist).',
                    timestamp: new Date(),
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const renderFormattedMessage = (content: string) => {
        const matchedChefs: Array<{ id: string; chef: typeof CHEF_DATABASE[string] }> = []
        for (const [key, chefData] of Object.entries(CHEF_DATABASE)) {
            const regex = new RegExp(`(/book/${key}|${chefData.name})`, 'i')
            if (regex.test(content)) {
                matchedChefs.push({ id: key, chef: chefData })
            }
        }

        const formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-terracotta underline font-semibold hover:opacity-80 transition-opacity">$1</a>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>')

        return (
            <div className="space-y-3">
                <div
                    className="leading-relaxed text-sm text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />

                {matchedChefs.length > 0 && (
                    <div className="pt-2 grid grid-cols-1 gap-2">
                        {matchedChefs.slice(0, 2).map(({ id, chef }) => (
                            <Link
                                key={id}
                                href={`/book/${id}`}
                                onClick={() => setOpen(false)}
                                className="group flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-stone-800/90 border border-terracotta/20 hover:border-terracotta hover:shadow-md transition-all text-left"
                            >
                                <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-border">
                                    <Image
                                        src={chef.photo}
                                        alt={chef.name}
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate group-hover:text-terracotta transition-colors">
                                        {chef.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {chef.cuisine} • {chef.location}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-xs font-bold text-terracotta">£{chef.rate}</span>
                                    <span className="text-[10px] text-muted-foreground">/hr</span>
                                    <div className="flex items-center justify-end text-[10px] text-amber-500 font-medium">
                                        <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {content.toLowerCase().includes('/waitlist') && (
                    <div className="pt-1">
                        <Link
                            href="/waitlist"
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-brand text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Reserve Priority VIP Waitlist Spot
                        </Link>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 p-3.5 sm:p-4 gradient-brand text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
                aria-label="Open ChefMii Global AI Concierge"
            >
                {open ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <div className="relative">
                            <ChefHat className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <span className="hidden md:inline font-semibold text-xs pr-1">Ask ChefMii Global</span>
                    </>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div
                    className={`fixed z-50 rounded-3xl shadow-2xl overflow-hidden border border-border/80 flex flex-col bg-background/95 backdrop-blur-xl transition-all duration-300 ${
                        expanded
                            ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[540px] h-[85vh] max-h-[750px]'
                            : 'bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[80vh]'
                    }`}
                >
                    {/* Header */}
                    <div className="gradient-brand px-4 py-3.5 flex items-center justify-between shadow-md select-none">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center border border-white/25 shadow-inner">
                                <ChefHat className="w-5 h-5 text-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-white font-serif font-bold text-sm">ChefMii Global Concierge</p>
                                    <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[10px] font-medium tracking-wide">
                                        AI BOT
                                    </span>
                                </div>
                                <p className="text-white/80 text-[11px] flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-white/90" />
                                    Powered by Google Gemini 3.5
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleReset}
                                title="Reset conversation"
                                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                title={expanded ? 'Minimize view' : 'Expand view'}
                                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors hidden sm:block"
                            >
                                {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                        window.speechSynthesis.cancel()
                                    }
                                    setSpeaking(null)
                                    setOpen(false)
                                }}
                                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Quick suggestion prompt chips */}
                    <div className="px-3 py-2 bg-muted/50 border-b border-border/50 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                        {QUICK_PROMPTS.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => sendMessage(item.prompt)}
                                disabled={loading}
                                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 text-[11px] font-medium text-foreground/80 hover:text-terracotta hover:border-terracotta/40 border border-border transition-all shadow-2xs hover:scale-102"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-full gradient-brand text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                                        <ChefHat className="w-3.5 h-3.5" />
                                    </div>
                                )}

                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm shadow-xs ${
                                            msg.role === 'user'
                                                ? 'gradient-brand text-white rounded-tr-xs'
                                                : 'bg-stone-100 dark:bg-stone-800/90 text-foreground border border-border/60 rounded-tl-xs'
                                        }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            renderFormattedMessage(msg.content)
                                        ) : (
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        )}
                                    </div>

                                    {/* Action footer for assistant messages */}
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-muted-foreground">
                                            <button
                                                onClick={() => handleSpeak(msg.content, msg.id)}
                                                className={`hover:text-foreground flex items-center gap-1 transition-colors ${speaking === msg.id ? 'text-terracotta font-semibold' : ''}`}
                                                title="Listen to response"
                                            >
                                                {speaking === msg.id ? (
                                                    <>
                                                        <VolumeX className="w-3.5 h-3.5 text-terracotta" />
                                                        <span>Stop</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="w-3.5 h-3.5" />
                                                        <span>Listen</span>
                                                    </>
                                                )}
                                            </button>
                                            <span>•</span>
                                            <button
                                                onClick={() => handleCopy(msg.content, msg.id)}
                                                className="hover:text-foreground flex items-center gap-1 transition-colors"
                                                title="Copy message"
                                            >
                                                {copiedId === msg.id ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="text-emerald-500">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Animated loading state */}
                        {loading && (
                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full gradient-brand text-white flex items-center justify-center shrink-0 mt-1">
                                    <ChefHat className="w-3.5 h-3.5" />
                                </div>
                                <div className="bg-stone-100 dark:bg-stone-800/90 rounded-2xl rounded-tl-xs px-4 py-3 border border-border/60 shadow-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-terracotta rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            sendMessage()
                        }}
                        className="border-t border-border/80 p-3 bg-muted/30 flex items-center gap-2 shrink-0"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about chefs, cuisines, pricing, or waitlist..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 placeholder:text-muted-foreground/70"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2.5 gradient-brand text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all active:scale-95 shadow-sm shrink-0"
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
