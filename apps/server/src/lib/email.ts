import { Resend } from 'resend'

const resend = process.env['RESEND_API_KEY'] ? new Resend(process.env['RESEND_API_KEY']) : null

export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log('--- [MOCK EMAIL] ---')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${html}`)
    console.log('--------------------')
    return
  }

  try {
    await resend.emails.send({
      from: 'Dev-Sync <notifications@devedit.app>',
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('[EmailService] Failed to send email:', err)
  }
}
