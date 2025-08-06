import { useState, useCallback } from 'react'

interface SyncStatus {
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
}

interface SyncData {
  customers?: any[]
  orders?: any[]
  orderItems?: any[]
  documents?: any[]
  notifications?: any[]
}

export function useDataSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    error: null,
    lastSyncTime: null
  })

  const triggerSync = useCallback(async (data: SyncData) => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/data-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sync failed')
      }

      const result = await response.json()
      
      setSyncStatus({
        isLoading: false,
        error: null,
        lastSyncTime: new Date().toISOString()
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error'
      setSyncStatus({
        isLoading: false,
        error: errorMessage,
        lastSyncTime: null
      })
      throw error
    }
  }, [])

  const getSyncStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/data-sync')
      if (!response.ok) {
        throw new Error('Failed to get sync status')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to get sync status:', error)
      return null
    }
  }, [])

  return {
    syncStatus,
    triggerSync,
    getSyncStatus
  }
}
