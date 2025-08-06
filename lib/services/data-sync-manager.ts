import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface SyncData {
  customers?: any[]
  orders?: any[]
  orderItems?: any[]
  documents?: any[]
  notifications?: any[]
  metadata?: {
    timestamp: string
    source: string
    operation: string
  }
}

interface SyncResult {
  success: boolean
  syncedRecords: number
  errors?: string[]
  timestamp: string
}

export class DataSyncManager {
  private supabase: SupabaseClient
  private syncQueue: SyncData[] = []
  private isSyncing = false
  private maxRetries = 3
  private baseDelay = 1000 // 1 second

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // Enqueue sync operations
  async queueSync(data: SyncData): Promise<void> {
    // Add metadata to sync data
    const enrichedData: SyncData = {
      ...data,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'logistics-app',
        operation: 'data-sync'
      }
    }

    this.syncQueue.push(enrichedData)
    console.log(`Sync operation queued. Queue length: ${this.syncQueue.length}`)
    
    await this.processQueue()
  }

  // Process sync queue with retry and backoff
  private async processQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...')
      return
    }

    this.isSyncing = true
    console.log(`Processing sync queue with ${this.syncQueue.length} items`)

    while (this.syncQueue.length > 0) {
      const syncData = this.syncQueue.shift()
      if (!syncData) continue

      try {
        const result = await this.performSync(syncData)
        console.log('Sync completed successfully:', result)
      } catch (error) {
        console.error('Sync operation failed:', error)
        await this.handleSyncError(error as Error, syncData)
      }
    }

    this.isSyncing = false
    console.log('Sync queue processing completed')
  }

  private async performSync(syncData: SyncData): Promise<SyncResult> {
    try {
      // For now, we'll implement direct Supabase operations
      // In a production environment, you might want to use Supabase Edge Functions
      const results: any[] = []
      let totalSyncedRecords = 0

      // Sync customers
      if (syncData.customers && syncData.customers.length > 0) {
        const { data: customerData, error: customerError } = await this.supabase
          .from('customers')
          .upsert(syncData.customers, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select()

        if (customerError) throw customerError
        results.push({ table: 'customers', records: customerData?.length || 0 })
        totalSyncedRecords += customerData?.length || 0
      }

      // Sync orders
      if (syncData.orders && syncData.orders.length > 0) {
        const { data: orderData, error: orderError } = await this.supabase
          .from('orders')
          .upsert(syncData.orders, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select()

        if (orderError) throw orderError
        results.push({ table: 'orders', records: orderData?.length || 0 })
        totalSyncedRecords += orderData?.length || 0
      }

      // Sync order items
      if (syncData.orderItems && syncData.orderItems.length > 0) {
        const { data: orderItemData, error: orderItemError } = await this.supabase
          .from('order_items')
          .upsert(syncData.orderItems, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select()

        if (orderItemError) throw orderItemError
        results.push({ table: 'order_items', records: orderItemData?.length || 0 })
        totalSyncedRecords += orderItemData?.length || 0
      }

      // Sync documents
      if (syncData.documents && syncData.documents.length > 0) {
        const { data: documentData, error: documentError } = await this.supabase
          .from('documents')
          .upsert(syncData.documents, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select()

        if (documentError) throw documentError
        results.push({ table: 'documents', records: documentData?.length || 0 })
        totalSyncedRecords += documentData?.length || 0
      }

      // Sync notifications
      if (syncData.notifications && syncData.notifications.length > 0) {
        const { data: notificationData, error: notificationError } = await this.supabase
          .from('notifications')
          .upsert(syncData.notifications, { 
            onConflict: 'external_id',
            ignoreDuplicates: false 
          })
          .select()

        if (notificationError) throw notificationError
        results.push({ table: 'notifications', records: notificationData?.length || 0 })
        totalSyncedRecords += notificationData?.length || 0
      }

      return {
        success: true,
        syncedRecords: totalSyncedRecords,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('Sync operation failed:', error)
      throw error
    }
  }

  private async handleSyncError(error: Error, syncData: SyncData, retryCount = 0): Promise<void> {
    if (retryCount < this.maxRetries) {
      const delay = Math.pow(2, retryCount) * this.baseDelay // Exponential backoff
      console.log(`Retrying sync operation in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      try {
        const result = await this.performSync(syncData)
        console.log('Retry successful:', result)
      } catch (retryError) {
        await this.handleSyncError(retryError as Error, syncData, retryCount + 1)
      }
    } else {
      // Log to error tracking service or store in failed sync queue
      console.error('Sync failed after max retries:', error)
      
      // Store failed sync data for manual review
      await this.logFailedSync(error, syncData)
      
      // Optionally send notification or alert
      await this.notifyFailedSync(error, syncData)
    }
  }

  private async logFailedSync(error: Error, syncData: SyncData): Promise<void> {
    try {
      await this.supabase
        .from('sync_failures')
        .insert({
          error_message: error.message,
          error_stack: error.stack,
          sync_data: syncData,
          failed_at: new Date().toISOString(),
          retry_count: this.maxRetries
        })
    } catch (logError) {
      console.error('Failed to log sync failure:', logError)
    }
  }

  private async notifyFailedSync(error: Error, syncData: SyncData): Promise<void> {
    try {
      // Create a notification for failed sync
      await this.supabase
        .from('notifications')
        .insert({
          type: 'error',
          message: `Data sync failed: ${error.message}`,
          details: {
            error: error.message,
            syncDataKeys: Object.keys(syncData),
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          read: false
        })
    } catch (notifyError) {
      console.error('Failed to create sync failure notification:', notifyError)
    }
  }

  // Get current queue status
  getQueueStatus(): { queueLength: number; isSyncing: boolean } {
    return {
      queueLength: this.syncQueue.length,
      isSyncing: this.isSyncing
    }
  }

  // Clear the sync queue (use with caution)
  clearQueue(): void {
    this.syncQueue = []
    console.log('Sync queue cleared')
  }

  // Force process queue (bypass isSyncing check)
  async forceProcessQueue(): Promise<void> {
    this.isSyncing = false
    await this.processQueue()
  }
}

// Create singleton instance
const syncManager = new DataSyncManager(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default syncManager
