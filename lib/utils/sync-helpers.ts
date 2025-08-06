import syncManager from '@/lib/services/data-sync-manager'

// Helper function to sync order data after creation/update
export async function syncOrderData(orderData: any) {
  try {
    await syncManager.queueSync({
      orders: [orderData],
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'order-management',
        operation: 'order-sync'
      }
    })
  } catch (error) {
    console.error('Failed to sync order data:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

// Helper function to sync customer data after creation/update
export async function syncCustomerData(customerData: any) {
  try {
    await syncManager.queueSync({
      customers: [customerData],
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'customer-management',
        operation: 'customer-sync'
      }
    })
  } catch (error) {
    console.error('Failed to sync customer data:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

// Helper function to sync document data after upload/processing
export async function syncDocumentData(documentData: any) {
  try {
    await syncManager.queueSync({
      documents: [documentData],
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'document-management',
        operation: 'document-sync'
      }
    })
  } catch (error) {
    console.error('Failed to sync document data:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

// Helper function to perform bulk sync of all data
export async function performBulkSync(data: {
  customers?: any[]
  orders?: any[]
  orderItems?: any[]
  documents?: any[]
  notifications?: any[]
}) {
  try {
    await syncManager.queueSync({
      ...data,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'bulk-sync',
        operation: 'bulk-data-sync'
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Bulk sync failed:', error)
    throw error
  }
}
