'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react'

interface EstimateDebugInfo {
  tableExists: boolean
  recordCount: number
  sampleRecords: any[]
  permissions: {
    canSelect: boolean
    canInsert: boolean
    canUpdate: boolean
    canDelete: boolean
  }
  error?: string
}

export default function DebugEstimatesPage() {
  const [debugInfo, setDebugInfo] = useState<EstimateDebugInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-estimates-connection')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Error fetching debug info:', error)
      setDebugInfo({
        tableExists: false,
        recordCount: 0,
        sampleRecords: [],
        permissions: {
          canSelect: false,
          canInsert: false,
          canUpdate: false,
          canDelete: false
        },
        error: 'Failed to fetch debug information'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Estimates Debug Information</h1>
        <Button onClick={fetchDebugInfo} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Table Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Table Exists</span>
              <Badge variant={debugInfo?.tableExists ? 'default' : 'destructive'}>
                {debugInfo?.tableExists ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <AlertCircle className="mr-1 h-3 w-3" />
                )}
                {debugInfo?.tableExists ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Record Count</span>
              <Badge variant="outline">
                {debugInfo?.recordCount || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {debugInfo?.permissions && Object.entries(debugInfo.permissions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{key.replace('can', '')}</span>
                <Badge variant={value ? 'default' : 'destructive'}>
                  {value ? (
                    <CheckCircle className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertCircle className="mr-1 h-3 w-3" />
                  )}
                  {value ? 'Allowed' : 'Denied'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {debugInfo?.error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{debugInfo.error}</p>
          </CardContent>
        </Card>
      )}

      {debugInfo?.sampleRecords && debugInfo.sampleRecords.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sample Records</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(debugInfo.sampleRecords, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
