import { generateQRCode, generateDeliveryConfirmationUrl } from "./qr-code-utils"
import Mailgun from "mailgun.js"
import FormData from "form-data"
import { Buffer } from "buffer" // Import Buffer for handling binary data

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string // Added optional from field
  attachments?: Array<{
    filename: string
    content: string
    encoding?: string
    contentType?: string
  }>
}

interface DeliveryLinkEmailParams {
  orderId: string
  recipientName: string
  recipientEmail: string
  senderName: string
  companyName: string
  estimatedDelivery?: string
  token: string
}

interface DeliveryConfirmationEmailParams {
  orderId: string
  recipientName: string
  recipientEmail: string
  adminEmail: string
  designation: string
  timestamp: string
  signatureImageUrl: string
  orderDetailsUrl: string
  companyName: string
  supportEmail: string
}

interface SenderOrderCreatedEmailParams {
  orderId: string
  waybillNo: string
  senderName: string
  senderEmail: string
  recipientName: string
  recipientCompany: string
  estimatedDelivery?: string
  trackingUrl: string
  companyName: string
}

interface SenderDeliveryConfirmedEmailParams {
  orderId: string
  waybillNo: string
  senderName: string
  senderEmail: string
  recipientName: string
  recipientDesignation: string
  deliveryTimestamp: string
  signatureImageUrl: string
  deliveryProofUrl: string
  companyName: string
}

