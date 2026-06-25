import express from 'express'
import { Resend } from 'resend'

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    await resend.emails.send({
      from: 'Manzil Noon <onboarding@resend.dev>',
      to: 'Manzilnoon@hotmail.com',
      subject: `New Message: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16166B;">New Contact Form Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #5a5a7a; font-size: 14px;">Name</td>
              <td style="padding: 8px 0; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5a5a7a; font-size: 14px;">Email</td>
              <td style="padding: 8px 0; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5a5a7a; font-size: 14px;">Subject</td>
              <td style="padding: 8px 0; font-size: 14px;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #F5F0E6; border-radius: 4px;">
            <p style="color: #5a5a7a; font-size: 13px; margin: 0 0 8px;">Message</p>
            <p style="font-size: 14px; margin: 0; line-height: 1.6;">${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #C4AE96;">
            Sent from Manzil Noon contact form — منزل نون
          </p>
        </div>
      `
    })

    res.json({ message: 'Message sent successfully' })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router