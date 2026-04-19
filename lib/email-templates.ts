/**
 * HTML email templates for audit results, task notifications, and coaching.
 * Kept inline so they can be rendered server-side with no build step.
 */

interface BaseTemplateOptions {
  title: string
  preheader?: string
  bodyHtml: string
  actionUrl?: string
  actionLabel?: string
  footer?: string
}

const BRAND_COLOR = '#0f172a' // slate-900
const ACCENT_COLOR = '#3b82f6' // blue-500
const MUTED_COLOR = '#64748b' // slate-500

function baseTemplate({
  title,
  preheader = '',
  bodyHtml,
  actionUrl,
  actionLabel,
  footer = 'Lendify Portal · This is an automated message, please do not reply directly.',
}: BaseTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.01em;">Lendify Portal</td>
                  <td align="right" style="color:#94a3b8;font-size:12px;">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;line-height:1.3;color:${BRAND_COLOR};">${escapeHtml(title)}</h1>
              <div style="font-size:14px;line-height:1.6;color:#334155;">${bodyHtml}</div>
              ${
                actionUrl && actionLabel
                  ? `<div style="margin-top:28px;"><a href="${actionUrl}" style="display:inline-block;background-color:${ACCENT_COLOR};color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:500;font-size:14px;">${escapeHtml(actionLabel)}</a></div>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
              <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.5;">${escapeHtml(footer)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function scoreBadgeColor(score: number): string {
  if (score >= 90) return '#16a34a' // green-600
  if (score >= 80) return '#2563eb' // blue-600
  if (score >= 70) return '#d97706' // amber-600
  return '#dc2626' // red-600
}

// ==========================================
// AUDIT RESULT EMAIL
// ==========================================

export interface AuditResultEmailData {
  agentName: string
  agentEmail: string
  evaluatorName: string
  evaluatorEmail?: string
  callDate: string
  callDuration?: number
  callType?: string
  clientName?: string
  overallScore: number
  scorecardType: string
  strengths?: string[]
  improvements?: string[]
  criticalFailures?: string[]
  notes?: string
  categoryScores?: { category: string; score: number; maxScore: number }[]
  acknowledgeUrl?: string
  disputeDeadline?: string
}

export function renderAuditResultEmail(data: AuditResultEmailData): { subject: string; html: string; text: string } {
  const scoreColor = scoreBadgeColor(data.overallScore)
  const rank = data.overallScore >= 90
    ? 'Excellent'
    : data.overallScore >= 80
    ? 'Meeting Expectations'
    : data.overallScore >= 70
    ? 'Needs Improvement'
    : 'Below Expectations'

  const body = `
    <p>Hi ${escapeHtml(data.agentName)},</p>
    <p>Your call from <strong>${escapeHtml(new Date(data.callDate).toLocaleDateString('en-US'))}</strong> has been evaluated by <strong>${escapeHtml(data.evaluatorName)}</strong>. Please review the results below.</p>

    <div style="margin:24px 0;padding:20px;background-color:#f8fafc;border-radius:8px;border-left:4px solid ${scoreColor};">
      <div style="font-size:12px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Overall Score</div>
      <div style="font-size:36px;font-weight:700;color:${scoreColor};line-height:1;">${data.overallScore.toFixed(1)}<span style="font-size:18px;color:${MUTED_COLOR};font-weight:500;"> / 100</span></div>
      <div style="margin-top:8px;font-size:13px;color:#334155;font-weight:500;">${rank} · ${escapeHtml(data.scorecardType)}</div>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:20px;font-size:13px;">
      <tr>
        <td style="padding:6px 0;color:${MUTED_COLOR};width:140px;">Call Date</td>
        <td style="padding:6px 0;color:#0f172a;font-weight:500;">${escapeHtml(new Date(data.callDate).toLocaleString('en-US'))}</td>
      </tr>
      ${data.callType ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Call Type</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${escapeHtml(data.callType)}</td></tr>` : ''}
      ${data.callDuration ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Duration</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${Math.floor(data.callDuration / 60)}m ${data.callDuration % 60}s</td></tr>` : ''}
      ${data.clientName ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Client</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${escapeHtml(data.clientName)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:${MUTED_COLOR};">Evaluator</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${escapeHtml(data.evaluatorName)}</td></tr>
    </table>

    ${
      data.categoryScores && data.categoryScores.length
        ? `<h3 style="margin:24px 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Score Breakdown</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${data.categoryScores
            .map(
              cat => `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${escapeHtml(cat.category)}</td>
                <td align="right" style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:${scoreBadgeColor((cat.score / cat.maxScore) * 100)};font-weight:600;">${cat.score} / ${cat.maxScore}</td>
              </tr>`
            )
            .join('')}
        </table>`
        : ''
    }

    ${
      data.strengths && data.strengths.length
        ? `<h3 style="margin:24px 0 12px;font-size:14px;font-weight:600;color:#16a34a;">Strengths</h3>
        <ul style="margin:0 0 16px;padding-left:20px;color:#334155;font-size:13px;line-height:1.7;">
          ${data.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>`
        : ''
    }

    ${
      data.improvements && data.improvements.length
        ? `<h3 style="margin:24px 0 12px;font-size:14px;font-weight:600;color:#d97706;">Areas for Improvement</h3>
        <ul style="margin:0 0 16px;padding-left:20px;color:#334155;font-size:13px;line-height:1.7;">
          ${data.improvements.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>`
        : ''
    }

    ${
      data.criticalFailures && data.criticalFailures.length
        ? `<div style="margin:16px 0;padding:16px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
          <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;color:#dc2626;">Critical Failures</h3>
          <ul style="margin:0;padding-left:20px;color:#991b1b;font-size:13px;line-height:1.7;">
            ${data.criticalFailures.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>`
        : ''
    }

    ${
      data.notes
        ? `<h3 style="margin:24px 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Evaluator Notes</h3>
        <div style="padding:14px 16px;background-color:#f8fafc;border-radius:6px;font-size:13px;line-height:1.6;color:#334155;white-space:pre-wrap;">${escapeHtml(data.notes)}</div>`
        : ''
    }

    ${
      data.disputeDeadline
        ? `<p style="margin-top:20px;font-size:13px;color:${MUTED_COLOR};">If you disagree with this evaluation, you may submit a dispute before <strong>${escapeHtml(new Date(data.disputeDeadline).toLocaleDateString('en-US'))}</strong>.</p>`
        : ''
    }
  `

  const html = baseTemplate({
    title: 'Your QA Evaluation Results',
    preheader: `Score: ${data.overallScore.toFixed(1)}/100 · ${rank}`,
    bodyHtml: body,
    actionUrl: data.acknowledgeUrl,
    actionLabel: data.acknowledgeUrl ? 'Acknowledge & View Details' : undefined,
  })

  const text = [
    `QA Evaluation Results`,
    ``,
    `Hi ${data.agentName},`,
    ``,
    `Your call from ${new Date(data.callDate).toLocaleDateString()} has been evaluated by ${data.evaluatorName}.`,
    ``,
    `Overall Score: ${data.overallScore.toFixed(1)}/100 (${rank})`,
    `Scorecard: ${data.scorecardType}`,
    ``,
    data.strengths?.length ? `Strengths:\n${data.strengths.map(s => `  - ${s}`).join('\n')}\n` : '',
    data.improvements?.length ? `Areas for Improvement:\n${data.improvements.map(s => `  - ${s}`).join('\n')}\n` : '',
    data.notes ? `Notes:\n${data.notes}\n` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    subject: `QA Evaluation Results — ${data.overallScore.toFixed(1)}/100 (${rank})`,
    html,
    text,
  }
}

// ==========================================
// TASK NOTIFICATION EMAIL
// ==========================================

export interface TaskEmailData {
  recipientName: string
  assignedByName: string
  taskTitle: string
  taskDescription?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  taskUrl?: string
  kind: 'assigned' | 'updated' | 'reminder' | 'overdue' | 'completed' | 'follow_up'
}

export function renderTaskEmail(data: TaskEmailData): { subject: string; html: string; text: string } {
  const priorityColor = {
    low: '#64748b',
    medium: '#3b82f6',
    high: '#d97706',
    urgent: '#dc2626',
  }[data.priority]

  const headlines = {
    assigned: 'A new task has been assigned to you',
    updated: 'A task you own has been updated',
    reminder: 'Reminder — you have a task due soon',
    overdue: 'A task assigned to you is overdue',
    completed: 'Your task has been marked complete',
    follow_up: 'New follow-up on a task',
  }

  const headline = headlines[data.kind]

  const body = `
    <p>Hi ${escapeHtml(data.recipientName)},</p>
    <p>${escapeHtml(headline)} by <strong>${escapeHtml(data.assignedByName)}</strong>.</p>

    <div style="margin:20px 0;padding:16px;border:1px solid #e2e8f0;border-radius:8px;border-left:4px solid ${priorityColor};">
      <div style="display:inline-block;padding:2px 8px;background-color:${priorityColor};color:#ffffff;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">${data.priority}</div>
      <div style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:8px;">${escapeHtml(data.taskTitle)}</div>
      ${data.taskDescription ? `<div style="font-size:13px;color:#475569;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.taskDescription)}</div>` : ''}
      ${data.dueDate ? `<div style="margin-top:12px;font-size:12px;color:${MUTED_COLOR};">Due: <strong style="color:#0f172a;">${escapeHtml(new Date(data.dueDate).toLocaleString('en-US'))}</strong></div>` : ''}
    </div>
  `

  const html = baseTemplate({
    title: headline,
    preheader: data.taskTitle,
    bodyHtml: body,
    actionUrl: data.taskUrl,
    actionLabel: data.taskUrl ? 'View Task' : undefined,
  })

  const text = `${headline}\n\n${data.taskTitle}\nPriority: ${data.priority}\n${data.dueDate ? `Due: ${new Date(data.dueDate).toLocaleString()}\n` : ''}${data.taskDescription ? `\n${data.taskDescription}\n` : ''}`

  return {
    subject: `[${data.priority.toUpperCase()}] ${headline}: ${data.taskTitle}`,
    html,
    text,
  }
}

// ==========================================
// RTA INFRACTION EMAIL
// ==========================================

export interface InfractionEmailData {
  agentName: string
  infractionType: string
  description: string
  severity: 'minor' | 'moderate' | 'major' | 'severe'
  occurredAt: string
  evidence?: string
  recordedBy: string
  acknowledgeUrl?: string
}

export function renderInfractionEmail(data: InfractionEmailData): { subject: string; html: string; text: string } {
  const severityColor = {
    minor: '#64748b',
    moderate: '#d97706',
    major: '#dc2626',
    severe: '#991b1b',
  }[data.severity]

  const body = `
    <p>Hi ${escapeHtml(data.agentName)},</p>
    <p>An attendance / schedule adherence infraction has been recorded on your record. Please review the details below and acknowledge.</p>

    <div style="margin:20px 0;padding:16px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
      <div style="display:inline-block;padding:2px 8px;background-color:${severityColor};color:#ffffff;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">${data.severity}</div>
      <div style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:8px;">${escapeHtml(data.infractionType)}</div>
      <div style="font-size:13px;color:#334155;line-height:1.6;">${escapeHtml(data.description)}</div>
      ${data.evidence ? `<div style="margin-top:10px;font-size:12px;color:${MUTED_COLOR};">Evidence: ${escapeHtml(data.evidence)}</div>` : ''}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:13px;">
      <tr><td style="padding:6px 0;color:${MUTED_COLOR};width:140px;">Occurred At</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${escapeHtml(new Date(data.occurredAt).toLocaleString('en-US'))}</td></tr>
      <tr><td style="padding:6px 0;color:${MUTED_COLOR};">Recorded By</td><td style="padding:6px 0;color:#0f172a;font-weight:500;">${escapeHtml(data.recordedBy)}</td></tr>
    </table>

    <p style="margin-top:20px;font-size:13px;color:${MUTED_COLOR};">If you believe this infraction was recorded in error, please contact your supervisor or respond to this email immediately.</p>
  `

  const html = baseTemplate({
    title: 'Attendance Infraction Recorded',
    preheader: `${data.severity.toUpperCase()} — ${data.infractionType}`,
    bodyHtml: body,
    actionUrl: data.acknowledgeUrl,
    actionLabel: data.acknowledgeUrl ? 'Acknowledge Infraction' : undefined,
  })

  const text = `Attendance Infraction\n\nHi ${data.agentName},\n\nAn infraction has been recorded: ${data.infractionType}\nSeverity: ${data.severity}\nOccurred: ${new Date(data.occurredAt).toLocaleString()}\nRecorded by: ${data.recordedBy}\n\n${data.description}${data.evidence ? `\n\nEvidence: ${data.evidence}` : ''}`

  return {
    subject: `[${data.severity.toUpperCase()}] Attendance Infraction — ${data.infractionType}`,
    html,
    text,
  }
}
