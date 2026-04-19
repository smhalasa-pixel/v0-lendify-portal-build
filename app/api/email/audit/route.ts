import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { renderAuditResultEmail, type AuditResultEmailData } from '@/lib/email-templates'

interface RequestBody extends AuditResultEmailData {
  cc?: string | string[]
  additionalRecipients?: string[]
}

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.agentEmail) {
    return NextResponse.json({ ok: false, error: 'agentEmail is required' }, { status: 400 })
  }
  if (typeof body.overallScore !== 'number') {
    return NextResponse.json({ ok: false, error: 'overallScore is required' }, { status: 400 })
  }

  const { subject, html, text } = renderAuditResultEmail(body)

  const to = body.additionalRecipients?.length
    ? [body.agentEmail, ...body.additionalRecipients]
    : body.agentEmail

  const result = await sendEmail({
    to,
    cc: body.cc,
    replyTo: body.evaluatorEmail,
    subject,
    html,
    text,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Failed to send email' }, { status: 502 })
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    mode: result.mode,
    previewBody: result.previewBody,
  })
}