export const emailService = {
  /**
   * Sends an email using Mailgun.
   * Requires MAILGUN_API_KEY, MAILGUN_DOMAIN, and optionally MAILGUN_FROM_EMAIL environment variables.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailgun = new Mailgun(FormData)
      const mg = mailgun.client({
        username: "api", // Mailgun API username is typically 'api'
        key: process.env.MAILGUN_API_KEY!,
        // Uncomment and set url if you have an EU domain or custom endpoint
        // url: process.env.MAILGUN_API_URL || "https://api.mailgun.net",
      })

      const domain = process.env.MAILGUN_DOMAIN!

      if (!process.env.MAILGUN_API_KEY || !domain) {
        console.error(
          "Mailgun API key or domain is not configured. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.",
        )
        return false
      }

      const messageData: any = {
        from: options.from || process.env.MAILGUN_FROM_EMAIL || `TSW Smartlog <mailgun@${domain}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }

      if (options.attachments && options.attachments.length > 0) {
        const inlineAttachments: any[] = []
        const regularAttachments: any[] = []

        options.attachments.forEach((att) => {
          const dataBuffer = att.encoding === "base64" ? Buffer.from(att.content, "base64") : Buffer.from(att.content)
          const attachmentObject = {
            filename: att.filename,
            data: dataBuffer,
            contentType: att.contentType,
          }

          // Assuming attachments with 'qrcode' in filename are inline for CID embedding
          if (att.filename.includes("qrcode")) {
            inlineAttachments.push(attachmentObject)
          } else {
            regularAttachments.push(attachmentObject)
          }
        })

        if (inlineAttachments.length > 0) {
          messageData.inline = inlineAttachments
        }
        if (regularAttachments.length > 0) {
          messageData.attachment = regularAttachments
        }
      }

      const data = await mg.messages.create(domain, messageData)
      console.log("Mailgun response:", data)
      return true
    } catch (error) {
      console.error("Error sending email with Mailgun:", error)
      return false
    }
  },

  /**
   * Sends a delivery link email to the recipient
   */
  async sendDeliveryLinkEmail({
    orderId,
    recipientName,
    recipientEmail,
    senderName,
    companyName,
    estimatedDelivery,
    token,
  }: DeliveryLinkEmailParams): Promise<boolean> {
    try {
      // Generate the delivery confirmation URL
      const confirmationUrl = generateDeliveryConfirmationUrl(orderId, token)

      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(confirmationUrl)

      // Extract the base64 data from the data URL
      const qrCodeBase64 = qrCodeDataUrl.split(",")[1]

      // Create email HTML content
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${companyName}</h1>
            <h2 style="color: #555;">Your delivery is ready for confirmation</h2>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${recipientName},</p>
            
            <p>Your delivery from <strong>${senderName}</strong> (Order #${orderId}) is ready for confirmation.</p>
            
            ${estimatedDelivery ? `<p>Estimated delivery date: <strong>${estimatedDelivery}</strong></p>` : ""}
            
            <p>To confirm delivery, please scan the QR code below or click the link:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <img src="cid:qrcode.png" alt="QR Code for Delivery Confirmation" style="max-width: 200px; border: 1px solid #ddd;" />
              <p style="color: #777; font-size: 12px; margin-top: 10px;">
                <strong>Security Notice:</strong> Do not share this QR code with others.
              </p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${confirmationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Confirm Delivery
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

      // Send the email
      return await this.sendEmail({
        to: recipientEmail,
        subject: `Your delivery from ${companyName} is ready for confirmation`,
        html,
        attachments: [
          {
            filename: "qrcode.png", // Ensure filename matches cid in HTML
            content: qrCodeBase64,
            encoding: "base64",
            contentType: "image/png",
          },
        ],
      })
    } catch (error) {
      console.error("Error sending delivery link email:", error)
      return false
    }
  },

  /**
   * Sends confirmation emails to admin and recipient
   */
  async sendDeliveryConfirmationEmails({
    orderId,
    recipientName,
    recipientEmail,
    adminEmail,
    designation,
    timestamp,
    signatureImageUrl,
    orderDetailsUrl,
    companyName,
    supportEmail,
  }: DeliveryConfirmationEmailParams): Promise<boolean> {
    try {
      // Admin email
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${companyName}</h1>
            <h2 style="color: #555;">Order #${orderId} Delivered</h2>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>The order has been successfully delivered and confirmed by the recipient.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
              <p><strong>Recipient:</strong> ${recipientName}</p>
              <p><strong>Designation:</strong> ${designation}</p>
              <p><strong>Confirmation Time:</strong> ${timestamp}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Digital Signature:</strong></p>
              <img src="${signatureImageUrl}" alt="Digital Signature" style="max-width: 300px; border: 1px solid #ddd;" />
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${orderDetailsUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Order Details
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `

      // Recipient email
      const recipientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${companyName}</h1>
            <h2 style="color: #555;">Delivery Confirmation Receipt</h2>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${recipientName},</p>
            
            <p>Thank you for confirming the delivery of your order (#${orderId}).</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Recipient:</strong> ${recipientName}</p>
              <p><strong>Confirmation Time:</strong> ${timestamp}</p>
            </div>
            
            <p>This email serves as your delivery receipt. Please keep it for your records.</p>
            
            <p>If you have any questions or concerns, please contact our support team at ${supportEmail}.</p>
            
            <p>Thank you for choosing ${companyName}.</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `

      // Send emails in parallel
      const [adminEmailSent, recipientEmailSent] = await Promise.all([
        this.sendEmail({
          to: adminEmail,
          subject: `Order #${orderId} delivered to ${recipientName}`,
          html: adminHtml,
        }),
        this.sendEmail({
          to: recipientEmail,
          subject: `Delivery confirmation for Order #${orderId}`,
          html: recipientHtml,
        }),
      ])

      return adminEmailSent && recipientEmailSent
    } catch (error) {
      console.error("Error sending confirmation emails:", error)
      return false
    }
  },

  /**
   * Generates a preview of the delivery link email
   */
  async generateDeliveryLinkEmailPreview(params: DeliveryLinkEmailParams): Promise<string> {
    const confirmationUrl = generateDeliveryConfirmationUrl(params.orderId, params.token)
    const qrCodeDataUrl = await generateQRCode(confirmationUrl)

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333;">${params.companyName}</h1>
          <h2 style="color: #555;">Your delivery is ready for confirmation</h2>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Hello ${params.recipientName},</p>
          
          <p>Your delivery from <strong>${params.senderName}</strong> (Order #${params.orderId}) is ready for confirmation.</p>
          
          ${params.estimatedDelivery ? `<p>Estimated delivery date: <strong>${params.estimatedDelivery}</strong></p>` : ""}
          
          <p>To confirm delivery, please scan the QR code below or click the link:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrCodeDataUrl}" alt="QR Code for Delivery Confirmation" style="max-width: 200px; border: 1px solid #ddd;" />
            <p style="color: #777; font-size: 12px; margin-top: 10px;">
              <strong>Security Notice:</strong> Do not share this QR code with others.
            </p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Confirm Delivery
            </a>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Thank you,<br>${params.companyName} Team</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  },

  /**
   * Sends an order created notification to the sender
   */
  async sendSenderOrderCreatedEmail({
    orderId,
    waybillNo,
    senderName,
    senderEmail,
    recipientName,
    recipientCompany,
    estimatedDelivery,
    trackingUrl,
    companyName,
  }: SenderOrderCreatedEmailParams): Promise<boolean> {
    try {
      // Create email HTML content
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${companyName}</h1>
            <h2 style="color: #555;">Your order is ready for delivery</h2>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${senderName},</p>
            
            <p>Your order <strong>#${orderId}</strong> (Waybill: ${waybillNo}) has been created and is ready for delivery.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
              <p><strong>Recipient:</strong> ${recipientName}</p>
              <p><strong>Company:</strong> ${recipientCompany}</p>
              ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ""}
            </div>
            
            <p>The recipient will be notified to confirm delivery via QR code when the package is delivered.</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${trackingUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Track Order Status
              </a>
            </div>
            
            <p>Thank you for using our services.</p>
            
            <p>Best regards,<br>${companyName} Team</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `

      // Send the email
      return await this.sendEmail({
        to: senderEmail,
        subject: `Your order #${orderId} is ready for delivery`,
        html,
      })
    } catch (error) {
      console.error("Error sending sender order created email:", error)
      return false
    }
  },

  /**
   * Sends a delivery confirmation notification to the sender
   */
  async sendSenderDeliveryConfirmedEmail({
    orderId,
    waybillNo,
    senderName,
    senderEmail,
    recipientName,
    recipientDesignation,
    deliveryTimestamp,
    signatureImageUrl,
    deliveryProofUrl,
    companyName,
  }: SenderDeliveryConfirmedEmailParams): Promise<boolean> {
    try {
      // Create email HTML content
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${companyName}</h1>
            <h2 style="color: #555;">Order Delivered Successfully</h2>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Hello ${senderName},</p>
            
            <p>Your order <strong>#${orderId}</strong> (Waybill: ${waybillNo}) has been delivered and confirmed by the recipient.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
              <p><strong>Recipient:</strong> ${recipientName}</p>
              <p><strong>Designation:</strong> ${recipientDesignation}</p>
              <p><strong>Delivery Time:</strong> ${deliveryTimestamp}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Digital Signature:</strong></p>
              <img src="${signatureImageUrl}" alt="Digital Signature" style="max-width: 300px; border: 1px solid #ddd;" />
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${deliveryProofUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Full Delivery Proof
              </a>
            </div>
            
            <p>Thank you for using our services.</p>
            
            <p>Best regards,<br>${companyName} Team</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `

      // Send the email
      return await this.sendEmail({
        to: senderEmail,
        subject: `Order #${orderId} delivered to ${recipientName}`,
        html,
      })
    } catch (error) {
      console.error("Error sending sender delivery confirmed email:", error)
      return false
    }
  },

  /**
   * Generates a preview of the sender order created email
   */
  async generateSenderOrderCreatedEmailPreview(params: SenderOrderCreatedEmailParams): Promise<string> {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">${params.companyName}</h1>
        <h2 style="color: #555;">Your order is ready for delivery</h2>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Hello ${params.senderName},</p>
        
        <p>Your order <strong>#${params.orderId}</strong> (Waybill: ${params.waybillNo}) has been created and is ready for delivery.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
          <p><strong>Recipient:</strong> ${params.recipientName}</p>
          <p><strong>Company:</strong> ${params.recipientCompany}</p>
          ${params.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${params.estimatedDelivery}</p>` : ""}
        </div>
        
        <p>The recipient will be notified to confirm delivery via QR code when the package is delivered.</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="#" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Track Order Status
          </a>
        </div>
        
        <p>Thank you for using our services.</p>
        
        <p>Best regards,<br>${params.companyName} Team</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `
  },

  /**
   * Generates a preview of the sender delivery confirmed email
   */
  async generateSenderDeliveryConfirmedEmailPreview(params: SenderDeliveryConfirmedEmailParams): Promise<string> {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h1 style="color: #333;">${params.companyName}</h1>
        <h2 style="color: #555;">Order Delivered Successfully</h2>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Hello ${params.senderName},</p>
        
        <p>Your order <strong>#${params.orderId}</strong> (Waybill: ${params.waybillNo}) has been delivered and confirmed by the recipient.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #0070f3;">
          <p><strong>Recipient:</strong> ${params.recipientName}</p>
          <p><strong>Designation:</strong> ${params.recipientDesignation}</p>
          <p><strong>Delivery Time:</strong> ${params.deliveryTimestamp}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p><strong>Digital Signature:</strong></p>
          <img src="${params.signatureImageUrl}" alt="Digital Signature" style="max-width: 300px; border: 1px solid #ddd;" />
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="#" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Full Delivery Proof
          </a>
        </div>
        
        <p>Thank you for using our services.</p>
        
        <p>Best regards,<br>${params.companyName} Team</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `
  },
}
