'use client'

/**
 * Verification progress and document upload, one card per stage.
 *
 * Stages unlock in order: you cannot upload credentials before identity is
 * approved. That mirrors the server, where `countCompleted` stops at the first
 * gap, so progress cannot be skipped by hitting the API directly.
 */

import { useState } from 'react'
import { Button } from '@/components/ui'
import { uploadVerificationDocument, UploadError } from '@/lib/chefs/upload-client'
import type { ChefVerification, DocumentType, VerificationStageId } from '@/types/onboarding'
import { VERIFICATION_STAGE_META, VERIFICATION_STAGE_ORDER } from '@/types/onboarding'
import {
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Loader2,
  Lock,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  government_id: 'Government photo ID',
  selfie: 'Selfie holding your ID',
  food_hygiene_certificate: 'Food hygiene certificate',
  public_liability_insurance: 'Public liability insurance',
  allergen_certificate: 'Allergen training certificate (optional)',
  professional_qualification: 'Professional qualification (optional)',
  cooking_video: 'Short cooking video',
}

const ACCEPT: Record<DocumentType, string> = {
  government_id: 'image/jpeg,image/png,image/webp,application/pdf',
  selfie: 'image/jpeg,image/png,image/webp',
  food_hygiene_certificate: 'image/jpeg,image/png,image/webp,application/pdf',
  public_liability_insurance: 'image/jpeg,image/png,image/webp,application/pdf',
  allergen_certificate: 'image/jpeg,image/png,image/webp,application/pdf',
  professional_qualification: 'image/jpeg,image/png,image/webp,application/pdf',
  cooking_video: 'video/mp4,video/quicktime,video/webm',
}

interface Props {
  verification: ChefVerification
  /** Called after a successful upload so the parent can refetch state. */
  onChange: () => Promise<void> | void
}

export function VerificationPanel({ verification, onChange }: Props) {
  return (
    <div className="space-y-4">
      {VERIFICATION_STAGE_ORDER.map((stageId, index) => {
        const stage = verification.stages[stageId]
        // A stage is locked until every stage before it is approved.
        const locked = VERIFICATION_STAGE_ORDER.slice(0, index).some(
          (prev) => verification.stages[prev].status !== 'approved',
        )
        return (
          <StageCard
            key={stageId}
            stageId={stageId}
            status={stage.status}
            adminNotes={stage.adminNotes}
            documentCount={stage.documentIds.length}
            locked={locked}
            index={index}
            onChange={onChange}
          />
        )
      })}
    </div>
  )
}

