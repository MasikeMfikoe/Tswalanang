import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, userSurname, temporaryPassword, companyName, isClientUser } = await request.json()

    // Validate required fields
    if (!userEmail || !userName || !temporaryPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate welcome email content
    const subject = isClientUser
      ? `Welcome to TSW Smartlog - Client Portal Access`
      : `Welcome to TSW Smartlog - Your Account is Ready`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333;">Welcome to TSW Smartlog</h1>
          ${
            isClientUser
              ? `<h2 style="color: #7c3aed;">Client Portal Access</h2>`
              : `<h2 style="color: #0070f3;">Your Account is Ready</h2>`
          }
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Hello ${userName} ${userSurname},</p>
          
          ${
            isClientUser
              ? `
            <p>Your client portal account has been created for <strong>${companyName}</strong>. You now have access to track your shipments and manage your orders.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <h3 style="margin: 0 0 10px 0; color: #7c3aed;">What you can do:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>View your order status and history</li>
                <li>Track shipments in real-time</li>
                <li>Download invoices and documents</li>
                <li>Receive delivery confirmations</li>
              </ul>
            </div>
          `
              : `
            <p>Your TSW Smartlog account has been created and you're ready to start managing logistics operations.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
              <h3 style="margin: 0 0 10px 0; color: #0070f3;">Your Access Includes:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Dashboard and analytics</li>
                <li>Order management</li>
                <li>Customer management</li>
                <li>Document handling</li>
                <li>Shipment tracking</li>
              </ul>
            </div>
          `
          }
          
          <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border: 1px solid #ffeaa7; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Your Login Credentials:</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${temporaryPassword}</code></p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
              <strong>Important:</strong> Please change your password after your first login.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://your-app-url.com"}/login" 
               style="background-color: ${isClientUser ? "#7c3aed" : "#0070f3"}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              ${isClientUser ? "Access Client Portal" : "Login to TSW Smartlog"}
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>TSW Smartlog Team</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>TSW Smartlog - Smart Logistics Management</p>
        </div>
      </div>
    `

    // Send the email
    const emailSent = await emailService.sendEmail({
      to: userEmail,
      subject,
      html,
    })

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
      })
    } else {
      return NextResponse.json(
        {
          error: "Failed to send welcome email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
