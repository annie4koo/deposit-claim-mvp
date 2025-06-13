import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  try {
    const { to, subject, letterContent, tenantName } = await request.json()

    if (!resend) {
      console.log("[TEST MODE] Email would be sent:", { to, subject })
      return NextResponse.json({ 
        success: true, 
        message: "Test mode: Email simulation successful" 
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Security Deposit Return Demand Letter</h2>
          <p>Dear Landlord,</p>
          <p>This is a formal demand letter from ${tenantName} regarding the return of security deposit.</p>
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff;">
            <pre style="white-space: pre-wrap; font-family: inherit;">${letterContent}</pre>
          </div>
          <p>This letter was generated using the Security Deposit Recovery Tool.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
} 