// Sends the magic sign-in link via Resend (https://resend.com).
// Swap this one function to change email providers.
const sendMagicLinkEmail = async (to, magicUrl) => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
  const from =
    process.env.MAGIC_LINK_FROM || 'JEFFGOLDBLUMLE <noreply@jeffgoldblumle.com>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Your JEFFGOLDBLUMLE ad-free sign-in link',
      text: `Open this link on the device where you want ad-free access:\n\n${magicUrl}\n\nThe link expires in 15 minutes. If you didn't request it, you can ignore this email.`,
      html: [
        '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">',
        '<h2 style="margin:0 0 16px">Your ad-free sign-in link</h2>',
        '<p style="margin:0 0 24px;color:#444">Open this on the device where you want the ad-free experience:</p>',
        `<p style="margin:0 0 24px"><a href="${magicUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:6px">Activate ad-free access</a></p>`,
        '<p style="margin:0;color:#888;font-size:13px">The link expires in 15 minutes. If you didn&rsquo;t request it, you can ignore this email.</p>',
        '</div>',
      ].join(''),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

module.exports = { sendMagicLinkEmail }
