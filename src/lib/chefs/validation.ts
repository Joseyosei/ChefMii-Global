/**
 * Validation for the chef application.
 *
 * The same schema runs on the client (instant feedback via react-hook-form)
 * and on the server (authoritative). Client-side validation is a convenience,
 * never a control: the API re-validates every field because a request can be
 * sent straight to the endpoint with no form involved.
 */

import { z } from 'zod'
import type { DocumentType, VerificationStageId } from '@/types/onboarding'
import { DOCUMENT_LIMITS, VERIFICATION_STAGE_META } from '@/types/onboarding'

export const CHEF_TYPES = ['independent', 'freelance', 'professional', 'home', 'michelin'] as const
export const CURRENCIES = ['GBP', 'USD', 'EUR', 'AED'] as const

export const chefApplicationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(80, 'Name must be 80 characters or fewer.'),

    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),

    phone: z
      .string()
      .trim()
      .min(7, 'Enter a contact number we can reach you on.')
      .max(20, 'That number looks too long.')
      .regex(/^[+0-9().\s-]+$/, 'Use digits, spaces and + ( ) - only.'),

    chefType: z.enum(CHEF_TYPES, { message: 'Choose the option that best describes you.' }),

    cuisines: z
      .array(z.string().trim().min(1))
      .min(1, 'Select at least one cuisine.')
      .max(8, 'Pick your strongest eight cuisines or fewer.'),

    specialties: z
      .array(z.string().trim().min(1))
      .max(10, 'Ten specialties maximum.')
      .default([]),

    yearsExperience: z
      .number({ message: 'Enter your years of experience.' })
      .int('Use a whole number of years.')
      .min(0, 'That cannot be negative.')
      .max(70, 'Enter years of experience, not your age.'),

    bio: z
      .string()
      .trim()
      .min(100, 'Tell guests at least 100 characters about your cooking. This is what sells you.')
      .max(2000, 'Keep your bio under 2000 characters.'),

    hourlyRate: z
      .number({ message: 'Enter your hourly rate.' })
      .min(20, 'Minimum hourly rate is 20.')
      .max(5000, 'Contact us directly for rates above 5000 an hour.'),

    currency: z.enum(CURRENCIES).default('GBP'),

    minGuests: z.number().int().min(1, 'Minimum is 1 guest.').max(100),
    maxGuests: z.number().int().min(1).max(500, 'For events above 500 guests, contact us directly.'),

    locationCity: z.string().trim().min(2, 'Enter the city you cook in.').max(80),
    locationCountry: z.string().trim().min(2, 'Enter your country.').max(80),

    travelRadiusMiles: z
      .number()
      .int()
      .min(0)
      .max(500, 'Enter a travel radius of 500 miles or fewer.')
      .default(15),

    portfolioUrls: z
      .array(z.string().trim().url('Each portfolio link must be a full URL starting with https://'))
      .max(6, 'Six portfolio links maximum.')
      .default([]),

    instagramHandle: z
      .string()
      .trim()
      .max(40)
      .regex(/^@?[A-Za-z0-9._]+$/, 'Enter a valid Instagram handle.')
      .nullable()
      .optional()
      .transform((v) => (v ? v.replace(/^@/, '') : null)),
  })
  .refine((d) => d.maxGuests >= d.minGuests, {
    message: 'Maximum guests must be greater than or equal to minimum guests.',
    path: ['maxGuests'],
  })

/**
 * The shape the form component holds in state.
 *
 * `z.input` marks every field with a `.default()` as optional, which is right
 * for an API payload but wrong for controlled inputs: a controlled `<select>`
 * or `.join()` call needs the value to always be present. So the fields with
 * defaults are re-widened to required here, and the form seeds them explicitly.
 */
export type ChefApplicationFormValues = Omit<
  z.input<typeof chefApplicationSchema>,
  'specialties' | 'portfolioUrls' | 'currency' | 'travelRadiusMiles' | 'instagramHandle'
> & {
  specialties: string[]
  portfolioUrls: string[]
  currency: (typeof CURRENCIES)[number]
  travelRadiusMiles: number
  instagramHandle: string | null
}

/** The shape the schema produces after parsing, defaults and transforms applied. */
export type ChefApplicationParsed = z.output<typeof chefApplicationSchema>

// ─── Document registration ─────────────────────────────────────────────

const DOCUMENT_TYPES = [
  'government_id',
  'selfie',
  'food_hygiene_certificate',
  'public_liability_insurance',
  'allergen_certificate',
  'professional_qualification',
  'cooking_video',
] as const

export const documentRegistrationSchema = z.object({
  stage: z.enum(['identity', 'credentials', 'quality']),
  type: z.enum(DOCUMENT_TYPES),
  storagePath: z
    .string()
    .trim()
    .min(1, 'storagePath is required.')
    // Guard against a client pointing the record at someone else's folder.
    .refine((p) => p.startsWith('chef-documents/'), {
      message: 'storagePath must sit under chef-documents/.',
    }),
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(100),
  sizeBytes: z.number().int().positive().max(DOCUMENT_LIMITS.maxVideoBytes),
})

export type DocumentRegistrationInput = z.infer<typeof documentRegistrationSchema>

/** Is this document type valid for this stage? Rejects mismatched uploads. */
export function isDocumentValidForStage(stage: VerificationStageId, type: DocumentType): boolean {
  const required = VERIFICATION_STAGE_META[stage].requiredDocuments
  const optionalByStage: Record<VerificationStageId, DocumentType[]> = {
    identity: [],
    credentials: ['allergen_certificate', 'professional_qualification'],
    quality: [],
  }
  return required.includes(type) || optionalByStage[stage].includes(type)
}

/** Content-type and size check mirroring `storage.rules`. */
export function validateUploadConstraints(
  contentType: string,
  sizeBytes: number,
): { ok: true } | { ok: false; reason: string } {
  const isVideo = contentType.startsWith('video/')

  if (isVideo) {
    if (!DOCUMENT_LIMITS.allowedVideoTypes.includes(contentType as never)) {
      return { ok: false, reason: 'Upload an MP4, MOV or WebM video.' }
    }
    if (sizeBytes > DOCUMENT_LIMITS.maxVideoBytes) {
      return { ok: false, reason: 'Videos must be under 200 MB.' }
    }
    return { ok: true }
  }

  if (!DOCUMENT_LIMITS.allowedImageTypes.includes(contentType as never)) {
    return { ok: false, reason: 'Upload a JPG, PNG, WebP or PDF.' }
  }
  if (sizeBytes > DOCUMENT_LIMITS.maxImageBytes) {
    return { ok: false, reason: 'Documents must be under 10 MB.' }
  }
  return { ok: true }
}

/** Flatten a ZodError into the field-error shape the API returns. */
export function flattenZodError(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root'
    out[key] = [...(out[key] ?? []), issue.message]
  }
  return out
}
