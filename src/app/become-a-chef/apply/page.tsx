'use client'

/**
 * Chef application and verification.
 *
 * Three states, decided by what the API returns:
 *   - not signed in          -> prompt to sign in
 *   - no application yet     -> the three-step application form
 *   - application exists     -> verification progress and document uploads
 *
 * Form state is managed locally and validated with `chefApplicationSchema`,
 * the same schema the API enforces, so client and server can never disagree
 * about what counts as valid.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context/auth-context'
import { authedFetch } from '@/lib/chefs/upload-client'
import {
  CHEF_TYPES,
  CURRENCIES,
  chefApplicationSchema,
  flattenZodError,
  type ChefApplicationFormValues,
} from '@/lib/chefs/validation'
import { CUISINES } from '@/lib/chefs/seed-catalogue'
import type { ChefApplication, ChefVerification } from '@/types/onboarding'
import { VERIFICATION_STAGE_META, VERIFICATION_STAGE_ORDER } from '@/types/onboarding'
import { VerificationPanel } from '@/components/chefs/verification-panel'
import {
  ChefHat,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react'

const CHEF_TYPE_LABELS: Record<(typeof CHEF_TYPES)[number], string> = {
  independent: 'Independent chef',
  freelance: 'Freelance chef',
  professional: 'Professional / restaurant chef',
  home: 'Home chef',
  michelin: 'Michelin-trained chef',
}

const STEPS = ['About you', 'Your craft', 'Rates & location'] as const

const EMPTY_FORM: ChefApplicationFormValues = {
  fullName: '',
  email: '',
  phone: '',
  chefType: 'independent',
  cuisines: [],
  specialties: [],
  yearsExperience: 0,
  bio: '',
  hourlyRate: 100,
  currency: 'GBP',
  minGuests: 2,
  maxGuests: 10,
  locationCity: '',
  locationCountry: '',
  travelRadiusMiles: 15,
  portfolioUrls: [],
  instagramHandle: null,
}

/** Which fields each step owns, so we validate only that step on Next. */
const STEP_FIELDS: readonly (readonly string[])[] = [
  ['fullName', 'email', 'phone'],
  ['chefType', 'cuisines', 'specialties', 'yearsExperience', 'bio'],
  [
    'hourlyRate',
    'currency',
    'minGuests',
    'maxGuests',
    'locationCity',
    'locationCountry',
    'travelRadiusMiles',
    'portfolioUrls',
    'instagramHandle',
  ],
]

