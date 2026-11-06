/**
 * Transactional email via Resend.
 *
 * Every function here is best-effort and must never throw into a request path:
 * an application or an approval is far more important than its notification
 * email. Callers fire and log.
 *
 * When RESEND_API_KEY is absent (local development) emails are logged to the
 * console instead of sent, so flows stay testable without credentials.
 */

import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM || 'ChefMii Global <no-reply@chefmii.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.chefmii.com'

let client: Resend | null = null

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!client) client = new Resend(key)
  return client
}

interface SendArgs {
  to: string
  subject: string
  html: string
}

async function send({ to, subject, html }: SendArgs): Promise<void> {
  const resend = getClient()

  if (!resend) {
    console.info(`[email:dev] would send "${subject}" to ${to}`)
    return
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) {
    throw new Error(`Resend rejected the message: ${error.message}`)
  }
}

// ─── Templates ─────────────────────────────────────────────────────────

/** Shared shell. Inline styles only: email clients strip <style> blocks. */
function layout(heading: string, bodyHtml: string, cta?: { label: string; href: string }): string {
  return `
<div style="margin:0;padding:32px 16px;background:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ecebe8;">
    <div style="padding:28px 32px;background:#F04E37;">
      <h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;font-weight:700;letter-spacing:-0.01em;">ChefMii Global</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1c1c1e;font-weight:700;">${heading}</h2>
      <div style="font-size:15px;line-height:1.65;color:#44423f;">${bodyHtml}</div>
      ${
        cta
          ? `<div style="margin-top:28px;">
               <a href="${cta.href}" style="display:inline-block;padding:13px 24px;background:#F04E37;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">${cta.label}</a>
             </div>`
          : ''
      }
    </div>
    <div style="padding:20px 32px;background:#faf9f7;border-top:1px solid #ecebe8;font-size:12px;line-height:1.6;color:#8a8681;">
      ChefMii Global &middot; <a href="${APP_URL}" style="color:#8a8681;">chefmii.com</a>
    </div>
  </div>
</div>`.trim()
}

/** Escape user-supplied text before putting it in HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendChefApplicationReceived(args: { to: string; name: string }): Promise<void> {
  await send({
    to: args.to,
    subject: 'We have your ChefMii application',
    html: layout(
      `Thanks, ${esc(args.name.split(' ')[0] ?? 'Chef')}`,
      `<p style="margin:0 0 14px;">Your application to cook with ChefMii Global is in. Next step is verification, which runs in three stages:</p>
       <ol style="margin:0 0 14px;padding-left:20px;">
         <li style="margin-bottom:6px;"><strong>Identity</strong> &mdash; photo ID and a selfie. Usually within 24 hours.</li>
         <li style="margin-bottom:6px;"><strong>Credentials</strong> &mdash; food hygiene certificate and public liability insurance. Within 48 hours.</li>
         <li><strong>Quality</strong> &mdash; a short cooking video for our culinary team. Within 72 hours.</li>
       </ol>
       <p style="margin:0;">Upload your documents now and we will start straight away.</p>`,
      { label: 'Upload documents', href: `${APP_URL}/become-a-chef/apply` },
    ),
  })
}

export async function sendStageApproved(args: {
  to: string
  name: string
  stageLabel: string
  remaining: number
}): Promise<void> {
  const body =
    args.remaining > 0
      ? `<p style="margin:0 0 14px;">Your <strong>${esc(args.stageLabel)}</strong> stage is approved.</p>
         <p style="margin:0;">${args.remaining} stage${args.remaining === 1 ? '' : 's'} to go before your profile goes live.</p>`
      : `<p style="margin:0;">Your <strong>${esc(args.stageLabel)}</strong> stage is approved. That was the last one.</p>`

  await send({
    to: args.to,
    subject: `${args.stageLabel} verification approved`,
    html: layout('One step closer', body, {
      label: 'View your progress',
      href: `${APP_URL}/become-a-chef/apply`,
    }),
  })
}

export async function sendStageRejected(args: {
  to: string
  name: string
  stageLabel: string
  reason: string
}): Promise<void> {
  await send({
    to: args.to,
    subject: `Action needed: ${args.stageLabel} verification`,
    html: layout(
      'We need something else from you',
      `<p style="margin:0 0 14px;">We could not approve your <strong>${esc(args.stageLabel)}</strong> stage yet.</p>
       <p style="margin:0 0 14px;padding:14px 16px;background:#fdf2f0;border-left:3px solid #F04E37;border-radius:6px;"><strong>What to fix:</strong><br>${esc(args.reason)}</p>
       <p style="margin:0;">Re-upload and we will review it again. Nothing else in your application is affected.</p>`,
      { label: 'Re-upload documents', href: `${APP_URL}/become-a-chef/apply` },
    ),
  })
}

export async function sendChefApproved(args: {
  to: string
  name: string
  profileUrl: string
}): Promise<void> {
  await send({
    to: args.to,
    subject: 'You are live on ChefMii Global',
    html: layout(
      'Verified. Your profile is live.',
      `<p style="margin:0 0 14px;">All three verification stages are approved, ${esc(args.name.split(' ')[0] ?? 'Chef')}. Your profile is now visible to guests searching for chefs.</p>
       <p style="margin:0 0 14px;">Two things to do now so you can get paid:</p>
       <ul style="margin:0 0 14px;padding-left:20px;">
         <li style="margin-bottom:6px;">Connect your bank through Stripe in your dashboard. Bookings cannot be paid out until this is done.</li>
         <li>Upload your first ChefTV video. Chefs who post get found more often.</li>
       </ul>
       <p style="margin:0;">Your public page: <a href="${args.profileUrl}" style="color:#F04E37;">${esc(args.profileUrl)}</a></p>`,
      { label: 'Open chef dashboard', href: `${APP_URL}/chef-dashboard` },
    ),
  })
}

export async function sendPayoutReleased(args: {
  to: string
  name: string
  amountFormatted: string
  bookingRef: string
}): Promise<void> {
  await send({
    to: args.to,
    subject: `Payout on the way: ${args.amountFormatted}`,
    html: layout(
      'Your payout has been released',
      `<p style="margin:0 0 14px;">We have released <strong>${esc(args.amountFormatted)}</strong> for booking ${esc(args.bookingRef)}.</p>
       <p style="margin:0;">Stripe typically lands funds in your bank within 1 to 2 business days.</p>`,
      { label: 'View earnings', href: `${APP_URL}/chef-dashboard` },
    ),
  })
}
