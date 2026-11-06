'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type FontSize = 'normal' | 'large' | 'xlarge' | 'xxlarge'
export type ContrastMode = 'normal' | 'high-contrast-dark' | 'high-contrast-light' | 'grayscale' | 'inverted'

export interface A11ySettings {
    // Vision & Eyes
    fontSize: FontSize
    contrast: ContrastMode
    dyslexicFont: boolean
    letterSpacing: boolean
    lineHeight: boolean
    highlightLinks: boolean
    readingGuide: boolean
    bigCursor: boolean
    focusRings: boolean
    screenReaderTTS: boolean

    // Hearing & Media
    closedCaptions: boolean
    visualAlerts: boolean
    textFirstSupport: boolean

    // Motor & Cognitive
    reduceMotion: boolean
    stopAutoplay: boolean
    bigClickTargets: boolean
}

export const DEFAULT_A11Y_SETTINGS: A11ySettings = {
    fontSize: 'normal',
    contrast: 'normal',
    dyslexicFont: false,
    letterSpacing: false,
    lineHeight: false,
    highlightLinks: false,
    readingGuide: false,
    bigCursor: false,
    focusRings: false,
    screenReaderTTS: false,

    closedCaptions: true,
    visualAlerts: false,
    textFirstSupport: false,

    reduceMotion: false,
    stopAutoplay: false,
    bigClickTargets: false,
}

interface AccessibilityContextType {
    settings: A11ySettings
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    updateSetting: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void
    resetSettings: () => void
    applyPreset: (preset: 'vision' | 'hearing' | 'motor' | 'cognitive' | 'reset') => void
    speakText: (text: string) => void
    stopSpeaking: () => void
    isSpeaking: boolean
    triggerVisualAlert: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType>({
    settings: DEFAULT_A11Y_SETTINGS,
    isOpen: false,
    setIsOpen: () => {},
    updateSetting: () => {},
    resetSettings: () => {},
    applyPreset: () => {},
    speakText: () => {},
    stopSpeaking: () => {},
    isSpeaking: false,
    triggerVisualAlert: () => {},
})

const STORAGE_KEY = 'chefmii_a11y_settings'

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<A11ySettings>(DEFAULT_A11Y_SETTINGS)
    const [isOpen, setIsOpen] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [guideY, setGuideY] = useState<number | null>(null)
    const [visualAlerting, setVisualAlerting] = useState(false)

