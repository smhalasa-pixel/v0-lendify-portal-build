import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { renderTaskEmail, type TaskEmailData } from '@/lib/email-templates'

interface RequestBody extends TaskEmailData {
  recipientEmail: string
  cc?: string | string[]
}

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.recipientEmail) {
    return NextResponse.json({ ok: false, error: 'recipientEmail is required' }, { status: 400 })
  }

  const { subject, html, text } = renderTaskEmail(body)

  const result = await sendEmail({
    to: body.recipientEmail,
    cc: body.cc,
    subject,
    html,
    text,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Failed to send email' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, id: result.id, mode: result.mode, previewBody: result.previewBody })
}
