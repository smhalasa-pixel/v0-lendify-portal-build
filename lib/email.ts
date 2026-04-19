/**
 * Unified email sending utility.
 *
 * Uses Resend when RESEND_API_KEY is present, otherwise falls back to
 * a preview/log-only mode so the app keeps working in demo environments.
 *
 * To enable real sending:
 *   1. Set RESEND_API_KEY in project env vars
 *   2. Set RESEND_FROM_EMAIL (e.g. "Lendify QA <qa@yourdomain.com>")
 *   3. Verify your sending domain in Resend dashboard
 */

export interface EmailAttachment {
  filename: string
  content: string // base64 or plain text
  contentType?: string
}

export interface SendEmailInput {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  from?: string
}

export interface SendEmailResult {
  ok: boolean
  id?: string
  mode: 'live' | 'preview'
  error?: string
  previewBody?: string
}

const DEFAULT_FROM = 'Lendify Portal <onboarding@resend.dev>'

function getFromAddress(override?: string): string {
  if (override) return override
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM
}

/**
 * Send an email via Resend. If no API key is configured, the email is logged
 * and returned as a preview so dev/demo flows still succeed.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = getFromAddress(input.from)

  // Preview mode — no API key, return success with a preview body
  if (!apiKey) {
    const recipients = Array.isArray(input.to) ? input.to.join(', ') : input.to
    const preview = [
      '================ EMAIL PREVIEW (no RESEND_API_KEY set) ================',
      `From:    ${from}`,
      `To:      ${recipients}`,
      input.cc ? `Cc:      ${Array.isArray(input.cc) ? input.cc.join(', ') : input.cc}` : null,
      input.replyTo ? `ReplyTo: ${input.replyTo}` : null,
      `Subject: ${input.subject}`,
      '',
      input.text || stripHtml(input.html),
      input.attachments?.length ? `\n[Attachments: ${input.attachments.map(a => a.filename).join(', ')}]` : '',
      '=====================================================================',
    ]
      .filter(Boolean)
      .join('\n')

    console.log('[v0] Email preview (set RESEND_API_KEY to send for real):\n' + preview)
    return { ok: true, mode: 'preview', previewBody: preview, id: `preview_${Date.now()}` }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        cc: input.cc ? (Array.isArray(input.cc) ? input.cc : [input.cc]) : undefined,
        bcc: input.bcc ? (Array.isArray(input.bcc) ? input.bcc : [input.bcc]) : undefined,
        reply_to: input.replyTo,
        subject: input.subject,
        html: input.html,
        text: input.text,
        attachments: input.attachments,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[v0] Resend API error:', response.status, errorText)
      return { ok: false, mode: 'live', error: errorText }
    }

    const data = await response.json()
    return { ok: true, mode: 'live', id: data.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log('[v0] Email send failed:', message)
    return { ok: false, mode: 'live', error: message }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
