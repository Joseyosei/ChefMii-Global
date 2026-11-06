'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    Accessibility, Eye, Ear, MousePointer, Brain,
    RotateCcw, X, Check, Type, Ruler, Sliders,
    Volume2, VolumeX, Sparkles, ExternalLink, ShieldCheck,
    ZoomIn, BellRing, Move, Key
} from 'lucide-react'
import { useAccessibility, FontSize, ContrastMode } from '@/context/accessibility-context'

export function AccessibilityWidget() {
    const {
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
    } = useAccessibility()

    const [activeTab, setActiveTab] = useState<'presets' | 'vision' | 'hearing' | 'motor'>('presets')
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, setIsOpen])

    const handleReadCurrentPage = () => {
        if (isSpeaking) {
            stopSpeaking()
            return
        }
        // Extract main readable content on the page
        const main = document.querySelector('main') || document.body
        const text = main.innerText || main.textContent || ''
        const trimmed = text.slice(0, 3000) // first 3000 chars for smooth reading
        speakText(trimmed)
    }

    return (
        <>
            {/* FLOATING TRIGGER BUTTON (Bottom Left) */}
            <div className="fixed bottom-6 left-6 z-40 flex items-center">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Open accessibility tools and settings. Keyboard shortcut: Alt + A"
                    aria-expanded={isOpen}
                    title="Accessibility Tools (Alt + A)"
                    className="group relative flex items-center justify-center w-14 h-14 p-3.5 rounded-full bg-[#FF5A36] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#FF5A36]/50"
                >
                    <Accessibility className="w-6 h-6 stroke-[2.2] animate-pulse group-hover:animate-none" />
                    
                    {/* Tooltip Badge */}
                    <span className="sr-only">Accessibility Controls (Alt+A)</span>
                    <span className="hidden group-hover:block absolute left-full ml-3 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap border border-stone-800">
                        Accessibility Settings <span className="opacity-70 text-[10px] ml-1">(Alt+A)</span>
                    </span>
                </button>
            </div>

            {/* MODAL DRAWER OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-start p-2 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false)
                    }}
                >
                    <div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="ChefMii Global Accessibility Settings and Accommodations"
                        className="w-full sm:max-w-xl max-h-[88vh] flex flex-col bg-stone-900 text-stone-100 rounded-3xl border border-stone-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#FF5A36] flex items-center justify-center text-white shadow-md">
                                    <Accessibility className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-base text-white flex items-center gap-2">
                                        Accessibility Center
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            WCAG 2.1 AA
                                        </span>
                                    </h2>
                                    <p className="text-xs text-stone-400">Accommodations for vision, hearing & mobility</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={resetSettings}
                                    title="Reset all settings to default"
                                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors text-xs flex items-center gap-1"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Reset</span>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close accessibility settings"
                                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* TAB NAVIGATION */}
                        <div className="flex border-b border-stone-800 bg-stone-950/40 p-2 gap-1.5 text-xs font-semibold">
                            <button
                                onClick={() => setActiveTab('presets')}
                                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                                    activeTab === 'presets'
                                        ? 'bg-[#FF5A36] text-white shadow-sm'
                                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Presets</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('vision')}
                                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                                    activeTab === 'vision'
                                        ? 'bg-[#FF5A36] text-white shadow-sm'
                                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                                }`}
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Vision</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('hearing')}
                                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                                    activeTab === 'hearing'
                                        ? 'bg-[#FF5A36] text-white shadow-sm'
                                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                                }`}
                            >
                                <Ear className="w-3.5 h-3.5" />
                                <span>Hearing</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('motor')}
                                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                                    activeTab === 'motor'
                                        ? 'bg-[#FF5A36] text-white shadow-sm'
                                        : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                                }`}
                            >
                                <MousePointer className="w-3.5 h-3.5" />
                                <span>Motor</span>
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
                            {/* TAB 1: QUICK PRESETS */}
                            {activeTab === 'presets' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-stone-400 leading-relaxed">
                                        Choose a profile that matches your needs for automatic 1-click optimization across the platform:
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Vision Profile */}
                                        <button
                                            onClick={() => applyPreset('vision')}
                                            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-[#FF5A36] text-left transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-[#FF5A36]">
                                                <Eye className="w-5 h-5" />
                                                <h3 className="font-bold text-white text-sm">Low Vision & Eyes</h3>
                                            </div>
                                            <p className="text-xs text-stone-300 leading-snug">
                                                High contrast, extra large text, prominent cursor, highlighted links & screen-reader read aloud.
                                            </p>
                                        </button>

                                        {/* Deaf & Hard of Hearing Profile */}
                                        <button
                                            onClick={() => applyPreset('hearing')}
                                            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-[#FF5A36] text-left transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                                <Ear className="w-5 h-5" />
                                                <h3 className="font-bold text-white text-sm">Deaf & Hard of Hearing</h3>
                                            </div>
                                            <p className="text-xs text-stone-300 leading-snug">
                                                Closed captions on ChefTV reels, visual screen alert flashes for notifications & text-first support.
                                            </p>
                                        </button>

                                        {/* Cognitive / Dyslexia Profile */}
                                        <button
                                            onClick={() => applyPreset('cognitive')}
                                            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-[#FF5A36] text-left transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-amber-400">
                                                <Brain className="w-5 h-5" />
                                                <h3 className="font-bold text-white text-sm">Cognitive & Dyslexia</h3>
                                            </div>
                                            <p className="text-xs text-stone-300 leading-snug">
                                                Dyslexia-friendly typography, reading guide ruler line, letter spacing & paused animations.
                                            </p>
                                        </button>

                                        {/* Motor / Mobility Profile */}
                                        <button
                                            onClick={() => applyPreset('motor')}
                                            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-[#FF5A36] text-left transition-all group"
                                        >
                                            <div className="flex items-center gap-2 mb-2 text-sky-400">
                                                <Move className="w-5 h-5" />
                                                <h3 className="font-bold text-white text-sm">Motor & Mobility</h3>
                                            </div>
                                            <p className="text-xs text-stone-300 leading-snug">
                                                Enlarged 48px+ touch targets, high-visibility focus borders, no animations & keyboard navigation.
                                            </p>
                                        </button>
                                    </div>

                                    {/* Built-in Text-To-Speech Reader bar */}
                                    <div className="mt-4 p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                                <Volume2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-white">Screen Reader (Read Aloud)</p>
                                                <p className="text-[11px] text-stone-400">Listen to current page contents</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleReadCurrentPage}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                                isSpeaking
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-[#FF5A36] text-white hover:opacity-90'
                                            }`}
                                        >
                                            {isSpeaking ? (
                                                <>
                                                    <VolumeX className="w-3.5 h-3.5" /> Stop Reading
                                                </>
                                            ) : (
                                                <>
                                                    <Volume2 className="w-3.5 h-3.5" /> Read Page
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: VISION & EYE SUPPORT */}
                            {activeTab === 'vision' && (
                                <div className="space-y-5">
                                    {/* Font Size Scaling */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-300 mb-2 flex items-center gap-2">
                                            <ZoomIn className="w-4 h-4 text-[#FF5A36]" />
                                            Font Sizing
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['normal', 'large', 'xlarge', 'xxlarge'] as FontSize[]).map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => updateSetting('fontSize', size)}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                                                        settings.fontSize === size
                                                            ? 'bg-[#FF5A36] text-white border-[#FF5A36] shadow-sm'
                                                            : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500'
                                                    }`}
                                                >
                                                    {size === 'normal' && '100%'}
                                                    {size === 'large' && '115%'}
                                                    {size === 'xlarge' && '130%'}
                                                    {size === 'xxlarge' && '150%'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Contrast & Colors */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-300 mb-2 flex items-center gap-2">
                                            <Sliders className="w-4 h-4 text-[#FF5A36]" />
                                            Contrast & Color Modes
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                            {[
                                                { mode: 'normal', label: 'Default' },
                                                { mode: 'high-contrast-dark', label: 'High Contrast Dark' },
                                                { mode: 'high-contrast-light', label: 'High Contrast Light' },
                                                { mode: 'grayscale', label: 'Monochrome Grayscale' },
                                                { mode: 'inverted', label: 'Inverted Color' },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.mode}
                                                    onClick={() => updateSetting('contrast', opt.mode as ContrastMode)}
                                                    className={`py-2.5 px-3 rounded-xl font-semibold border text-left transition-all ${
                                                        settings.contrast === opt.mode
                                                            ? 'bg-[#FF5A36] text-white border-[#FF5A36] shadow-sm'
                                                            : 'bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vision Aids Checkboxes */}
                                    <div className="space-y-2.5 pt-2">
                                        <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700/80 cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <Type className="w-4 h-4 text-[#FF5A36]" />
                                                <div>
                                                    <p className="font-bold text-xs text-white">Dyslexia-Friendly Typography</p>
                                                    <p className="text-[11px] text-stone-400">Specially formatted font characters to aid reading</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.dyslexicFont}
                                                onChange={(e) => updateSetting('dyslexicFont', e.target.checked)}
                                                className="w-4 h-4 accent-[#FF5A36] rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700/80 cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <ExternalLink className="w-4 h-4 text-[#FF5A36]" />
                                                <div>
                                                    <p className="font-bold text-xs text-white">Highlight All Interactive Links</p>
                                                    <p className="text-[11px] text-stone-400">Prominent underline and accent background</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.highlightLinks}
                                                onChange={(e) => updateSetting('highlightLinks', e.target.checked)}
                                                className="w-4 h-4 accent-[#FF5A36] rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700/80 cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <MousePointer className="w-4 h-4 text-[#FF5A36]" />
                                                <div>
                                                    <p className="font-bold text-xs text-white">Large High-Vis Mouse Cursor</p>
                                                    <p className="text-[11px] text-stone-400">Enlarged orange pointer with high-contrast border</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.bigCursor}
                                                onChange={(e) => updateSetting('bigCursor', e.target.checked)}
                                                className="w-4 h-4 accent-[#FF5A36] rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700/80 cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <Ruler className="w-4 h-4 text-[#FF5A36]" />
                                                <div>
                                                    <p className="font-bold text-xs text-white">Reading Guide Line (Ruler)</p>
                                                    <p className="text-[11px] text-stone-400">Follows cursor to focus on individual lines of text</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.readingGuide}
                                                onChange={(e) => updateSetting('readingGuide', e.target.checked)}
                                                className="w-4 h-4 accent-[#FF5A36] rounded"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-700/80 cursor-pointer">
                                            <div className="flex items-center gap-2.5">
                                                <ShieldCheck className="w-4 h-4 text-[#FF5A36]" />
                                                <div>
                                                    <p className="font-bold text-xs text-white">High-Visibility Focus Rings</p>
                                                    <p className="text-[11px] text-stone-400">Bold outlines on focused buttons and inputs</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.focusRings}
                                                onChange={(e) => updateSetting('focusRings', e.target.checked)}
                                                className="w-4 h-4 accent-[#FF5A36] rounded"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: HEARING & AUDITORY SUPPORT */}
                            {activeTab === 'hearing' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-stone-400 leading-relaxed">
                                        Accommodations for deaf and hard-of-hearing users across ChefTV streaming, notifications, and client bookings:
                                    </p>

                                    {/* Closed Captions */}
                                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                CC
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-white">Closed Captions & Subtitles (CC)</p>
                                                <p className="text-[11px] text-stone-400">Auto-display captions and transcripts for ChefTV reels</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.closedCaptions}
                                            onChange={(e) => updateSetting('closedCaptions', e.target.checked)}
                                            className="w-4 h-4 accent-emerald-500 rounded"
                                        />
                                    </label>

                                    {/* Visual Flash Alerts */}
                                    <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                    <BellRing className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-xs text-white">Visual Screen Flash Alerts</p>
                                                    <p className="text-[11px] text-stone-400">Flashes screen border when notifications arrive</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.visualAlerts}
                                                onChange={(e) => updateSetting('visualAlerts', e.target.checked)}
                                                className="w-4 h-4 accent-emerald-500 rounded"
                                            />
                                        </div>

                                        <button
                                            onClick={triggerVisualAlert}
                                            className="w-full py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-950 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                                            Test Visual Screen Flash Now
                                        </button>
                                    </div>

                                    {/* Text-First Support */}
                                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                                                💬
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-white">Text-First Support & Direct Messaging</p>
                                                <p className="text-[11px] text-stone-400">Prefers written chat and email over telephone calls</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.textFirstSupport}
                                            onChange={(e) => updateSetting('textFirstSupport', e.target.checked)}
                                            className="w-4 h-4 accent-sky-500 rounded"
                                        />
                                    </label>
                                </div>
                            )}

                            {/* TAB 4: MOTOR & COGNITIVE SUPPORT */}
                            {activeTab === 'motor' && (
                                <div className="space-y-4">
                                    {/* Big Click Targets */}
                                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                <Move className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-white">Large 48px+ Touch & Click Targets</p>
                                                <p className="text-[11px] text-stone-400">Increases button spacing and touch target area</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.bigClickTargets}
                                            onChange={(e) => updateSetting('bigClickTargets', e.target.checked)}
                                            className="w-4 h-4 accent-amber-500 rounded"
                                        />
                                    </label>

                                    {/* Pause Animations */}
                                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700 cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                                <Brain className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-white">Pause Animations (Reduced Motion)</p>
                                                <p className="text-[11px] text-stone-400">Stops scrolling transitions and vestibular triggers</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.reduceMotion}
                                            onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                                            className="w-4 h-4 accent-rose-500 rounded"
                                        />
                                    </label>

                                    {/* Keyboard Shortcuts Reference */}
                                    <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
                                        <p className="font-bold text-xs text-white flex items-center gap-2">
                                            <Key className="w-3.5 h-3.5 text-[#FF5A36]" />
                                            Essential Keyboard Shortcuts
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                                                <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-white font-mono font-bold mr-1">Alt + A</kbd>
                                                <span className="text-stone-300">Open Accessibility</span>
                                            </div>
                                            <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                                                <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-white font-mono font-bold mr-1">Tab</kbd>
                                                <span className="text-stone-300">Next Element</span>
                                            </div>
                                            <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                                                <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-white font-mono font-bold mr-1">Shift + Tab</kbd>
                                                <span className="text-stone-300">Previous Element</span>
                                            </div>
                                            <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                                                <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-white font-mono font-bold mr-1">Esc</kbd>
                                                <span className="text-stone-300">Close Overlay</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-400">
                            <Link
                                href="/accessibility"
                                onClick={() => setIsOpen(false)}
                                className="text-[#FF5A36] hover:underline font-semibold flex items-center gap-1"
                            >
                                Accessibility Statement & Accommodations
                                <ExternalLink className="w-3 h-3" />
                            </Link>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
