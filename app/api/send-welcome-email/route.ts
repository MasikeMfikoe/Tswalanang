import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, userSurname, temporaryPassword, companyName, isClientUser } = await request.json()

    const subject = isClientUser ? `Welcome to ${companyName} Client Portal!` : `Welcome to TSW Smartlog, ${userName}!`

    const htmlContent = isClientUser
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Welcome to ${companyName} Client Portal!</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${userName} ${userSurname},</p>
            <p>Welcome to the ${companyName} Client Portal! You can now log in to manage your orders and track shipments.</p>
            <p>Your login credentials are:</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            <p>Please log in and change your password as soon as possible.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Go to Client Portal
              </a>
            </div>
            <p>If you have any questions, please contact our support team.</p>
            <p>Thank you,<br>${companyName} Team</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Welcome to TSW Smartlog!</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${userName} ${userSurname},</p>
            <p>Welcome to TSW Smartlog! Your account has been created.</p>
            <p>Your login credentials are:</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            <p>Please log in and change your password as soon as possible.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Go to TSW Smartlog
              </a>
            </div>
            <p>If you have any questions, please contact your administrator.</p>
            <p>Thank you,<br>TSW Smartlog Team</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `

    const emailSent = await emailService.sendEmail({
      to: userEmail,
      subject: subject,
      html: htmlContent,
    })

    if (emailSent) {
      return NextResponse.json({ message: "Welcome email sent successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Failed to send welcome email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in send-welcome-email API route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