function StageCard({
  stageId,
  status,
  adminNotes,
  documentCount,
  locked,
  index,
  onChange,
}: {
  stageId: VerificationStageId
  status: ChefVerification['stages'][VerificationStageId]['status']
  adminNotes: string | null
  documentCount: number
  locked: boolean
  index: number
  onChange: () => Promise<void> | void
}) {
  const meta = VERIFICATION_STAGE_META[stageId]
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (type: DocumentType, file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploadingType(type)
    setProgress(0)
    try {
      await uploadVerificationDocument({
        file,
        stage: stageId,
        type,
        onProgress: setProgress,
      })
      await onChange()
    } catch (err) {
      setError(
        err instanceof UploadError
          ? err.message
          : 'Something went wrong with that upload. Please try again.',
      )
    } finally {
      setUploadingType(null)
      setProgress(0)
    }
  }

  const canUpload = !locked && status !== 'approved' && status !== 'in_review'

  return (
    <section
      className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
        status === 'approved'
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : status === 'rejected'
            ? 'border-destructive/30 bg-destructive/5'
            : locked
              ? 'border-border bg-muted/20'
              : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start gap-4">
        <StatusIcon status={status} locked={locked} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <h3 className="font-bold text-foreground">
              Stage {index + 1}: {meta.label}
            </h3>
            <StatusLabel status={status} locked={locked} />
          </div>

          <p className="text-sm text-muted-foreground mb-1">{meta.description}</p>
          <p className="text-xs text-muted-foreground">
            Reviewed within {meta.slaHours} hours
            {documentCount > 0 ? ` · ${documentCount} file${documentCount === 1 ? '' : 's'} uploaded` : ''}
          </p>

          {status === 'rejected' && adminNotes && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong className="font-semibold">What to fix:</strong> {adminNotes}
              </span>
            </div>
          )}

          {locked && (
            <p className="mt-3 text-xs text-muted-foreground">
              Unlocks once the previous stage is approved.
            </p>
          )}

          {canUpload && (
            <div className="mt-4 space-y-2.5">
              {meta.requiredDocuments.map((type) => (
                <UploadRow
                  key={type}
                  type={type}
                  busy={uploadingType === type}
                  progress={uploadingType === type ? progress : 0}
                  disabled={uploadingType !== null}
                  onSelect={(file) => void handleFile(type, file)}
                />
              ))}
            </div>
          )}

          {status === 'pending' && (
            <p className="mt-3 text-xs text-muted-foreground">
              Submitted. You can upload a replacement until our team picks it up.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-destructive flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function UploadRow({
  type,
  busy,
  progress,
  disabled,
  onSelect,
}: {
  type: DocumentType
  busy: boolean
  progress: number
  disabled: boolean
  onSelect: (file: File | undefined) => void
}) {
  const inputId = `upload-${type}`

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background">
      <label htmlFor={inputId} className="text-sm text-foreground font-medium cursor-pointer">
        {DOCUMENT_LABELS[type]}
      </label>

      <div className="flex items-center gap-2 shrink-0">
        {busy && (
          <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {progress}%
          </span>
        )}
        <input
          id={inputId}
          type="file"
          accept={ACCEPT[type]}
          disabled={disabled}
          onChange={(e) => {
            onSelect(e.target.files?.[0])
            // Reset so selecting the same file again still fires onChange.
            e.target.value = ''
          }}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {busy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Choose file
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function StatusIcon({
  status,
  locked,
}: {
  status: ChefVerification['stages'][VerificationStageId]['status']
  locked: boolean
}) {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0'

  if (locked) {
    return (
      <div className={`${base} bg-muted`} aria-hidden>
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
    )
  }

  switch (status) {
    case 'approved':
      return (
        <div className={`${base} bg-emerald-500/15`} aria-hidden>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
      )
    case 'rejected':
      return (
        <div className={`${base} bg-destructive/15`} aria-hidden>
          <XCircle className="w-5 h-5 text-destructive" />
        </div>
      )
    case 'in_review':
      return (
        <div className={`${base} bg-terracotta/15`} aria-hidden>
          <FileCheck2 className="w-5 h-5 text-terracotta" />
        </div>
      )
    case 'pending':
      return (
        <div className={`${base} bg-terracotta/15`} aria-hidden>
          <Clock className="w-5 h-5 text-terracotta" />
        </div>
      )
    default:
      return (
        <div className={`${base} bg-muted`} aria-hidden>
          <Upload className="w-5 h-5 text-muted-foreground" />
        </div>
      )
  }
}

function StatusLabel({
  status,
  locked,
}: {
  status: ChefVerification['stages'][VerificationStageId]['status']
  locked: boolean
}) {
  if (locked) {
    return <Pill className="bg-muted text-muted-foreground">Locked</Pill>
  }

  switch (status) {
    case 'approved':
      return <Pill className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Approved</Pill>
    case 'rejected':
      return <Pill className="bg-destructive/15 text-destructive">Changes needed</Pill>
    case 'in_review':
      return <Pill className="bg-terracotta/15 text-terracotta">In review</Pill>
    case 'pending':
      return <Pill className="bg-terracotta/15 text-terracotta">Awaiting review</Pill>
    default:
      return <Pill className="bg-muted text-muted-foreground">Not started</Pill>
  }
}

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${className ?? ''}`}>
      {children}
    </span>
  )
}
