interface AuditLogEntry {
  user_id?: string
  action: string
  module: string
  record_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export class AuditLogger {
  private static async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      const response = await fetch("/api/audit-trail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        console.error("Failed to log audit event:", await response.text())
      }
    } catch (error) {
      console.error("Error logging audit event:", error)
    }
  }

  // User Management Events
  static async logUserLogin(userId: string, userEmail: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      user_id: userId,
      action: "login",
      module: "user_management",
      details: { email: userEmail },
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }

  static async logUserLogout(userId: string, userEmail: string, ipAddress?: string, userAgent?: string) {
    await this.logEvent({
      user_id: userId,
      action: "logout",
      module: "user_management",
      details: { email: userEmail },
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }

  static async logUserCreated(createdByUserId: string, newUserId: string, userData: any) {
    await this.logEvent({
      user_id: createdByUserId,
      action: "create",
      module: "user_management",
      record_id: newUserId,
      details: {
        created_user: {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          role: userData.role,
          department: userData.department,
        },
      },
    })
  }

  static async logUserUpdated(updatedByUserId: string, targetUserId: string, oldData: any, newData: any) {
    await this.logEvent({
      user_id: updatedByUserId,
      action: "update",
      module: "user_management",
      record_id: targetUserId,
      details: {
        old_data: oldData,
        new_data: newData,
        changed_fields: Object.keys(newData),
      },
    })
  }

  static async logUserDeleted(deletedByUserId: string, targetUserId: string, userData: any) {
    await this.logEvent({
      user_id: deletedByUserId,
      action: "delete",
      module: "user_management",
      record_id: targetUserId,
      details: {
        deleted_user: {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          role: userData.role,
        },
      },
    })
  }

  // Order Management Events
  static async logOrderCreated(userId: string, orderId: string, orderData: any) {
    await this.logEvent({
      user_id: userId,
      action: "create",
      module: "order_management",
      record_id: orderId,
      details: {
        po_number: orderData.poNumber,
        supplier: orderData.supplier,
        importer: orderData.importer,
        status: orderData.status,
      },
    })
  }

  static async logOrderUpdated(userId: string, orderId: string, oldData: any, newData: any) {
    await this.logEvent({
      user_id: userId,
      action: "update",
      module: "order_management",
      record_id: orderId,
      details: {
        old_data: oldData,
        new_data: newData,
        changed_fields: Object.keys(newData),
      },
    })
  }

  static async logOrderDeleted(userId: string, orderId: string, orderData: any) {
    await this.logEvent({
      user_id: userId,
      action: "delete",
      module: "order_management",
      record_id: orderId,
      details: {
        po_number: orderData.poNumber,
        supplier: orderData.supplier,
        importer: orderData.importer,
      },
    })
  }

  // Customer Management Events
  static async logCustomerCreated(userId: string, customerId: string, customerData: any) {
    await this.logEvent({
      user_id: userId,
      action: "create",
      module: "customer_management",
      record_id: customerId,
      details: {
        name: customerData.name,
        email: customerData.email,
        contact_person: customerData.contact_person,
      },
    })
  }

  static async logCustomerUpdated(userId: string, customerId: string, oldData: any, newData: any) {
    await this.logEvent({
      user_id: userId,
      action: "update",
      module: "customer_management",
      record_id: customerId,
      details: {
        old_data: oldData,
        new_data: newData,
        changed_fields: Object.keys(newData),
      },
    })
  }

  static async logCustomerDeleted(userId: string, customerId: string, customerData: any) {
    await this.logEvent({
      user_id: userId,
      action: "delete",
      module: "customer_management",
      record_id: customerId,
      details: {
        name: customerData.name,
        email: customerData.email,
      },
    })
  }

  // Document Management Events
  static async logDocumentUploaded(userId: string, documentId: string, documentData: any) {
    await this.logEvent({
      user_id: userId,
      action: "upload",
      module: "document_management",
      record_id: documentId,
      details: {
        file_name: documentData.fileName,
        document_type: documentData.documentType,
        file_size: documentData.fileSize,
        order_id: documentData.orderId,
      },
    })
  }

  static async logDocumentDeleted(userId: string, documentId: string, documentData: any) {
    await this.logEvent({
      user_id: userId,
      action: "delete",
      module: "document_management",
      record_id: documentId,
      details: {
        file_name: documentData.fileName,
        document_type: documentData.documentType,
        order_id: documentData.orderId,
      },
    })
  }

  // Estimate Management Events
  static async logEstimateCreated(userId: string, estimateId: string, estimateData: any) {
    await this.logEvent({
      user_id: userId,
      action: "create",
      module: "estimate_management",
      record_id: estimateId,
      details: {
        display_id: estimateData.display_id,
        customer_name: estimateData.customer_name,
        freight_type: estimateData.freight_type,
        total_amount: estimateData.total_amount,
        status: estimateData.status,
      },
    })
  }

  static async logEstimateUpdated(userId: string, estimateId: string, oldData: any, newData: any) {
    await this.logEvent({
      user_id: userId,
      action: "update",
      module: "estimate_management",
      record_id: estimateId,
      details: {
        old_data: oldData,
        new_data: newData,
        changed_fields: Object.keys(newData),
      },
    })
  }

  static async logEstimateDeleted(userId: string, estimateId: string, estimateData: any) {
    await this.logEvent({
      user_id: userId,
      action: "delete",
      module: "estimate_management",
      record_id: estimateId,
      details: {
        display_id: estimateData.display_id,
        customer_name: estimateData.customer_name,
        total_amount: estimateData.total_amount,
      },
    })
  }

  // API Key Management Events
  static async logApiKeyCreated(userId: string, keyId: string, keyData: any) {
    await this.logEvent({
      user_id: userId,
      action: "create",
      module: "api_key_management",
      record_id: keyId,
      details: {
        key_name: keyData.name,
        permissions: keyData.permissions,
      },
    })
  }

  // Shipment Tracking Events
  static async logShipmentManualUpdate(userId: string, shipmentId: string, updateData: any) {
    await this.logEvent({
      user_id: userId,
      action: "manual_update",
      module: "shipment_tracking",
      record_id: shipmentId,
      details: {
        container_number: updateData.containerNumber,
        booking_reference: updateData.bookingReference,
        new_status: updateData.status,
        location: updateData.location,
      },
    })
  }

  static async logShipmentWebhookUpdate(shipmentId: string, updateData: any) {
    await this.logEvent({
      action: "webhook_update",
      module: "shipment_tracking",
      record_id: shipmentId,
      details: {
        shipping_line: updateData.shippingLine,
        container_number: updateData.containerNumber,
        booking_reference: updateData.bookingReference,
        new_status: updateData.status,
        previous_status: updateData.previousStatus,
        location: updateData.location,
        source: "webhook",
      },
    })
  }

  // Courier Order Events
  static async logCourierOrderCreated(userId: string, orderId: string, orderData: any) {
    await this.logEvent({
      user_id: userId,
      action: "create",
      module: "courier_management",
      record_id: orderId,
      details: {
        waybill_no: orderData.waybill_no,
        sender: orderData.sender,
        receiver: orderData.receiver,
        service_type: orderData.service_type,
      },
    })
  }

  static async logCourierOrderUpdated(userId: string, orderId: string, oldData: any, newData: any) {
    await this.logEvent({
      user_id: userId,
      action: "update",
      module: "courier_management",
      record_id: orderId,
      details: {
        waybill_no: oldData.waybill_no,
        old_data: oldData,
        new_data: newData,
        changed_fields: Object.keys(newData),
      },
    })
  }

  // System Events
  static async logSystemEvent(action: string, module: string, details: any, userId?: string) {
    await this.logEvent({
      user_id: userId,
      action,
      module,
      details,
    })
  }
}
