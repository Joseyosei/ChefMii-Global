'use client'

/**
 * Admin chef verification console.
 *
 * One card per applicant: their details, the documents they uploaded, and
 * approve / request-changes controls per stage.
 *
 * Access control is enforced by the API (`requireAdmin`), not by this page.
 * The role check here only decides what to render; a non-admin who loaded the
 * page anyway would get 403s from every endpoint.
 */

import { useCallback, useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui'
import { useAuth } from '@/context/auth-context'
import { authedFetch } from '@/lib/chefs/upload-client'
import type { ChefApplication, ChefDocument, ChefVerification, VerificationStageId } from '@/types/onboarding'
import { VERIFICATION_STAGE_META, VERIFICATION_STAGE_ORDER } from '@/types/onboarding'
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Clock,
} from 'lucide-react'

interface QueueItem {
  application: ChefApplication
  verification: ChefVerification
  documents: ChefDocument[]
}

type StatusFilter = 'queue' | 'approved' | 'rejected' | 'all'

export default function AdminChefsPage() {
  const { user, role, loading: authLoading } = useAuth()

  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('queue')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusParam =
        filter === 'queue' ? '' : filter === 'all' ? 'all' : filter === 'approved' ? 'approved' : 'rejected'
      const res = await authedFetch(
        `/api/admin/chef-applications${statusParam ? `?status=${statusParam}` : ''}`,
        { method: 'GET' },
      )
      const data = (await res.json()) as { success?: boolean; items?: QueueItem[]; error?: string }

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Could not load the review queue.')
        return
      }
      setItems(data.items ?? [])
    } catch {
      setError('Network problem loading the queue.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (authLoading || !user) return
    void load()
  }, [authLoading, user, load])

  if (authLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        </div>
      </Shell>
    )
  }

  if (!user || role !== 'admin') {
    return (
      <Shell>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-3">Admins only</h1>
          <p className="text-muted-foreground">
            This console reviews identity documents, so it is restricted to admin accounts.
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verification console
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Chef applications</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {loading ? 'Loading…' : `${items.length} application${items.length === 1 ? '' : 's'}`}
              {filter === 'queue' ? ' awaiting review' : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
            {(['queue', 'approved', 'rejected', 'all'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  filter === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-terracotta" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-border bg-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
            <h2 className="font-bold text-foreground mb-1.5">Queue is clear</h2>
            <p className="text-sm text-muted-foreground">
              No applications are waiting on a decision.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
              <ApplicationCard key={item.application.id} item={item} onDecided={load} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  )
}

function ApplicationCard({ item, onDecided }: { item: QueueItem; onDecided: () => void }) {
  const { application, verification, documents } = item
  const [busyStage, setBusyStage] = useState<VerificationStageId | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const decide = async (
    stage: VerificationStageId,
    decision: 'approved' | 'rejected',
  ) => {
    const reason = notes[stage]?.trim() ?? ''
    if (decision === 'rejected' && !reason) {
      setError('Add a reason before requesting changes. The chef sees this message.')
      return
    }

    setError(null)
    setMessage(null)
    setBusyStage(stage)
    try {
      const res = await authedFetch(`/api/admin/chef-applications/${application.id}`, {
        method: 'POST',
        body: JSON.stringify({ stage, decision, notes: reason || undefined }),
      })
      const data = (await res.json()) as { success?: boolean; message?: string; error?: string }

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Could not record that decision.')
        return
      }
      setMessage(data.message ?? 'Decision recorded.')
      onDecided()
    } catch {
      setError('Network problem recording that decision.')
    } finally {
      setBusyStage(null)
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Applicant header */}
      <header className="p-5 sm:p-6 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{application.fullName}</h2>
            <p className="text-sm text-muted-foreground capitalize mt-0.5">
              {application.chefType.replace(/_/g, ' ')} · {application.yearsExperience} yrs
              experience · {application.currency} {application.hourlyRate}/hr
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {application.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {application.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {application.locationCity}, {application.locationCountry}
              </span>
              {application.submittedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(application.submittedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            {application.cuisines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {application.cuisines.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
              verification.isFullyVerified
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                : 'bg-terracotta/15 text-terracotta'
            }`}
          >
            {verification.completedStages}/3 stages
          </span>
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {application.bio}
        </p>

        {application.portfolioUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {application.portfolioUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Portfolio
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Stage decisions */}
      <div className="divide-y divide-border">
        {VERIFICATION_STAGE_ORDER.map((stageId, index) => {
          const stage = verification.stages[stageId]
          const stageDocs = documents.filter((d) => d.stage === stageId)
          const meta = VERIFICATION_STAGE_META[stageId]
          const decided = stage.status === 'approved'

          return (
            <div key={stageId} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-sm">
                    Stage {index + 1}: {meta.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                </div>
                <StatusChip status={stage.status} />
              </div>

              {stageDocs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No documents uploaded for this stage yet.
                </p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {stageDocs.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </ul>
              )}

              {stage.adminNotes && stage.status === 'rejected' && (
                <p className="text-xs text-destructive mb-3">
                  <strong className="font-semibold">Sent back:</strong> {stage.adminNotes}
                </p>
              )}

              {!decided && stageDocs.length > 0 && (
                <div className="space-y-2.5">
                  <textarea
                    value={notes[stageId] ?? ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [stageId]: e.target.value }))}
                    rows={2}
                    placeholder="Reason, required when requesting changes. The chef reads this."
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 resize-y"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busyStage !== null}
                      onClick={() => void decide(stageId, 'approved')}
                    >
                      {busyStage === stageId ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Approve {meta.label.toLowerCase()}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyStage !== null}
                      onClick={() => void decide(stageId, 'rejected')}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Request changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(message || error) && (
        <footer className="px-5 sm:px-6 py-4 border-t border-border">
          {message && <p className="text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </footer>
      )}
    </article>
  )
}

function DocumentRow({ doc }: { doc: ChefDocument }) {
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = async () => {
    setOpening(true)
    setError(null)
    try {
      const res = await authedFetch(`/api/admin/chef-documents/${doc.id}`, { method: 'GET' })
      const data = (await res.json()) as { success?: boolean; url?: string; error?: string }

      if (!res.ok || !data.success || !data.url) {
        setError(data.error ?? 'Could not open that document.')
        return
      }
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Network problem opening that document.')
    } finally {
      setOpening(false)
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background">
      <div className="flex items-center gap-2.5 min-w-0">
        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {doc.type.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {doc.filename} · {(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB
          </p>
          {error && <p className="text-[11px] text-destructive mt-0.5">{error}</p>}
        </div>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={open} disabled={opening}>
        {opening ? (
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        ) : (
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
        )}
        View
      </Button>
    </li>
  )
}

function StatusChip({ status }: { status: ChefVerification['stages'][VerificationStageId]['status'] }) {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    rejected: 'bg-destructive/15 text-destructive',
    pending: 'bg-terracotta/15 text-terracotta',
    in_review: 'bg-terracotta/15 text-terracotta',
    not_started: 'bg-muted text-muted-foreground',
  }
  const labels: Record<string, string> = {
    approved: 'Approved',
    rejected: 'Changes requested',
    pending: 'Awaiting review',
    in_review: 'In review',
    not_started: 'Not started',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

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
