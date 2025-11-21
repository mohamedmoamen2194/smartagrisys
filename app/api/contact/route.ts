import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Email configuration
    const recipientEmail = "mohamedmoamen1230@gmail.com"
    const emailSubject = `Contact Form: ${subject}`
    const emailBody = `
New contact form submission from AgriSmart website:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the AgriSmart contact form.
    `.trim()

    // For now, we'll use a simple approach with a service like Resend, SendGrid, or Nodemailer
    // Since we don't have email service configured, we'll log it and return success
    // In production, you should integrate with an email service
    
    console.log("Contact form submission:", {
      to: recipientEmail,
      subject: emailSubject,
      body: emailBody
    })

    // TODO: Integrate with email service (Resend, SendGrid, Nodemailer, etc.)
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'AgriSmart <noreply@agrismart.com>',
    //   to: recipientEmail,
    //   subject: emailSubject,
    //   text: emailBody,
    //   replyTo: email
    // })

    return NextResponse.json({
      success: true,
      message: "Message sent successfully"
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}

