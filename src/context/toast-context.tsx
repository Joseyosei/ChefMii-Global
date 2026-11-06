'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
    id: string
    title: string
    description?: string
    type: ToastType
}

interface ToastContextType {
    showToast: (title: string, type?: ToastType, description?: string) => void
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const showToast = useCallback((title: string, type: ToastType = 'success', description?: string) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const newToast: ToastMessage = { id, title, description, type }
        setToasts((prev) => [...prev, newToast])

        // Visual flash alert for deaf & hard-of-hearing users
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('chefmii_a11y_alert'))
        }

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <aside
                aria-label="Notification alerts"
                className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-200 text-sm ${
                            t.type === 'success'
                                ? 'bg-stone-900/95 text-white border-emerald-500/40 dark:bg-stone-900/95'
                                : t.type === 'error'
                                ? 'bg-rose-950/95 text-white border-rose-500/40'
                                : 'bg-stone-900/95 text-white border-terracotta/40'
                        }`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                            {t.type === 'info' && <Info className="w-4 h-4 text-terracotta" />}
                        </div>
                        <div className="flex-1 space-y-0.5">
                            <p className="font-bold text-xs leading-snug">{t.title}</p>
                            {t.description && <p className="text-[11px] text-stone-300 leading-tight">{t.description}</p>}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="text-stone-400 hover:text-white p-0.5 rounded-md transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </aside>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}
