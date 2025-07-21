import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuditTrailContent } from "@/components/AuditTrailContent"

export default function AuditTrailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Audit Trail</h1>
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>System Activity Log</CardTitle>
            <CardDescription>View all system activities and user actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <AuditTrailContent />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