    // Load saved settings from localStorage on client mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                setSettings((prev) => ({ ...prev, ...parsed }))
            }
        } catch (e) {
            console.error('Failed to parse a11y settings', e)
        }
    }, [])

    // Save and apply CSS classes on <html> whenever settings change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
        } catch (e) {
            console.error('Failed to save a11y settings', e)
        }

        const html = document.documentElement

        // Font sizes
        html.classList.remove('a11y-font-large', 'a11y-font-xlarge', 'a11y-font-xxlarge')
        if (settings.fontSize === 'large') html.classList.add('a11y-font-large')
        if (settings.fontSize === 'xlarge') html.classList.add('a11y-font-xlarge')
        if (settings.fontSize === 'xxlarge') html.classList.add('a11y-font-xxlarge')

        // Contrast
        html.classList.remove(
            'a11y-high-contrast-dark',
            'a11y-high-contrast-light',
            'a11y-grayscale',
            'a11y-inverted'
        )
        if (settings.contrast !== 'normal') {
            html.classList.add(`a11y-${settings.contrast}`)
        }

        // Toggles
        const toggleClass = (className: string, enabled: boolean) => {
            if (enabled) {
                html.classList.add(className)
            } else {
                html.classList.remove(className)
            }
        }

        toggleClass('a11y-dyslexic', settings.dyslexicFont)
        toggleClass('a11y-letter-spacing', settings.letterSpacing)
        toggleClass('a11y-line-height', settings.lineHeight)
        toggleClass('a11y-highlight-links', settings.highlightLinks)
        toggleClass('a11y-big-cursor', settings.bigCursor)
        toggleClass('a11y-focus-rings', settings.focusRings)
        toggleClass('a11y-reduce-motion', settings.reduceMotion)
        toggleClass('a11y-big-targets', settings.bigClickTargets)
        toggleClass('a11y-closed-captions-active', settings.closedCaptions)
        toggleClass('a11y-text-first-active', settings.textFirstSupport)
    }, [settings])

    // Keyboard shortcut (Alt + A) to toggle Accessibility drawer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault()
                setIsOpen((prev) => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Track mouse for Reading Guide Ruler
    useEffect(() => {
        if (!settings.readingGuide) {
            setGuideY(null)
            return
        }

        const handleMouseMove = (e: MouseEvent) => {
            setGuideY(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [settings.readingGuide])

    const updateSetting = useCallback(<K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }))
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_A11Y_SETTINGS)
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch (e) {
            console.error('Failed to reset a11y settings', e)
        }
    }, [])

    const applyPreset = useCallback((preset: 'vision' | 'hearing' | 'motor' | 'cognitive' | 'reset') => {
        if (preset === 'reset') {
            resetSettings()
            return
        }

        if (preset === 'vision') {
            setSettings((prev) => ({
                ...prev,
                fontSize: 'xlarge',
                contrast: 'high-contrast-dark',
                highlightLinks: true,
                focusRings: true,
                bigCursor: true,
                screenReaderTTS: true,
            }))
        } else if (preset === 'hearing') {
            setSettings((prev) => ({
                ...prev,
                closedCaptions: true,
                visualAlerts: true,
                textFirstSupport: true,
            }))
        } else if (preset === 'motor') {
            setSettings((prev) => ({
                ...prev,
                bigCursor: true,
                bigClickTargets: true,
                focusRings: true,
                reduceMotion: true,
            }))
        } else if (preset === 'cognitive') {
            setSettings((prev) => ({
                ...prev,
                dyslexicFont: true,
                letterSpacing: true,
                lineHeight: true,
                readingGuide: true,
                reduceMotion: true,
                stopAutoplay: true,
            }))
        }
    }, [resetSettings])

    const triggerVisualAlert = useCallback(() => {
        if (!settings.visualAlerts) return
        setVisualAlerting(true)
        setTimeout(() => setVisualAlerting(false), 1200)
    }, [settings.visualAlerts])

    // Listen to custom alert events for system-wide notifications
    useEffect(() => {
        const handleAlert = () => triggerVisualAlert()
        window.addEventListener('chefmii_a11y_alert', handleAlert)
        return () => window.removeEventListener('chefmii_a11y_alert', handleAlert)
    }, [triggerVisualAlert])

    const speakText = useCallback((text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

        window.speechSynthesis.cancel()

        if (!text.trim()) return

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.95
        utterance.pitch = 1.0
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }, [])

    const stopSpeaking = useCallback(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
    }, [])

    return (
        <AccessibilityContext.Provider
            value={{
                settings,
                isOpen,
                setIsOpen,
                updateSetting,
                resetSettings,
                applyPreset,
                speakText,
                stopSpeaking,
                isSpeaking,
                triggerVisualAlert,
            }}
        >
            {children}

            {/* Reading Guide Ruler overlay for Eye/Focus support */}
            {settings.readingGuide && guideY !== null && (
                <div
                    aria-hidden="true"
                    className="fixed left-0 right-0 pointer-events-none z-[9999] transition-all duration-75"
                    style={{
                        top: `${guideY - 20}px`,
                        height: '42px',
                        backgroundColor: 'rgba(255, 90, 54, 0.12)',
                        borderTop: '2px solid #FF5A36',
                        borderBottom: '2px solid #FF5A36',
                        boxShadow: '0 0 16px rgba(255, 90, 54, 0.25)',
                    }}
                />
            )}

            {/* Visual Screen Alert Flash for Deaf & Hard of Hearing users */}
            {visualAlerting && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 pointer-events-none z-[99999] border-[10px] border-emerald-500 animate-pulse bg-emerald-500/10"
                />
            )}
        </AccessibilityContext.Provider>
    )
}

export function useAccessibility() {
    return useContext(AccessibilityContext)
}