export default function ChefApplyPage() {
  const { user, profile, loading: authLoading } = useAuth()

  const [loadingApplication, setLoadingApplication] = useState(true)
  const [application, setApplication] = useState<ChefApplication | null>(null)
  const [verification, setVerification] = useState<ChefVerification | null>(null)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ChefApplicationFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Prefill from the signed-in profile so people are not retyping what we know.
  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || profile?.full_name || user.displayName || '',
      email: prev.email || profile?.email || user.email || '',
      phone: prev.phone || profile?.phone || '',
    }))
  }, [user, profile])

  const loadApplication = useCallback(async () => {
    if (!user) {
      setLoadingApplication(false)
      return
    }
    try {
      const res = await authedFetch('/api/chefs/apply', { method: 'GET' })
      const data = (await res.json()) as {
        success?: boolean
        application: ChefApplication | null
        verification: ChefVerification | null
      }
      if (data.success) {
        setApplication(data.application)
        setVerification(data.verification)
      }
    } catch (err) {
      console.error('Could not load application:', err)
    } finally {
      setLoadingApplication(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void loadApplication()
  }, [authLoading, loadApplication])

  const update = <K extends keyof ChefApplicationFormValues>(
    key: K,
    value: ChefApplicationFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  /** Validate the whole form, then keep only errors belonging to `fields`. */
  const validateFields = (fields: readonly string[]): boolean => {
    const result = chefApplicationSchema.safeParse(form)
    if (result.success) {
      setErrors({})
      return true
    }
    const all = flattenZodError(result.error)
    const relevant: Record<string, string[]> = {}
    for (const [key, messages] of Object.entries(all)) {
      if (fields.includes(key)) relevant[key] = messages
    }
    setErrors(relevant)
    return Object.keys(relevant).length === 0
  }

  const goNext = () => {
    if (validateFields(STEP_FIELDS[step])) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleSubmit = async () => {
    setSubmitError(null)

    const result = chefApplicationSchema.safeParse(form)
    if (!result.success) {
      const all = flattenZodError(result.error)
      setErrors(all)
      // Jump back to the earliest step that still has a problem.
      const firstBadStep = STEP_FIELDS.findIndex((fields) =>
        fields.some((f) => all[f]?.length),
      )
      if (firstBadStep >= 0) setStep(firstBadStep)
      return
    }

    setSubmitting(true)
    try {
      const res = await authedFetch('/api/chefs/apply', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as {
        success?: boolean
        error?: string
        fieldErrors?: Record<string, string[]>
        verification?: ChefVerification
      }

      if (!res.ok || !data.success) {
        setSubmitError(data.error ?? 'We could not submit your application. Please try again.')
        if (data.fieldErrors) setErrors(data.fieldErrors)
        return
      }

      await loadApplication()
    } catch {
      setSubmitError('Network problem. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (key: string) => errors[key]?.[0]

  const stageSummary = useMemo(() => {
    if (!verification) return null
    const approved = VERIFICATION_STAGE_ORDER.filter(
      (s) => verification.stages[s].status === 'approved',
    ).length
    return { approved, total: VERIFICATION_STAGE_ORDER.length }
  }, [verification])

  // ── Loading ────────────────────────────────────────────────────────
  if (authLoading || loadingApplication) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          <p className="text-sm text-muted-foreground">Loading your application…</p>
        </div>
      </Shell>
    )
  }

  // ── Not signed in ──────────────────────────────────────────────────
  if (!user) {
    return (
      <Shell>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-terracotta/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-terracotta" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
            Create an account to apply
          </h1>
          <p className="text-muted-foreground mb-8">
            Your application and verification documents are tied to your account, so you can come
            back and finish at any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register?role=chef&next=/become-a-chef/apply">
              <Button size="lg" className="w-full sm:w-auto">
                Create account
              </Button>
            </Link>
            <Link href="/login?next=/become-a-chef/apply">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Approved ───────────────────────────────────────────────────────
  if (application?.status === 'approved') {
    return (
      <Shell>
        <div className="max-w-xl mx-auto text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
            You are verified and live
          </h1>
          <p className="text-muted-foreground mb-8">
            All three stages are approved and your profile is visible to guests. Connect your bank
            through Stripe so bookings can pay out to you.
          </p>
          <Link href="/chef-dashboard">
            <Button size="lg">Open chef dashboard</Button>
          </Link>
        </div>
      </Shell>
    )
  }

  // ── Application submitted: verification in progress ────────────────
  if (application && verification) {
    return (
      <Shell>
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-5">
              <ChefHat className="w-3.5 h-3.5" />
              {application.status === 'changes_requested'
                ? 'Action needed'
                : 'Verification in progress'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
              {application.status === 'changes_requested'
                ? 'We need one more thing'
                : 'Complete your verification'}
            </h1>
            <p className="text-muted-foreground">
              {stageSummary?.approved === 0
                ? 'Upload your documents below. Each stage is reviewed by our team, and you only need to do this once.'
                : `${stageSummary?.approved} of ${stageSummary?.total} stages approved. Keep going.`}
            </p>
          </div>

          <VerificationPanel verification={verification} onChange={loadApplication} />

          <div className="mt-10 p-5 rounded-2xl border border-border bg-muted/30">
            <h2 className="text-sm font-bold text-foreground mb-2">What happens next</h2>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {VERIFICATION_STAGE_ORDER.map((id) => (
                <li key={id}>
                  <span className="font-medium text-foreground">
                    {VERIFICATION_STAGE_META[id].label}
                  </span>{' '}
                  &mdash; reviewed within {VERIFICATION_STAGE_META[id].slaHours} hours of upload.
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              We email you after every decision. Nothing is published until all three stages pass.
            </p>
          </div>
        </div>
      </Shell>
    )
  }

  // ── The application form ───────────────────────────────────────────
  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-5">
            <ChefHat className="w-3.5 h-3.5" />
            Chef application
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
            Apply to cook with ChefMii Global
          </h1>
          <p className="text-muted-foreground">
            Takes about five minutes. You upload your documents on the next screen.
          </p>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center gap-2 mb-8" aria-label="Application progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  i <= step ? 'bg-terracotta' : 'bg-border'
                }`}
              />
              <p
                className={`mt-2 text-xs font-medium ${
                  i === step ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </p>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <Field label="Full name" error={fieldError('fullName')} htmlFor="fullName">
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="e.g. Amara Osei"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email" error={fieldError('email')} htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="e.g. amara@example.com"
                  autoComplete="email"
                />
              </Field>

              <Field
                label="Phone"
                error={fieldError('phone')}
                htmlFor="phone"
                hint="We only use this for booking coordination."
              >
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+44 7123 456789"
                  autoComplete="tel"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="What kind of chef are you?" error={fieldError('chefType')}>
                <div className="grid sm:grid-cols-2 gap-2">
                  {CHEF_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('chefType', type)}
                      aria-pressed={form.chefType === type}
                      className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        form.chefType === type
                          ? 'border-terracotta bg-terracotta/10 text-foreground'
                          : 'border-border hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {CHEF_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field
                label="Cuisines"
                error={fieldError('cuisines')}
                hint="Pick up to eight. These decide which searches you appear in."
              >
                <div className="flex flex-wrap gap-2">
                  {CUISINES.filter((c) => c !== 'All').map((cuisine) => {
                    const selected = form.cuisines.includes(cuisine)
                    return (
                      <button
                        key={cuisine}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          update(
                            'cuisines',
                            selected
                              ? form.cuisines.filter((c) => c !== cuisine)
                              : [...form.cuisines, cuisine].slice(0, 8),
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          selected
                            ? 'border-terracotta bg-terracotta text-white'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {cuisine}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field
                label="Specialties"
                error={fieldError('specialties')}
                hint="Comma separated. e.g. Jollof rice, suya, plantain"
                htmlFor="specialties"
              >
                <Input
                  id="specialties"
                  value={form.specialties.join(', ')}
                  onChange={(e) =>
                    update(
                      'specialties',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="Jollof rice, suya, plantain"
                />
              </Field>

              <Field
                label="Years of professional experience"
                error={fieldError('yearsExperience')}
                htmlFor="yearsExperience"
              >
                <Input
                  id="yearsExperience"
                  type="number"
                  min={0}
                  max={70}
                  value={form.yearsExperience}
                  onChange={(e) => update('yearsExperience', Number(e.target.value))}
                />
              </Field>

              <Field
                label="Your bio"
                error={fieldError('bio')}
                htmlFor="bio"
                hint={`${form.bio.length} / 2000 characters. This is what guests read first.`}
              >
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="Where you trained, what you are known for, and what a guest can expect at your table."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 resize-y"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Hourly rate" error={fieldError('hourlyRate')} htmlFor="hourlyRate">
                    <Input
                      id="hourlyRate"
                      type="number"
                      min={20}
                      step={5}
                      value={form.hourlyRate}
                      onChange={(e) => update('hourlyRate', Number(e.target.value))}
                    />
                  </Field>
                </div>
                <Field label="Currency" error={fieldError('currency')} htmlFor="currency">
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(e) =>
                      update('currency', e.target.value as ChefApplicationFormValues['currency'])
                    }
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Minimum guests" error={fieldError('minGuests')} htmlFor="minGuests">
                  <Input
                    id="minGuests"
                    type="number"
                    min={1}
                    value={form.minGuests}
                    onChange={(e) => update('minGuests', Number(e.target.value))}
                  />
                </Field>
                <Field label="Maximum guests" error={fieldError('maxGuests')} htmlFor="maxGuests">
                  <Input
                    id="maxGuests"
                    type="number"
                    min={1}
                    value={form.maxGuests}
                    onChange={(e) => update('maxGuests', Number(e.target.value))}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City" error={fieldError('locationCity')} htmlFor="locationCity">
                  <Input
                    id="locationCity"
                    value={form.locationCity}
                    onChange={(e) => update('locationCity', e.target.value)}
                    placeholder="e.g. London"
                  />
                </Field>
                <Field
                  label="Country"
                  error={fieldError('locationCountry')}
                  htmlFor="locationCountry"
                >
                  <Input
                    id="locationCountry"
                    value={form.locationCountry}
                    onChange={(e) => update('locationCountry', e.target.value)}
                    placeholder="e.g. United Kingdom"
                  />
                </Field>
              </div>

              <Field
                label="How far will you travel?"
                error={fieldError('travelRadiusMiles')}
                htmlFor="travelRadiusMiles"
                hint="In miles, from your city."
              >
                <Input
                  id="travelRadiusMiles"
                  type="number"
                  min={0}
                  max={500}
                  value={form.travelRadiusMiles}
                  onChange={(e) => update('travelRadiusMiles', Number(e.target.value))}
                />
              </Field>

              <Field
                label="Portfolio links"
                error={fieldError('portfolioUrls')}
                htmlFor="portfolioUrls"
                hint="Optional. One per line. Website, press, or a menu PDF."
              >
                <textarea
                  id="portfolioUrls"
                  value={form.portfolioUrls.join('\n')}
                  onChange={(e) =>
                    update(
                      'portfolioUrls',
                      e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  rows={3}
                  placeholder={'https://your-site.com\nhttps://press-feature.com/article'}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 resize-y"
                />
              </Field>

              <Field
                label="Instagram handle"
                error={fieldError('instagramHandle')}
                htmlFor="instagramHandle"
                hint="Optional."
              >
                <Input
                  id="instagramHandle"
                  value={form.instagramHandle ?? ''}
                  onChange={(e) => update('instagramHandle', e.target.value || null)}
                  placeholder="@yourhandle"
                />
              </Field>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0 || submitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Continue
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit application
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  )
}

// ─── Small presentational helpers ──────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-28 sm:pt-32 pb-24 text-foreground">
        <div className="px-4 sm:px-6">{children}</div>
      </main>
      <Footer />
    </>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-foreground mb-1.5"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
